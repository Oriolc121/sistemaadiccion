const mysql = require('mysql');


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  //password: 'contraseña',
  database: 'servertest',
});

const ALCOHOL_ITEM_NAMES = ["Cerveza", "Vino", "Whisky"]; // Nombres de los items que representan el alcohol
const MAX_ALCOHOL_LEVEL = 10; // Nivel máximo de adicción al alcohol

function onPlayerUseItem(player, itemName, amount) {
  if (ALCOHOL_ITEM_NAMES.includes(itemName)) {
    db.query(`SELECT * FROM player_alcohol WHERE player_id = ${player.id}`, (err, rows) => {
      if (err) throw err;
      if (rows.length > 0) {
        // El jugador ya tiene un registro de adicción al alcohol en la base de datos
        let alcoholLevel = rows[0].alcohol_level;
        let lastAlcoholConsumptionTime = new Date().getTime();
        alcoholLevel = Math.min(alcoholLevel + amount, MAX_ALCOHOL_LEVEL);
        player.notify(`Te has bebido ${amount} trago(s) de ${itemName}. ¡Cuidado con pasarte!`);
        db.query(`UPDATE player_alcohol SET last_consumption_time = ${lastAlcoholConsumptionTime}, alcohol_level = ${alcoholLevel} WHERE player_id = ${player.id}`);
      } else {
        // El jugador no tiene un registro de adicción al alcohol en la base de datos
        let lastAlcoholConsumptionTime = new Date().getTime();
        let alcoholLevel = Math.min(amount, MAX_ALCOHOL_LEVEL);
        player.notify(`Te has bebido ${amount} trago(s) de ${itemName}. ¡Cuidado con pasarte!`);
        db.query(`INSERT INTO player_alcohol (player_id, last_consumption_time, alcohol_level) VALUES (${player.id}, ${lastAlcoholConsumptionTime}, ${alcoholLevel})`);
      }
    });
  }
}
// Comando que he hecho de ejemplo para la lspd (no testeado)
mp.events.addCommand('lvlalcohol', (player, fullText, targetPlayerId) => {
    // Comprobamos si el jugador tiene el trabajo de LSPD
    if (player.job !== 'lspd') {
      player.outputChatBox('Debes ser miembro del departamento de policía para usar este comando.');
      return;
    }
  
  
    if (!targetPlayerId || isNaN(targetPlayerId)) {
      player.outputChatBox('Uso: /lvlalcohol [ID del jugador]');
      return;
    }
  
    const targetPlayer = mp.players.at(parseInt(targetPlayerId));
    if (!targetPlayer) {
      player.outputChatBox('No se ha encontrado un jugador con ese ID.');
      return;
    }
  
    
    const distance = player.dist(targetPlayer.position);
    if (distance > 5) {
      player.outputChatBox('El jugador objetivo está demasiado lejos.');
      return;
    }
  
    
    if (player.id === targetPlayer.id) {
      player.outputChatBox('No puedes usar este comando para obtener tu propio nivel de adicción al alcohol.');
      return;
    }
  
    
    db.query(`SELECT alcohol_level FROM player_alcohol WHERE player_id = ${targetPlayer.id}`, (err, rows) => {
      if (err) throw err;
      if (rows.length > 0) {
        const alcoholLevel = rows[0].alcohol_level;
        player.outputChatBox(`El jugador ${targetPlayer.name} tiene un nivel de adicción al alcohol de ${alcoholLevel}/${MAX_ALCOHOL_LEVEL}`);
      } else {
        player.outputChatBox(`El jugador ${targetPlayer.name} no tiene un registro de adicción al alcohol en la base de datos.`);
      }
    });
  });

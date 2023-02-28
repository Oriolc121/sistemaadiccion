const mysql = require('mysql');

// Crear una conexión a la base de datos
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
const MAX_DISTANCE_TO_CHECK_ALCOHOL_LEVEL = 5; // Distancia máxima para verificar el nivel de adicción al alcohol de un jugador

function onPlayerCommand(command) {
  const args = command.split(' ');
  if (args.length === 2 && args[0] === '/lvlalcohol') {
    const targetPlayerId = parseInt(args[1]);
    if (!isNaN(targetPlayerId)) {
      const player = mp.players.local;
      if (player.id !== targetPlayerId) {
        const targetPlayer = mp.players.atRemoteId(targetPlayerId);
        if (targetPlayer) {
          const distance = player.dist(targetPlayer.position);
          if (distance <= MAX_DISTANCE_TO_CHECK_ALCOHOL_LEVEL) {
            const job = player.getVariable('job');
            if (job === 'lspd') {
              db.query(`SELECT alcohol_level FROM player_alcohol WHERE player_id = ${targetPlayerId}`, (err, rows) => {
                if (err) throw err;
                if (rows.length > 0) {
                  const alcoholLevel = rows[0].alcohol_level;
                  player.outputChatBox(`El nivel de adicción al alcohol de ${targetPlayer.name} es ${alcoholLevel}/${MAX_ALCOHOL_LEVEL}`);
                } else {
                  player.outputChatBox(`${targetPlayer.name} no tiene registro de adicción al alcohol.`);
                }
              });
            } else {
              player.outputChatBox(`Solo los miembros del LSPD pueden verificar el nivel de adicción al alcohol de otros jugadores.`);
            }
          } else {
            player.outputChatBox(`No estás lo suficientemente cerca de ${targetPlayer.name} para verificar su nivel de adicción al alcohol.`);
          }
        } else {
          player.outputChatBox(`El jugador con ID ${targetPlayerId} no está conectado.`);
        }
      } else {
        player.outputChatBox(`No puedes verificar tu propio nivel de adicción al alcohol.`);
      }
    } else {
      player.outputChatBox(`Syntax: /lvlalcohol [ID]`);
    }
  }
}

CREATE TABLE `player_alcohol` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `player_id` int(11) NOT NULL,
  `last_consumption_time` bigint(20) NOT NULL,
  `alcohol_level` int(11) NOT NULL DEFAULT '0'
   PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

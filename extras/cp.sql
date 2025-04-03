CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `nodelogin`;

CREATE TABLE IF NOT EXISTS `accounts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test', 'test', 'test@test.com');
INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (2, 'Genesis', '12345', 'a21490066@itmexicali.edu.mx');


select * 
from accounts;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '12345';
FLUSH PRIVILEGES;

/* -------------------------------------------------------------- */
use nodelogin;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (3, 'alberto', '12345', 'alberto@gmail.com');

ALTER TABLE `accounts` ADD `rol` VARCHAR(20) DEFAULT 'user';

UPDATE accounts
SET rol = 'admin'
WHERE id = 2;

SELECT * FROM accounts;
/****************************************/
use nodelogin;

INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (3, 'alberto', '12345', 'alberto@gmail.com');

ALTER TABLE `accounts` ADD `rol` VARCHAR(20) DEFAULT 'usuario';

UPDATE accounts
SET rol = 'admin'
WHERE id = 2;

SELECT * FROM accounts;

ALTER TABLE accounts ADD COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user';

UPDATE accounts SET role = 'admin' WHERE id = 2;
SELECT * FROM accounts;

/* Usuarios de prueba nuevos*/
insert into `accounts` (`id`, `username`, `password`, `email`, `role`) Values (4, 'adrian', 'bazan', 'bazan@reconext.com', 'admin');
insert into `accounts` (`id`, `username`, `password`, `email`, `role`) Values (5, 'fernando', 'fer', 'fernando@reconext.com', 'user');

SELECT * FROM accounts;
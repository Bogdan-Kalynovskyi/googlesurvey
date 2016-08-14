<?php

include '../settings/settings.php';

mysql_connect($db_host, $db_user, $db_pass, TRUE);
if (!mysql_select_db($db_name)) {
    trigger_error(mysql_error());
    die;
}


$query = <<<'EOD'

DROP TABLE IF EXISTS `surveys`;
DROP TABLE IF EXISTS `tags`;
DROP TABLE IF EXISTS `terms`;
DROP TABLE IF EXISTS `answers`;


CREATE TABLE IF NOT EXISTS `surveys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_google_id` varchar(32) NOT NULL,
  `user_google_id` varchar(32) NOT NULL,
  `question` text NOT NULL,
  `total` int NOT NULL,
  `created` int NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `survey_google_id` (`survey_google_id`),
  INDEX `user_google_id` (`user_google_id`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;


CREATE TABLE IF NOT EXISTS `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `tag` varchar(255) NOT NULL,
  `count` int NOT NULL,
  `fin_count` int NOT NULL,
  `synonyms` text NOT NULL,
  `syn_count` text NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `tag` (`tag`(32)),
  INDEX `survey_id` (`survey_id`),
  INDEX `fin_count` (`fin_count`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;


CREATE TABLE IF NOT EXISTS `terms` (
  `survey_id` int NOT NULL,
  `term` varchar(255) NOT NULL,
  `count` int NOT NULL,
  INDEX `term` (`term`(32)),
  INDEX `survey_id` (`survey_id`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;


CREATE TABLE IF NOT EXISTS `answers` (
  `survey_id` int NOT NULL,
  `answer` varchar(255) NOT NULL,
  `tags` TEXT,
  INDEX `answer` (`answer`(32)),
  INDEX `survey_id` (`survey_id`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;

EOD;

mysql_query($query);

echo mysql_error();

?>

<br>
<h3>Database tables successfully created.<br><br>
    You should now delete install.php form your server, and change error_reporting to 0</h3>

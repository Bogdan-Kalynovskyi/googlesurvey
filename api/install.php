<?php

include '../settings/settings.php';

mysql_connect($db_host, $db_user, $db_pass);
if (!mysql_select_db($db_name)) {
    trigger_error(mysql_error());
    die;
}


$query = '
DROP TABLE IF EXISTS `surveys`;
';
mysql_query($query);
$query = '
DROP TABLE IF EXISTS `tags`;
';
mysql_query($query);
$query = '
DROP TABLE IF EXISTS `terms`;
';
mysql_query($query);
$query = '
DROP TABLE IF EXISTS `answers`;
';
mysql_query($query);
$query = '
CREATE TABLE IF NOT EXISTS `surveys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_google_id` varchar(32) NOT NULL,
  `user_google_id` varchar(32) NOT NULL,
  `question` text NOT NULL,
  `total` float NOT NULL,
  `positive` float NOT NULL,
  `negative` float NOT NULL,
  `created` int NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `survey_google_id` (`survey_google_id`),
  INDEX `user_google_id` (`user_google_id`),
  INDEX `created` (`created`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;
';
mysql_query($query);
$query = '
CREATE TABLE IF NOT EXISTS `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `tag` varchar(255) NOT NULL,
  `count` int NOT NULL,
  `synonyms` text NOT NULL,
  `syn_count` text NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `tag` (`tag`(32)),
  INDEX `survey_id` (`survey_id`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;
';
mysql_query($query);
$query = '
CREATE TABLE IF NOT EXISTS `terms` (
  `survey_id` int NOT NULL,
  `term` varchar(255) NOT NULL,
  `count` int NOT NULL,
  INDEX `term` (`term`(32)),
  INDEX `survey_id` (`survey_id`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;
';
mysql_query($query);
$query = '
CREATE TABLE IF NOT EXISTS `answers` (
  `survey_id` int NOT NULL,
  `answer` varchar(255) NOT NULL,
  `count` int NOT NULL,
  `tags` TEXT NOT NULL,
  INDEX `answer` (`answer`(32)),
  INDEX `survey_id` (`survey_id`)
) DEFAULT CHARSET=utf8 ENGINE = MyISAM;
';
mysql_query($query);

if (!mysql_errno()) {
?>

    <br>
    <h3>Database tables successfully created!</h3>
    <h4>You should now delete install.php form your server, and change error_reporting to 0</h4>

<?php
}
else {
    echo mysql_error();
}
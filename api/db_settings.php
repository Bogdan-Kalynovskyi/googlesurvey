<?php
if (!defined('AUTHORISED')) {
    die();
}


//@ini_set('session.cookie_lifetime', 1000000000);
//@ini_set('session.gc_maxlifetime', 1000000000);
//@ini_set('session.save_path', '../lib');

error_reporting(E_ALL ^ E_DEPRECATED);


$db_host = '127.0.0.1';
$db_user = 'root';
$db_pass = '';
$db_name = 'surveydata';
$db_charset = 'utf8';


// SQL TO CREATE REQUIRED TABLES

/*

--
-- Table structure for table `surveys`
--

CREATE TABLE IF NOT EXISTS `surveys` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_google_id` varchar(32) NOT NULL,
  `user_google_id` varchar(32) NOT NULL,
  `question` text NOT NULL,
  `total` int NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `survey_google_id` (`survey_google_id`),
  INDEX `user_google_id` (`user_google_id`)
) DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `tags`
--

CREATE TABLE IF NOT EXISTS `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `tag` varchar(255) NOT NULL,
  `count` int NOT NULL,
  `synonyms` text NOT NULL,
  `syn_count` text NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `tag` (`tag`),
  INDEX `survey_id` (`survey_id`),
  INDEX `count` (`count`)
) DEFAULT CHARSET=utf8mb4;


--
-- Table structure for table `terms`
--

CREATE TABLE IF NOT EXISTS `terms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `term` varchar(255) NOT NULL,
  `count` int NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `term` (`term`),
  INDEX `survey_id` (`survey_id`),
  INDEX `count` (`count`)
) DEFAULT CHARSET=utf8mb4;


*/
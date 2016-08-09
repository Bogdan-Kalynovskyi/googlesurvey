<?php

error_reporting(E_ALL ^ E_DEPRECATED);

/***************************************************************
**    TODO: uncoment following line in production version!    **/
//    error_reporting(0);


$google_api_id = '211499477101-d78crq8gs6sojr7grdlm9ebmoltiel71.apps.googleusercontent.com';


$db_host = '127.0.0.1';
$db_user = 'root';
$db_pass = '';
$db_name = 'surveydata';
$db_charset = 'utf8';


















// APPENDIX:  SQL TO CREATE REQUIRED TABLES

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
) DEFAULT CHARSET=utf8;


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
  INDEX `tag` (`tag`(32)),
  INDEX `survey_id` (`survey_id`),
  INDEX `count` (`count`)
) DEFAULT CHARSET=utf8;


--
-- Table structure for table `terms`
--

CREATE TABLE IF NOT EXISTS `terms` (
  `id` int NOT NULL AUTO_INCREMENT,
  `survey_id` int NOT NULL,
  `term` varchar(255) NOT NULL,
  `count` int NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `term` (`term`(32)),
  INDEX `survey_id` (`survey_id`),
  INDEX `count` (`count`)
) DEFAULT CHARSET=utf8;


*/
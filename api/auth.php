<?php
// disallow in security-sensitive part of app
    //error_reporting(0);


// compare header with xsrf token to cookie-based session

    session_start();
    if (isset($_SERVER['HTTP_AUTHORIZATION']) && $_SERVER['HTTP_AUTHORIZATION'] === $_SESSION['xsrf_token']) {
        define('AUTHORISED', true);
    }
    else {
        header("HTTP/1.0 401 Unauthorized", true, 401);
        echo 'Our fuckup! Somebody restarted PHP so your session vanished. Please reload the page to log in again.';
        die;
    }


// connect to db
    
    include "db_mysql.php";
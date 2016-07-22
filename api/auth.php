<?php
// disallow in security-sensitive part of app
    //error_reporting(0);


// compare header with xsrf token to cookie-based session

    session_start();
    if (isset($_SERVER['HTTP_AUTHORIZATION']) && isset($_SESSION['xsrfToken']) && $_SERVER['HTTP_AUTHORIZATION'] === $_SESSION['xsrfToken']) {
        define('AUTHORISED', true);
    }
    else {
        header("HTTP/1.0 401 Unauthorized", true, 401);
        echo 'Oh no! Somebody restarted our server or you logged out from other browser tab. Please reload the page to start again.';
        die;
    }


// connect to db
    
    include "db_mysql.php";
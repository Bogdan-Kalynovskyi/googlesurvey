<?php
// disallow in security-sensitive part of app
    //error_reporting(0);


// compare header with xsrf token to cookie-based session

    session_start();
    if (isset($_SERVER['HTTP_AUTHORIZATION']) && $_SERVER['HTTP_AUTHORIZATION'] === $_SESSION['xsrf_token']) {
        define('AUTHORISED', true);
    }
    else {
        header($_SERVER["SERVER_PROTOCOL"]." 401 Unauthorized", true, 401);
        die;
    }


// get the HTTP method, path and body of the request
    
    $METHOD = $_SERVER['REQUEST_METHOD'];
    if ($METHOD === 'POST') {
        $PAYLOAD = json_decode(file_get_contents('php://input'), true);
    }
          
    
    include "db_mysql.php";
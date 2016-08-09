<?php
    include '../settings/settings.php';

    session_start();


    // compare header with xsrf token to cookie-based session

    if (isset($_SERVER['HTTP_AUTHORIZATION']) && isset($_SESSION['xsrfToken']) && $_SERVER['HTTP_AUTHORIZATION'] === $_SESSION['xsrfToken']) {
        define('AUTHORISED', true);
    }
    else {
        session_destroy();
        header("HTTP/1.0 401 Unauthorized", true, 401);
        echo 'Oh no! Somebody restarted our server or you logged out from other browser tab. Please reload the page to start again.';
        die;
    }

<?php
    include '../settings/settings.php';

    session_start();


    // compare header with xsrf token to cookie-based session

    if (isset($_SERVER['HTTP_AUTHORIZATION']) && isset($_SESSION['xsrfToken']) && $_SERVER['HTTP_AUTHORIZATION'] === $_SESSION['xsrfToken']) {
        $link = mysql_connect($db_host, $db_user, $db_pass);
        if (!$link) {
            header("HTTP/1.0 500 Internal Server Error", true, 500);
            die;
        }
        mysql_select_db($db_name);   //mysql_query("SET NAMES $db_charset"
    }
    else {
        session_destroy();
        header("HTTP/1.0 401 Unauthorized", true, 401);
        echo 'We restarted our server, or you logged out from other browser tab.<br> Press OK to reload the page.';
        die;
    }


    function esc ($str) {
        return '"'.mysql_real_escape_string($str).'"';
    }
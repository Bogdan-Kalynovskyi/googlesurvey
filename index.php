<?php
include "php/settings.php";
session_start();


if (isset($_SESSION['userGoogleId'])) {
    if (isset($_POST['logout']) && $_POST['logout'] === $_SESSION['xsrfToken']) {
        session_destroy();
        include "php/login-page.php";
    }
    else {
        include "php/app-page.php";
    }
}
else {
    if (isset($_POST['authGoogleToken'])) {
        $url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' . urlencode($_POST['authGoogleToken']);
        $json = file_get_contents($url);
        $obj = json_decode($json);
        if (isset($obj->aud) && $obj->aud === $google_API_id) {
            $_SESSION['userGoogleId'] = $obj->sub;
            $_SESSION['xsrfToken'] = base64_encode(openssl_random_pseudo_bytes(32));
            include "php/app-page.php";
        }
        else {
            header("HTTP/1.0 401 Unauthorized", true, 401);
            echo 'Google authentication failed';
        }
    }
    else {
        include "php/login-page.php";
    }
}
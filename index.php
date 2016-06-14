<?php
session_start();
include "php/settings.php";


if (isset($_SESSION['sub'])) {
    if (isset($_POST['logout']) && $_POST['logout'] === $_SESSION['xsrf_token']) {
        session_destroy();
        include "php/login-page.php";
    }
    else {
        include "php/app-page.php";
    }
}
else {
    if (isset($_POST['google_auth_token'])) {
        $url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' . urlencode($_POST['google_auth_token']);
        $json = file_get_contents($url);
        $obj = json_decode($json);
        if (isset($obj->aud) && $obj->aud === $google_API_id) {
            $_SESSION['sub'] = $obj->sub;
            $_SESSION['xsrf_token'] = base64_encode(openssl_random_pseudo_bytes(32));
            include "php/app-page.php";
        }
        else {
            echo 'Failed Google authentication';
        }
    }
    else {
        include "php/login-page.php";
    }
}
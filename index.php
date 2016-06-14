<?php
include "php/settings.php";
session_start();


if (isset($_SESSION['user_google_id'])) {
    if (isset($_POST['logout']) && $_POST['logout'] === $_SESSION['xsrf_token']) {
        session_destroy();
        include "php/login-page.php";
    }
    else {
        include "php/app-page.php";
    }
}
else {
    if (isset($_POST['auth_google_token'])) {
        $url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' . urlencode($_POST['auth_google_token']);
        $json = file_get_contents($url);
        $obj = json_decode($json);
        if (isset($obj->aud) && $obj->aud === $google_API_id) {
            $_SESSION['user_google_id'] = $obj->sub;
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
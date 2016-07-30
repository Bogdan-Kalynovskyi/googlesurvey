<?php
    include "settings.php";

    session_start();


    // ask Google for verification

    if (isset($_POST['authToken'])) {
        $url = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' . urlencode($_POST['authToken']);
        $json = @file_get_contents($url);
        $obj = @json_decode($json);
        if ($obj && isset($obj->aud) && $obj->aud === $google_api_id) {
            $_SESSION['userGoogleId'] = $obj->sub;
            $_SESSION['xsrfToken'] = base64_encode(openssl_random_pseudo_bytes(32));
            echo $_SESSION['xsrfToken'];
        }
        else {
            header("HTTP/1.0 401 Unauthorized", true, 401);
            echo 'Google authentication failed';
        }
    }


    // prevent api from recognising this client

    else if (isset($_POST['logout']) && $_POST['logout'] === $_SESSION['xsrfToken']) {
        session_destroy();
    }

<?php
include_once 'auth.php';


try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            get();
            break;
        case 'DELETE':
            delete();
            break;
    }
}
catch (Exception $e) {
    header("HTTP/1.0 400 Bad Request", true, 400);
    echo $e->getMessage();
}


function get () {
    global $db;

    $response = $db->query('SELECT * FROM surveys WHERE user_google_id = '.$db->a($_SESSION['userGoogleId']), true, true);

    if ($response) {
        echo json_encode($response);
    }
}


function delete () {
    global $db;
    
    $db->query('DELETE FROM surveys WHERE id = '.$db->b($_GET['surveyId']));
    $db->query('DELETE FROM tags WHERE survey_id = '.$db->b($_GET['surveyId']));
}
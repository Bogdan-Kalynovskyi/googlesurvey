<?php
include_once 'auth.php';


try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            get();
            break;
//        case 'POST':
//            create();
//            break;
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

    echo json_encode($db->query('SELECT * FROM surveys WHERE user_google_id = '.$db->b($_SESSION['userGoogleId']), true, true));
}


function delete () {
    global $db;
    
    $db->query('DELETE FROM surveys WHERE survey_id = '.$db->b($_GET['surveyId']));
    $db->query('DELETE FROM tags WHERE survey_id = '.$db->b($_GET['surveyId']));
}
<?php
    include_once 'auth.php';

    switch ($METHOD) {
        case 'GET':
        case 'PUT':
        case 'POST':
            post();
            break;
        case 'DELETE':
    }


function post () {
    global $db;

    $survey_id = $db->evaluate('SELECT id FROM surveys WHERE user_google_id = '.$db->a($_SESSION['user_google_id']));
    if (!$survey_id) {
        $survey_id = $db->query('INSERT INTO surveys (survey_google_id, user_google_id) VALUES ('.$db->a($_POST['survey_google_id']).', '.$db->a($_SESSION['user_google_id']).')');
    }

//    $tags1 = $db->query('INSERT INTO tags (tag, count, survey_id) VALUES '.$survey_id);
//    $tags2 = $_POST['tags'];

//    print_r($tags1);
//    print_r($tags2);
//    for ($i = 0; $i < count($tags2); $i++) {
//        
//    }
}
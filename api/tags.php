<?php
    include_once 'auth.php';

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            break;
        case 'PUT':
            break;
        case 'POST':
            post();
            break;
        case 'DELETE':
            break;
    }


function post () {
    global $db;

    $post = json_decode(file_get_contents('php://input'), true);
    if (!isset($post['survey_google_id']) || !isset($post['tags']) || count($post['tags']) === 0) {
        die;
    }

    $survey_id = $db->evaluate('SELECT id FROM surveys WHERE user_google_id = '.$db->a($_SESSION['user_google_id']));
    if (!$survey_id) {
        $survey_id = $db->query('INSERT INTO surveys (survey_google_id, user_google_id) VALUES ('.$db->a($post['survey_google_id']).', '.$db->a($_SESSION['user_google_id']).')');
    }
    else {
        header("HTTP/1.0 403 Forbidden", true, 403);
        echo "You cannot load the same survey twice. Please delete it in dashboard and try again.";
        die;
    }

    $str = '';
    foreach ($post['tags'] as $key => $val) {
        $str .= '('.$db->a($key).','.$val.','.$db->a($survey_id).'),';
    }

    $str = substr($str, 0, -1);

    $db->query('INSERT INTO tags (tag, count, survey_id) VALUES '.$str);

}
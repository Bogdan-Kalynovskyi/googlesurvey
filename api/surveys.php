<?php
include 'auth.php';

include 'db_mysql.php';


try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            get();
            break;

        case 'POST':
            create();
            break;

        case 'PUT':
            rewrite();
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

    $response = $db->query('SELECT * FROM surveys WHERE user_google_id = '.$db->a($_SESSION['userGoogleId']).' ORDER BY id', true, true);

    if ($response) {
        echo json_encode($response);
    }
    else {
        echo '{}';
    }
}


function create () {
    global $db;

    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = $db->query('INSERT INTO surveys (survey_google_id, user_google_id, question, total) VALUES ('.$db->a($post['survey_google_id']).', '.$db->a($_SESSION['userGoogleId']).', '.$db->a($post['question']).', '.$db->b($post['total']).')');
    appendTags($post['tagsArr'], $surveyId);
    appendTerms($post['termsArr'], $surveyId);

    echo $surveyId;
}


function rewrite () {
    global $db;

    function appendTags ($tags, $surveyId) {
        $str = '';
        $n = count($tags);
        for ($i = 0; $i < $n; $i++) {
            $line = $tags[$i];
            $synonyms = isset($line[2]) ? ($db->a($line[2]).','.$db->a($line[3])) : '"",""';
            $str .= '('.$surveyId.','.$db->a($line[0]).','.$db->b($line[1]).','.$synonyms.'),';
        }

        $str = substr($str, 0, -1);

        $db->query('INSERT INTO tags (survey_id, tag, count, synonyms, syn_count) VALUES '.$str);
    }


    function appendTerms ($terms, $surveyId) {
        $str = '';
        $n = count($terms);
        for ($i = 0; $i < $n; $i++) {
            $line = $terms[$i];
            $str .= '('.$surveyId.','.$db->a($line[0]).','.$db->b($line[1]).'),';
        }

        $str = substr($str, 0, -1);

        $db->query('INSERT INTO terms (survey_id, term, count) VALUES '.$str);
    }


    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = $db->b($post['surveyId']);

    $db->query('DELETE FROM tags WHERE survey_id = '.$surveyId);
    $db->query('DELETE FROM terms WHERE survey_id = '.$surveyId);

    appendTags($post['tagsArr'], $surveyId);
    appendTerms($post['termsArr'], $surveyId);
    $db->query('UPDATE surveys SET total = '.$db->b($post['total']).' WHERE id = '.$surveyId);
}


function delete () {
    global $db;

    $surveyId = $db->b($_GET['surveyId']);
    $db->query('DELETE FROM surveys WHERE id = '.$surveyId);
    $db->query('DELETE FROM tags WHERE survey_id = '.$surveyId);
    $db->query('DELETE FROM terms WHERE survey_id = '.$surveyId);
}
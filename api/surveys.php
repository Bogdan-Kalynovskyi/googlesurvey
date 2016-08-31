<?php
include 'auth.php';


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

if ($s = mysql_error()) {
    header("HTTP/1.0 400 Bad Request", true, 400);
    echo $s;
    die;
}


function get () {
    $query = mysql_query('SELECT * FROM surveys WHERE user_google_id = '.esc($_SESSION['userGoogleId']).' ORDER BY created');
    $result = array();

    while ($row = mysql_fetch_array($query, MYSQL_ASSOC)) {
        $num = array_shift($row);
        $result[$num] = $row;  // todo floatval for light performance
    }

    if ($result) {
        echo json_encode($result);
    }
    else {
        echo '{}';
    }
}


function appendTags ($tags, $surveyId) {
    $str = '';
    $n = count($tags);
    for ($i = 0; $i < $n; $i++) {
        $line = $tags[$i];
        $synonyms = isset($line[2]) ? (esc($line[2]).','.esc($line[3])) : '"",""';
        $str .= '('.$surveyId.','.esc($line[0]).','.intval($line[1]).','.$synonyms.')';
        if ($i < $n - 1) {
            $str .= ',';
        }
    }

    mysql_query('INSERT INTO tags (survey_id, tag, count, synonyms, syn_count) VALUES '.$str);
}


function appendTerms ($terms, $surveyId) {
    $str = '';
    $n = count($terms);
    for ($i = 0; $i < $n; $i++) {
        $line = $terms[$i];
        $str .= '('.$surveyId.','.esc($line[0]).','.intval($line[1]).')';
        if ($i < $n - 1) {
            $str .= ',';
        }
    }

    mysql_query('INSERT INTO terms (survey_id, term, count) VALUES '.$str);
}


function create () {
    $post = json_decode(file_get_contents('php://input'), true);
    $survey = $post['survey'];
    mysql_query('INSERT INTO surveys (survey_google_id, user_google_id, question, total, positive, negative, created) VALUES ('.esc($survey['survey_google_id']).','.esc($_SESSION['userGoogleId']).','.esc($survey['question']).','.floatval($survey['total']).','.floatval($survey['positive']).','.floatval($survey['negative']).',UNIX_TIMESTAMP())');
    $surveyId = mysql_insert_id();
    appendTags($post['tags'], $surveyId);
    appendTerms($post['terms'], $surveyId);

    echo $surveyId;
}


function rewrite () {
    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);

    mysql_query('DELETE FROM tags WHERE survey_id = '.$surveyId);
    mysql_query('DELETE FROM terms WHERE survey_id = '.$surveyId);

    appendTags($post['tags'], $surveyId);
    appendTerms($post['terms'], $surveyId);
    mysql_query('UPDATE surveys SET total = '.intval($post['total']).' WHERE id = '.$surveyId);
}


function delete () {
    $surveyId = intval($_GET['surveyId']);
    mysql_query('DELETE FROM surveys WHERE id = '.$surveyId);
    mysql_query('DELETE FROM tags WHERE survey_id = '.$surveyId);
    mysql_query('DELETE FROM terms WHERE survey_id = '.$surveyId);
    mysql_query('DELETE FROM answers WHERE survey_id = '.$surveyId);
}
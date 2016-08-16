<?php
include 'auth.php';


switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        get();
        break;

    case 'POST':
        add();
        break;

    case 'PUT':
        change();
        break;

    case 'PATCH':
        patch();
        break;
}

if ($s = mysql_error()) {
    header("HTTP/1.0 400 Bad Request", true, 400);
    echo $s;
    die;
}


function get () {
    $query = mysql_query('SELECT answer, tags FROM answers WHERE survey_id = '.intval($_GET['surveyId']).' ORDER BY answer');
    $result = array();
    while ($row = mysql_fetch_array($query, MYSQL_NUM)) {
        $result[] = $row;
    }
    echo json_encode($result);
}


function add ($post = null) {
    if (!$post) $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);
    $answers = $post['answers'];

    $str = '';
    $n = count($answers);
    $nn = $n - 1;
    for ($i = 0; $i < $n; $i++) {
        $line = $answers[$i];
        $str .= '('.$surveyId.','.esc($line[0]).','.esc($line[1]).')';
        if ($i < $nn) {
            $str .= ',';
        }
    }

    mysql_query('INSERT INTO answers (survey_id, answer, tags) VALUES '.$str);
}


function change () {
    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);

    mysql_query('DELETE FROM answers WHERE survey_id = '.$surveyId);
    add($post);
}


function patch () {
    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);

    mysql_query('UPDATE answers SET tags = '.esc($post['tags']).' WHERE survey_id = '.$surveyId.' AND answer = '.esc($post['answer']).' LIMIT 1');
}
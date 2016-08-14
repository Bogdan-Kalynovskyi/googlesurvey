<?php
include 'auth.php';


try {
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
}

catch (Exception $e) {
    header("HTTP/1.0 400 Bad Request", true, 400);
    echo $e->getMessage();
}


function get () {
    $query = mysql_query('SELECT answer, tags FROM answers WHERE survey_id = '.intval($_GET['surveyId']).' ORDER BY answer');
    $result = array();
    while ($row = mysql_fetch_array($query, MYSQL_NUM)) {
        $result[] = array($row[0], intval($row[1]));
    }
    echo json_encode($result);
}


function add ($post = null) {
    $post = $post || json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);
    $answers = $post['answers'];

    $str = '';
    $i = 0;
    $n = count($answers);
    for ($i = 0; $i < $n; $i++) {
        $line = $answers[$i];
        $str .= '('.$surveyId.','.esc($line[0]).','.esc($line[1]).')';
        if ($i < $n - 1) {
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

    mysql_query('UPDATE answers SET tags = '.esc($post['tags']).' WHERE survey_id = '.$surveyId.' AND answer = '.esc($post['answer']));
}
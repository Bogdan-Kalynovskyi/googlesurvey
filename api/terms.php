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
    $query = mysql_query('SELECT term, count FROM terms WHERE survey_id = '.intval($_GET['surveyId']).' ORDER BY term');
    $result = array();
    while ($row = mysql_fetch_array($query, MYSQL_NUM)) {
        $result[] = array($row[0], intval($row[1]));
    }
    echo json_encode($result);
}


function add ($post = null) {
    if (!$post) $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);
    $terms = $post['terms'];

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


function change () {
    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);

    mysql_query('DELETE FROM terms WHERE survey_id = '.$surveyId);
    add($post);
}
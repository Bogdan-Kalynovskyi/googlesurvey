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
    $query = mysql_query('SELECT tag, count, synonyms, syn_count FROM tags WHERE survey_id = '.intval($_GET['surveyId']).' ORDER BY tag');
    $result = array();
    while ($row = mysql_fetch_array($query, MYSQL_NUM)) {
        $rrr = array($row[0], intval($row[1]));
        if ($row[2]) {
            $rrr[] = $row[2];
            $rrr[] = $row[3];
        }
        $result[] = $rrr;
    }
    echo json_encode($result);
}


function add ($post = null) {
    $post = $post || json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);
    $tags = $post['tags'];

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


function change () {
    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($post['surveyId']);

    mysql_query('DELETE FROM tags WHERE survey_id = '.$surveyId);
    add($post);
}
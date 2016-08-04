<?php
include 'auth.php';

include 'db_mysql.php';


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

    $query = mysql_query('SELECT tag, count, synonyms, syn_count FROM tags WHERE survey_id = '.$db->b($_GET['surveyId']).' ORDER BY count DESC');
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


function add () {
    global $db;

    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($_POST['surveyId']);
    $terms = $post['terms'];

    $str = '';
    $n = count($terms);
    for ($i = 0; $i < $n; $i++) {
        $line = $terms[$i];
        $str .= '('.$surveyId.','.$db->a($line[0]).','.$db->b($line[1]).'),';
    }

    $str = substr($str, 0, -1);

    $db->query('INSERT INTO terms (survey_id, term, count) VALUES '.$str);
}
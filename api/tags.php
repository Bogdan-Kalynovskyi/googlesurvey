<?php
include_once 'auth.php';


try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['tags'])) {
                getTags();
            }
            elseif (isset($_GET['terms'])) {
                getTerms();
            }
            break;
        case 'POST':
            create();
            break;
        case 'PUT':
            append();
            break;
    }
}
catch (Exception $e) {
    header("HTTP/1.0 400 Bad Request", true, 400);
    echo $e->getMessage();
}


function getTags () {
    global $db;

    $query = mysql_query('SELECT tag, count, synonyms, syn_count FROM tags WHERE survey_id = '.$db->b($_GET['surveyId']).' ORDER BY count DESC');
    $result = array();
    while ($row = mysql_fetch_array($query, MYSQL_NUM)) {
        $rrr = [$row[0], intval($row[1])];
        if ($row[2]) {
            $rrr[] = $row[2];
            $rrr[] = $row[3];
        }
        $result[] = $rrr;
    }
    echo json_encode($result);
}


function getTerms () {
    global $db;

    $query = mysql_query('SELECT term, count FROM terms WHERE survey_id = '.$db->b($_GET['surveyId']).' ORDER BY count DESC');
    $result = array();
    while ($row = mysql_fetch_array($query, MYSQL_NUM)) {
        $result[] = [$row[0], intval($row[1])];
    }
    echo json_encode($result);
}


function create () {
    global $db;

    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = $db->query('INSERT INTO surveys (survey_google_id, user_google_id, question, total) VALUES ('.$db->a($post['survey_google_id']).', '.$db->a($_SESSION['userGoogleId']).', '.$db->a($post['question']).', '.$db->b($post['total']).')');
    appendTags($post['tagsArr'], $surveyId);
    appendTerms($post['termsArr'], $surveyId);

    echo $surveyId;
}


function append () {
    global $db;

    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = $db->b($post['surveyId']);

    $db->query('DELETE FROM tags WHERE survey_id = '.$surveyId);
    $db->query('DELETE FROM terms WHERE survey_id = '.$surveyId);

    appendTags($post['tagsArr'], $surveyId);
    appendTerms($post['termsArr'], $surveyId);
    $db->query('UPDATE surveys SET total = '.$db->b($post['total']).' WHERE id = '.$surveyId);
}


function appendTags ($tags, $surveyId) {
    global $db;

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
    global $db;

    $str = '';
    $n = count($terms);
    for ($i = 0; $i < $n; $i++) {
        $line = $terms[$i];
        $str .= '('.$surveyId.','.$db->a($line[0]).','.$db->b($line[1]).'),';
    }

    $str = substr($str, 0, -1);

    $db->query('INSERT INTO terms (survey_id, term, count) VALUES '.$str);
}

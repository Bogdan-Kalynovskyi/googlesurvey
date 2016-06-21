<?php
include_once 'auth.php';


try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            get();
            break;
        case 'POST':
            create();
            break;
        case 'PUT':
            update();
            break;
        case 'PATCH':
            append();
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

    $surveyId = intval($db->evaluate('SELECT id FROM surveys WHERE survey_google_id = '.$db->a($_GET['surveyGoogleId'])));
    $query = mysql_query('SELECT * FROM tags WHERE survey_id = '.$surveyId);
    $result = array();
    while ($row = mysql_fetch_array($query, MYSQL_NUM)) {
        $result[$row[2]] = intval($row[3]);
    }
    echo json_encode($result);
}


function create () {
    global $db;

    $post = json_decode(file_get_contents('php://input'), true);
    $surveyId = intval($db->evaluate('SELECT id FROM surveys WHERE survey_google_id = '.$db->a($post['surveyGoogleId'])));
    if (!$surveyId) {
        $surveyId = $db->query('INSERT INTO surveys (survey_google_id, user_google_id, question) VALUES ('.$db->a($post['surveyGoogleId']).', '.$db->a($_SESSION['userGoogleId']).', '.$db->a($post['question']).')');
    }
    else {
        header("HTTP/1.0 403 Forbidden", true, 403);
        echo "This survey has already been uploaded. You cannot upload it twice. You can delete it and try again.";
        die;
    }

    appendTags($post['tagsObj'], $surveyId);

    echo $surveyId;
}


function append () {
    $post = json_decode(file_get_contents('php://input'), true);
    appendTags($post['tagsObj'], $post['surveyId']);
}


function appendTags ($tags, $surveyId) {
    global $db;

    $surveyId = $db->b($surveyId);
    $str = '';
    foreach ($tags as $key => $val) {
        $str .= '('.$db->a($key).','.$db->b($val).','.$surveyId.'),';
    }

    $str = substr($str, 0, -1);

    $db->query('INSERT INTO tags (tag, count, survey_id) VALUES '.$str);
}


function update () {
    global $db;

    $post = json_decode(file_get_contents('php://input'), true);
    $db->query('UPDATE tags SET tag = '.$db->a($post['name']).', count = '.$db->b($post['count']).' WHERE '.$db->a($post['tag']).' AND survey_id = '.$db->b($post['surveyId']));
}
//
//
//function update () {
//    global $db;
//
//    $post = json_decode(file_get_contents('php://input'), true);
//    if (!isset($post['surveyId']) || !isset($post['tagsObj']) || count($post['tagsObj']) === 0) {
//        throw new Exception("Not enough parameters");
//    }
//
//    $db->query('DELETE FROM tags WHERE survey_id = '.$db->b($post['surveyId']));
//
//    appendTags($post['tagsObj'], $post['surveyId']);
//}


function delete () {
    global $db;
    
//    if ($_GET['tag']) {
//        $str = 'tag = '.$db->a($_GET['tag']);
//    }
//    else {
        $arr = [];
        $c = count($_GET['tags']);
        for ($i = 0; $i < $c; $i++) {
            $arr[$i] = 'tag = '.$db->a($_GET['tags'][$i]);
        }
        $str = '('.implode(' OR ', $arr).')';
//    }

    $db->query('DELETE FROM tags WHERE survey_id = '.$db->b($_GET['surveyId']).' AND '.$str);
}

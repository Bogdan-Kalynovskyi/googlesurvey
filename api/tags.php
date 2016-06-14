<?php
    include_once 'db_mysql.php';

// get the HTTP method, path and body of the request
    $method = $_SERVER['REQUEST_METHOD'];
    $request = explode('/', trim($_SERVER['PATH_INFO'], '/'));
echo $request;
    //$input = json_decode(file_get_contents('php://input'),true);
      
    switch ($method) {
        case 'GET':
            $sql = "select * from `$table`".($key?" WHERE id=$key":''); break;
        case 'PUT':
            $sql = "update `$table` set $set where id=$key"; break;
        case 'POST':
            $sql = "insert into `$table` set $set"; break;
        case 'DELETE':
            $sql = "delete `$table` where id=$key"; break;
    }

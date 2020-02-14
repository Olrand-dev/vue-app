<?php

declare(strict_types=1);
define('DS', DIRECTORY_SEPARATOR);
define('DB_FILE', 'files/db.json');

ini_set('date.timezone', 'Europe/Kiev');
session_start();

$response = [
    'status' => 'success',
    'message' => '',
    'data' => [],
];


if (!empty($_FILES)) {
    $files = [];

    foreach ($_FILES['files'] as $key => $values) {

        $i = 0;
        foreach ($values as $value) {
            $files[$i][$key] = $value;
            $i++;
        }
    }

    $orderId = $_SESSION['order_id'] ?? '';
    $customerId = $_SESSION['customer_id'] ?? '';

    $dir = 'files' . DS . $orderId . DS . $customerId;
    if (!file_exists($dir)) mkdir($dir, 0755, true);

    $i = 1;
    foreach ($files as $fileData) {

        $parts = explode('.', $fileData['name']);
        $format = $parts[count($parts) - 1]; 
        $date = date('d-m-Y-H-i-s', time());
        $num = ($i < 10) ? ('0' . $i) : $i;
        $path = $dir . DS . "{$date}_{$num}.{$format}";
        copy($fileData['tmp_name'], $path);

        $response['data'][] = $path;
        $i++;
    }

    echo json_encode($response);
    exit;
}


$action = $_REQUEST['action'] ?? '';
if (!empty($action)) {

    echo json_encode($action($response));
} else {

    $response['status'] = 'error';
    $response['message'] = 'empty "action" param';
    echo json_encode($response);
}


function setSessionValues(array $response) : array {
    $values = $_REQUEST['values'] ?? [];
    $_SESSION = array_merge($_SESSION, $values);

    return $response;
}


function deleteOrderImagesFolder(array $response) : array {
    $orderId = $_REQUEST['order_id'];
    $path = 'files' . DS . $orderId;

    deleteFolder($path);
    return $response;
}


function deleteOrderItemImagesFolder(array $response) : array {
    $orderId = $_REQUEST['order_id'];
    $customerId = $_REQUEST['customer_id'];
    $path = 'files' . DS . $orderId . DS . $customerId;

    deleteFolder($path);
    return $response;
}


function deleteFolder(string $path) : void {
    if (is_dir($path)) { 
        $objects = scandir($path); 
        
        foreach ($objects as $object) { 
            if ($object != "." && $object != "..") { 
            if (is_dir($path."/".$object) && !is_link($path."/".$object))
                deleteFolder($path."/".$object);
            else
                unlink($path."/".$object); 
            } 
        }
        rmdir($path); 
    }
}


function deleteOrderItemImage(array $response) : array {
    $imgPath = $_REQUEST['img_path'] ?? '';

    if (!empty($imgPath)) {
        $result = unlink($imgPath);
        if (!$result) $response['status'] = 'error';
    }
    return $response;
}


function getDbFile(array $response) : array {

    if (!file_exists(DB_FILE)) {
        $response['message'] = 'no db file';
        return $response;
    } 
    $response['data'] = file_get_contents(DB_FILE);
    return $response;
}


function saveDbFile(array $response) : array {
    $dbData = $_REQUEST['db_data'] ?? '';
    if (empty($dbData)) {
        $response['status'] = 'error';
        $response['message'] = 'empty "db_data" post param';
        return $response;
    }

    file_put_contents(DB_FILE, $dbData);
    return $response;
}

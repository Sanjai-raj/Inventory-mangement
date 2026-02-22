<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

$database = new Database();
$db = $database->getConnection();

$query = "SELECT id, name FROM categories ORDER BY name";
$stmt = $db->prepare($query);
$stmt->execute();

$categories_arr = array();
$categories_arr["records"] = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    extract($row);
    $item = array(
        "id" => $id,
        "name" => $name
    );
    array_push($categories_arr["records"], $item);
}

http_response_code(200);
echo json_encode($categories_arr);
?>

<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

$database = new Database();
$db = $database->getConnection();

$query = "SELECT s.*, p.name as product_name, p.sku 
          FROM stock s 
          JOIN products p ON s.product_id = p.id 
          ORDER BY p.name ASC";
$stmt = $db->prepare($query);
$stmt->execute();

$stock_arr = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    extract($row);
    $item = array(
        "id" => $id,
        "product_id" => $product_id,
        "product_name" => $product_name,
        "sku" => $sku,
        "quantity" => $quantity,
        "last_updated" => $last_updated
    );
    array_push($stock_arr, $item);
}

sendResponse(200, "Stock fetched successfully", $stock_arr);
?>

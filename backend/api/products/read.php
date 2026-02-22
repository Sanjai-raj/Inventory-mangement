<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

$database = new Database();
$db = $database->getConnection();

// V2 Schema: products has 'category' (varchar), 'unit_price', 'created_by'
$query = "SELECT p.*, u.name as created_by_name 
          FROM products p 
          LEFT JOIN users u ON p.created_by = u.id 
          ORDER BY p.created_at DESC";
$stmt = $db->prepare($query);
$stmt->execute();

$products_arr = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    extract($row);
    $product_item = array(
        "id" => $id,
        "name" => $name,
        "category" => $category,
        "description" => $description,
        "unit_price" => $unit_price,
        "created_by" => $created_by_name,
        "created_at" => $created_at
    );
    array_push($products_arr, $product_item);
}

sendResponse(200, "Products fetched successfully", $products_arr);
?>

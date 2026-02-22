<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

$database = new Database();
$db = $database->getConnection();

if(isset($_GET['product_id'])) {
    $product_id = htmlspecialchars(strip_tags($_GET['product_id']));

    $query = "SELECT l.*, u.name as performed_by_name 
              FROM inventory_logs l 
              JOIN users u ON l.performed_by = u.id 
              WHERE l.product_id = ? 
              ORDER BY l.timestamp DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $product_id);
    $stmt->execute();

    $logs_arr = array();

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        extract($row);
        $item = array(
            "id" => $id,
            "action" => $action,
            "quantity_change" => $quantity_change,
            "performed_by" => $performed_by_name,
            "timestamp" => $timestamp
        );
        array_push($logs_arr, $item);
    }

    sendResponse(200, "Stock history fetched", $logs_arr);
} else {
    sendResponse(400, "Product ID is required");
}
?>

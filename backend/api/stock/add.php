<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$userData = $auth->validateToken();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(isset($data->product_id) && isset($data->quantity)) {
    $product_id = htmlspecialchars(strip_tags($data->product_id));
    $quantity = (int) $data->quantity;

    if($quantity <= 0) {
        sendResponse(400, "Quantity must be greater than 0");
    }

    try {
        $db->beginTransaction();

        // 1. Update Stock
        $query = "UPDATE stock SET quantity = quantity + :quantity WHERE product_id = :product_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(":quantity", $quantity);
        $stmt->bindParam(":product_id", $product_id);
        $stmt->execute();

        if($stmt->rowCount() == 0) {
            // Check if stock record exists, if not maybe insert? Product creation usually makes one.
            // But let's assume it failed because product_id is invalid or row locked?
            // Actually, if row doesn't exist, we should probably fail or insert. 
            // product creation logic guarantees creation but safe to check.
            throw new Exception("Stock record not found for product ID: " . $product_id);
        }

        // 2. Log Action
        $logQuery = "INSERT INTO inventory_logs SET product_id=:product_id, action='add', quantity_change=:quantity, performed_by=:performed_by";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":product_id", $product_id);
        $logStmt->bindParam(":quantity", $quantity);
        $logStmt->bindParam(":performed_by", $userData->id);
        $logStmt->execute();

        $db->commit();
        sendResponse(200, "Stock added successfully");

    } catch (Exception $e) {
        $db->rollBack();
        sendResponse(500, "Error: " . $e->getMessage());
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

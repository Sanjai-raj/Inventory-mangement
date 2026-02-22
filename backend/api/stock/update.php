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

if(isset($data->product_id) && isset($data->quantity) && isset($data->action)) {
    $product_id = htmlspecialchars(strip_tags($data->product_id));
    $quantity = (int) $data->quantity;
    $action = strtolower($data->action); // 'add', 'remove', 'set' ?? V2 says 'add'/'update'/'delete' logs.
    
    // Simplification: This endpoint handles 'update' (manual fix) or 'remove' (sales/damage).
    // Let's assume input maps to specific logic.
    // If action is 'remove', we subtract. If 'update', maybe we set??
    // Let's implement 'remove' logic here as a complement to 'add'.
    
    $change = 0;
    $logAction = 'update';

    if($action == 'remove') {
        $change = -$quantity;
        $logAction = 'delete'; // Mapping 'remove' to 'delete' enum in logs or just 'update' with negative? Schema has 'delete' enum.
    } else if ($action == 'update_add') { // Manual add correction
        $change = $quantity;
        $logAction = 'update';
    } else {
         // Generic update to a set value is harder without locking. 
         // Let's assume this API is for "Removing Stock" mostly.
         sendResponse(400, "Invalid action. Use 'remove' or 'update_add'");
    }

    try {
        $db->beginTransaction();

        // Check current stock
        $checkQuery = "SELECT quantity FROM stock WHERE product_id = ? FOR UPDATE";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(1, $product_id);
        $checkStmt->execute();
        $row = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if(!$row) {
            throw new Exception("Product stock not found");
        }

        $newQty = $row['quantity'] + $change;

        if($newQty < 0) {
            throw new Exception("Insufficient stock");
        }

        // 1. Update Stock
        $updateQuery = "UPDATE stock SET quantity = :quantity WHERE product_id = :product_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(":quantity", $newQty);
        $updateStmt->bindParam(":product_id", $product_id);
        $updateStmt->execute();

        // 2. Log Action
        $logQuery = "INSERT INTO inventory_logs SET product_id=:product_id, action=:action, quantity_change=:change, performed_by=:performed_by";
        $logStmt = $db->prepare($logQuery);
        $logStmt->bindParam(":product_id", $product_id);
        $logStmt->bindParam(":action", $logAction);
        $changeAbs = abs($change); /// Log absolute change? OR signed? 'quantity_change' implies signed or magnitude? 
        // Schema says 'quantity_change' int.
        // Let's log the actual signed change to be clear or just magnitude since action describes it.
        // Users spec: "product_id, action (ADD/UPDATE/DELETE), quantity_change, performed_by"
        // 'DELETE' usually implies removal. So quantity_change 5 with action DELETE means -5.
        $logStmt->bindParam(":change", $changeAbs); 
        $logStmt->bindParam(":performed_by", $userData->id);
        $logStmt->execute();

        $db->commit();
        sendResponse(200, "Stock updated successfully");

    } catch (Exception $e) {
        $db->rollBack();
        sendResponse(500, "Error: " . $e->getMessage());
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

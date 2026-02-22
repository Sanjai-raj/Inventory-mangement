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

if(isset($data->name) && isset($data->unit_price)) {
    try {
        $db->beginTransaction();

        // 1. Insert Product
        $query = "INSERT INTO products SET name=:name, category=:category, description=:description, unit_price=:unit_price, created_by=:created_by";
        $stmt = $db->prepare($query);

        $name = htmlspecialchars(strip_tags($data->name));
        $category = isset($data->category) ? htmlspecialchars(strip_tags($data->category)) : "Uncategorized";
        $description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : "";
        $unit_price = htmlspecialchars(strip_tags($data->unit_price));
        $created_by = $userData->id;

        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":category", $category);
        $stmt->bindParam(":description", $description);
        $stmt->bindParam(":unit_price", $unit_price);
        $stmt->bindParam(":created_by", $created_by);

        if($stmt->execute()) {
            $product_id = $db->lastInsertId();

            // 2. Initialize Stock (0 quantity)
            $stockQuery = "INSERT INTO stock SET product_id=:product_id, quantity=0";
            $stockStmt = $db->prepare($stockQuery);
            $stockStmt->bindParam(":product_id", $product_id);
            $stockStmt->execute();

            $db->commit();
            sendResponse(201, "Product created successfully", ["id" => $product_id]);
        } else {
            $db->rollBack();
            sendResponse(503, "Unable to create product");
        }
    } catch (Exception $e) {
        $db->rollBack();
        sendResponse(500, "Error: " . $e->getMessage());
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

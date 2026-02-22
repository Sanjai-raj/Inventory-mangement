<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    $query = "UPDATE products SET name=:name, category=:category, description=:description, unit_price=:unit_price WHERE id=:id";
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $category = isset($data->category) ? htmlspecialchars(strip_tags($data->category)) : "Uncategorized";
    $description = isset($data->description) ? htmlspecialchars(strip_tags($data->description)) : "";
    $unit_price = htmlspecialchars(strip_tags($data->unit_price));
    $id = htmlspecialchars(strip_tags($data->id));

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":category", $category);
    $stmt->bindParam(":description", $description);
    $stmt->bindParam(":unit_price", $unit_price);
    $stmt->bindParam(":id", $id);

    if($stmt->execute()) {
        sendResponse(200, "Product updated successfully");
    } else {
        sendResponse(503, "Unable to update product");
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

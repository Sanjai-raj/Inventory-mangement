<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$userData = $auth->validateToken();

if($userData->role !== 'admin') {
    sendResponse(403, "Access denied. Admins only.");
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(isset($data->id)) {
    // Schema has ON DELETE CASCADE, so deleting product removes stock and logs too.
    $query = "DELETE FROM products WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->id);

    if($stmt->execute()) {
        sendResponse(200, "Product deleted successfully");
    } else {
        sendResponse(503, "Unable to delete product");
    }
} else {
    sendResponse(400, "ID is required");
}
?>

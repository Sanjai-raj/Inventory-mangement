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
    $query = "DELETE FROM expenses WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $data->id);

    if($stmt->execute()) {
        sendResponse(200, "Expense deleted successfully");
    } else {
        sendResponse(503, "Unable to delete expense");
    }
} else {
    sendResponse(400, "ID is required");
}
?>

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
    $query = "UPDATE users SET name=:name, email=:email, status=:status WHERE id=:id";
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $status = htmlspecialchars(strip_tags($data->status));
    $id = htmlspecialchars(strip_tags($data->id));

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":status", $status);
    $stmt->bindParam(":id", $id);

    if($stmt->execute()) {
        sendResponse(200, "Employee updated successfully");
    } else {
        sendResponse(503, "Unable to update employee");
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

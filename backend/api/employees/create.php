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

if(isset($data->name) && isset($data->email) && isset($data->password)) {
    // Check if email exists
    $checkQuery = "SELECT id FROM users WHERE email = ?";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->bindParam(1, $data->email);
    $checkStmt->execute();
    
    if($checkStmt->rowCount() > 0) {
        sendResponse(400, "Email already exists");
    }

    $query = "INSERT INTO users SET name=:name, email=:email, password=:password, role=:role, status=:status";
    $stmt = $db->prepare($query);

    $name = htmlspecialchars(strip_tags($data->name));
    $email = htmlspecialchars(strip_tags($data->email));
    $password = password_hash($data->password, PASSWORD_BCRYPT);
    $role = 'employee';
    $status = 'active';

    $stmt->bindParam(":name", $name);
    $stmt->bindParam(":email", $email);
    $stmt->bindParam(":password", $password);
    $stmt->bindParam(":role", $role);
    $stmt->bindParam(":status", $status);

    if($stmt->execute()) {
        sendResponse(201, "Employee created successfully");
    } else {
        sendResponse(503, "Unable to create employee");
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

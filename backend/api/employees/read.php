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

$query = "SELECT id, name, email, role, status, created_at FROM users WHERE role = 'employee'";
$stmt = $db->prepare($query);
$stmt->execute();

$users_arr = array();

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    extract($row);
    $user_item = array(
        "id" => $id,
        "name" => $name,
        "email" => $email,
        "role" => $role,
        "status" => $status,
        "created_at" => $created_at
    );
    array_push($users_arr, $user_item);
}

sendResponse(200, "Employees fetched successfully", $users_arr);
?>

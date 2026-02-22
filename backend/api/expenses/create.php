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

if(isset($data->title) && isset($data->amount) && isset($data->expense_date)) {
    $query = "INSERT INTO expenses SET employee_id=:employee_id, title=:title, amount=:amount, expense_date=:expense_date";
    $stmt = $db->prepare($query);

    $title = htmlspecialchars(strip_tags($data->title));
    $amount = htmlspecialchars(strip_tags($data->amount));
    $expense_date = htmlspecialchars(strip_tags($data->expense_date));
    $employee_id = $userData->id;

    $stmt->bindParam(":employee_id", $employee_id);
    $stmt->bindParam(":title", $title);
    $stmt->bindParam(":amount", $amount);
    $stmt->bindParam(":expense_date", $expense_date);

    if($stmt->execute()) {
        sendResponse(201, "Expense added successfully");
    } else {
        sendResponse(503, "Unable to add expense");
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

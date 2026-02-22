<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

$database = new Database();
$db = $database->getConnection();

// V2 Schema: date column is 'expense_date', linked user is 'employee_id'
$query = "SELECT e.*, u.name as employee_name 
          FROM expenses e 
          LEFT JOIN users u ON e.employee_id = u.id 
          ORDER BY e.expense_date DESC";
$stmt = $db->prepare($query);
$stmt->execute();

$expenses_arr = array();
$total_amount = 0;

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    extract($row);
    $item = array(
        "id" => $id,
        "title" => $title,
        "amount" => $amount,
        "expense_date" => $expense_date,
        "employee_name" => $employee_name
    );
    $total_amount += $amount;
    array_push($expenses_arr, $item);
}

sendResponse(200, "Expenses fetched successfully", [
    "records" => $expenses_arr,
    "total_amount" => $total_amount
]);
?>

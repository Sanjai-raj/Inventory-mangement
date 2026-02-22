<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once __DIR__ . '/config/cors.php';
include_once __DIR__ . '/config/database.php';

$response = [
    "status" => "error",
    "message" => "Unknown error",
    "checks" => []
];

// Check 1: PHP Version
$response['checks']['php_version'] = phpversion();

// Check 2: Database Connection
try {
    $database = new Database();
    $db = $database->getConnection();
    if ($db) {
        $response['checks']['database'] = "Connected successfully";
        $response['status'] = "success";
        $response['message'] = "Environment is healthy";
        
        // Check 3: Check for Admin User
        $stmt = $db->prepare("SELECT count(*) as count FROM users WHERE email='admin@example.com'");
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['checks']['admin_user_found'] = $row['count'] > 0 ? "Yes" : "No";

    } else {
        $response['checks']['database'] = "Connection failed (generic)";
    }
} catch (Exception $e) {
    $response['checks']['database'] = "Connection failed: " . $e->getMessage();
}

echo json_encode($response);
?>

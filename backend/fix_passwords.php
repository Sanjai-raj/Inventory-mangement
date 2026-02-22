<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

include_once __DIR__ . '/api/config/database.php';

echo "Resetting All Passwords...\n";

$database = new Database();
$db = $database->getConnection();

if ($db) {
    // Hash for 'admin123'
    $password = "admin123";
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Update ALL users
    $query = "UPDATE users SET password = :password";
    $stmt = $db->prepare($query);
    $stmt->bindParam(":password", $hashed_password);
    
    if($stmt->execute()) {
        echo "Successfully updated passwords for all users to: $password\n";
    } else {
        echo "Failed to update passwords.\n";
        print_r($stmt->errorInfo());
    }
} else {
    echo "Database connection failed.\n";
}
?>

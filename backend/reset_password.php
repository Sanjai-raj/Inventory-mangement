<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include_once __DIR__ . '/api/config/database.php';

echo "Testing Database Connection...\n";

$database = new Database();
$db = $database->getConnection();

if ($db) {
    echo "Connection Successful.\n";
    
    $password = "admin123";
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $email = "admin@example.com";
    
    $query = "UPDATE users SET password = :password WHERE email = :email";
    $stmt = $db->prepare($query);
    
    $stmt->bindParam(":password", $hashed_password);
    $stmt->bindParam(":email", $email);
    
    if($stmt->execute()) {
        echo "Password updated successfully for $email\n";
        echo "New Hash: " . $hashed_password . "\n";
    } else {
        echo "Failed to update password.\n";
        print_r($stmt->errorInfo());
    }
} else {
    echo "Connection Failed.\n";
}
?>

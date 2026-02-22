<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/database.php';
include_once __DIR__ . '/../config/response.php';

class JwtHandler {
    private $secret = "your_secret_key_here"; // Change this in production!

    public function generateToken($data) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode(array_merge($data, ['exp' => time() + 3600])); // 1 hour expiration
        
        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $this->secret, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->password)) {
    $email = htmlspecialchars(strip_tags($data->email));
    
    $query = "SELECT id, name, password, role FROM users WHERE email = ? LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $email);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if(password_verify($data->password, $row['password'])) {
            
            $jwtHandler = new JwtHandler();
            $token_data = [
                "id" => $row['id'],
                "name" => $row['name'],
                "email" => $email,
                "role" => $row['role']
            ];
            $jwt = $jwtHandler->generateToken($token_data);
            
            sendResponse(200, "Login successful", [
                "token" => $jwt,
                "user" => $token_data
            ]);
        } else {
            sendResponse(401, "Invalid password");
        }
    } else {
        sendResponse(401, "Email not found");
    }
} else {
    sendResponse(400, "Incomplete data");
}
?>

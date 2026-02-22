<?php
include_once '../config/response.php';

class AuthMiddleware {
    private $secret = "your_secret_key_here"; // Same secret as login

    public function validateToken() {
        $headers = apache_request_headers();
        $token = null;
        
        if(isset($headers['Authorization'])) {
            $matches = array();
            preg_match('/Bearer\s(\S+)/', $headers['Authorization'], $matches);
            if(isset($matches[1])) {
                $token = $matches[1];
            }
        }

        if($token) {
            $parts = explode('.', $token);
            if(count($parts) === 3) {
                $header = $parts[0];
                $payload = $parts[1];
                $signature_provided = $parts[2];

                $signature = hash_hmac('sha256', $header . "." . $payload, $this->secret, true);
                $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

                if($base64UrlSignature === $signature_provided) {
                    $payload_data = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)));
                    if($payload_data->exp < time()) {
                        sendResponse(401, "Token expired");
                    }
                    return $payload_data;
                }
            }
        }

        sendResponse(401, "Unauthorized access");
    }
}
?>

<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

// Path to Python executable (Assuming it's in system PATH)
// In production, use absolute path: /usr/bin/python3
$python = "python"; 
$script = __DIR__ . "/../../analytics/engine.py";

// Validate script existence
if (!file_exists($script)) {
    sendResponse(500, "Analytics engine not found");
    exit();
}

// Execute Python script
$command = escapeshellcmd("$python $script forecast");
$output = shell_exec($command);

// Output is JSON string from Python
$result = json_decode($output, true);

if ($result === null) {
    sendResponse(500, "Analytics engine failed", ["raw_output" => $output]);
} else {
    sendResponse(200, "Forecast generated successfully", $result);
}
?>

<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/response.php';
include_once __DIR__ . '/../middleware/auth.php';

$auth = new AuthMiddleware();
$auth->validateToken();

$python = "python"; 
$script = __DIR__ . "/../../analytics/engine.py";

if (!file_exists($script)) {
    sendResponse(500, "Analytics engine not found");
    exit();
}

$command = escapeshellcmd("$python $script anomalies");
$output = shell_exec($command);

$result = json_decode($output, true);

if ($result === null) {
    sendResponse(500, "Analytics engine failed", ["raw_output" => $output]);
} else {
    sendResponse(200, "Anomalies detected successfully", $result);
}
?>

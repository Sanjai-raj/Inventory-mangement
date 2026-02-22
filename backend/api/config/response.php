<?php
function sendResponse($status = 200, $message = "", $data = []) {
    http_response_code($status);
    $statusType = ($status >= 200 && $status < 300) ? "success" : "error";
    echo json_encode([
        "status" => $statusType,
        "message" => $message,
        "data" => $data
    ]);
    exit();
}
?>

<?php
include_once __DIR__ . '/../config/cors.php';
include_once __DIR__ . '/../config/response.php';

// JWT is stateless, so 'logout' is handled client-side by deleting the token.
// This endpoint exists for API completeness and potential future server-side invalidation (e.g. blacklist).

sendResponse(200, "Logout successful");
?>

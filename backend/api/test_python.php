<?php
$python = "python";
$script = __DIR__ . "/../analytics/engine.py";
$version = shell_exec("$python --version");
echo "Python Version: $version\n";

if (file_exists($script)) {
    echo "Engine script found at $script\n";
} else {
    echo "Engine script NOT found at $script\n";
}
?>

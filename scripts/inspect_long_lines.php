<?php

echo "=== PaymentController ===\n";
$lines = file(__DIR__ . '/../../backend/app/Http/Controllers/Api/PaymentController.php');
foreach ($lines as $idx => $line) {
    if (strlen($line) > 120 || ($idx >= 30 && $idx <= 42)) {
        echo ($idx + 1) . " (" . strlen($line) . " chars): " . $line;
    }
}

echo "\n=== AdminCategoryService ===\n";
$lines = file(__DIR__ . '/../../backend/app/Services/AdminCategoryService.php');
foreach ($lines as $idx => $line) {
    if (strlen($line) > 120 || ($idx >= 95 && $idx <= 110)) {
        echo ($idx + 1) . " (" . strlen($line) . " chars): " . $line;
    }
}

echo "\n=== PaymentService ===\n";
$lines = file(__DIR__ . '/../../backend/app/Services/PaymentService.php');
foreach ($lines as $idx => $line) {
    if (strlen($line) > 120 || ($idx >= 95 && $idx <= 115)) {
        echo ($idx + 1) . " (" . strlen($line) . " chars): " . $line;
    }
}

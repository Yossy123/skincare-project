<?php

// 1. Update BookingController.php
$bookingControllerFile = __DIR__ . '/../../backend/app/Http/Controllers/Api/BookingController.php';
$content = file_get_contents($bookingControllerFile);
$content = str_replace('$current->addMinutes(60);', '$current->addMinutes($durationMinutes);', $content);
file_put_contents($bookingControllerFile, $content);
echo "1. BookingController.php slot loop updated to addMinutes(\$durationMinutes)\n";

// 2. Update PaymentController.php line 37
$paymentControllerFile = __DIR__ . '/../../backend/app/Http/Controllers/Api/PaymentController.php';
$content = file_get_contents($paymentControllerFile);
$oldLine = "return response()->json(['data' => ['payment_id' => \$payment->id, 'token' => \$payment->snap_token, 'redirect_url' => \$payment->redirect_url, 'amount' => (float) \$payment->amount]], 201);";
$newLine = "return response()->json([
            'data' => [
                'payment_id' => \$payment->id,
                'token' => \$payment->snap_token,
                'redirect_url' => \$payment->redirect_url,
                'amount' => (float) \$payment->amount,
            ],
        ], 201);";
$content = str_replace($oldLine, $newLine, $content);
file_put_contents($paymentControllerFile, $content);
echo "2. PaymentController.php long line refactored\n";

// 3. Update AdminCategoryService.php line 102
$adminCategoryServiceFile = __DIR__ . '/../../backend/app/Services/AdminCategoryService.php';
$content = file_get_contents($adminCategoryServiceFile);
$oldLine = "'category' => [\"Cannot delete category '{\$category->name}' because it still contains {\$productsCount} products. Please reassign or delete the products first, or deactivate the category instead.\"],";
$newLine = "'category' => [
                    \"Cannot delete category '{\$category->name}' because it still contains {\$productsCount} products. \" .
                    \"Please reassign or delete the products first, or deactivate the category instead.\"
                ],";
$content = str_replace($oldLine, $newLine, $content);
file_put_contents($adminCategoryServiceFile, $content);
echo "3. AdminCategoryService.php long line refactored\n";

// 4. Update PaymentService.php line 106 & long lines
$paymentServiceFile = __DIR__ . '/../../backend/app/Services/PaymentService.php';
$content = file_get_contents($paymentServiceFile);

$oldLine1 = "\$items[] = ['id' => 'shipping', 'price' => (int) round((float) \$order->shipping_cost, 0), 'quantity' => 1, 'name' => 'Shipping'];";
$newLine1 = "\$items[] = [
            'id' => 'shipping',
            'price' => (int) round((float) \$order->shipping_cost, 0),
            'quantity' => 1,
            'name' => 'Shipping',
        ];";
$content = str_replace($oldLine1, $newLine1, $content);

$oldLine2 = "\$updates = ['transaction_id' => \$notification['transaction_id'] ?? \$payment->transaction_id, 'payment_type' => \$notification['payment_type'] ?? \$payment->payment_type, 'raw_response' => \$notification];";
$newLine2 = "\$updates = [
                'transaction_id' => \$notification['transaction_id'] ?? \$payment->transaction_id,
                'payment_type' => \$notification['payment_type'] ?? \$payment->payment_type,
                'raw_response' => \$notification,
            ];";
$content = str_replace($oldLine2, $newLine2, $content);

file_put_contents($paymentServiceFile, $content);
echo "4. PaymentService.php long lines refactored\n";

<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'rajaongkir' => [
        'api_key' => env('RAJAONGKIR_API_KEY'),
        'base_url' => env('RAJAONGKIR_BASE_URL', 'https://rajaongkir.komerce.id/api/v1/'),
        'origin_id' => (int) env('RAJAONGKIR_ORIGIN_ID', 17547),
        'timeout' => (int) env('RAJAONGKIR_TIMEOUT', 10),
    ],

    'midtrans' => [
        'server_key' => env('MIDTRANS_SERVER_KEY', 'SB-Mid-server-TEST_KEY'),
        'client_key' => env('MIDTRANS_CLIENT_KEY', 'SB-Mid-client-TEST_KEY'),
        'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),
        'api_base_url' => env('MIDTRANS_IS_PRODUCTION', false)
            ? 'https://api.midtrans.com/v2/'
            : 'https://api.sandbox.midtrans.com/v2/',
    ],

];

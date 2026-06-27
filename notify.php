<?php
// FCM v1 API 通知送信エンドポイント
// 【セットアップ手順】
// 1. Firebase Console > プロジェクトの設定 > サービスアカウント
//    → 「新しい秘密鍵の生成」でJSONをダウンロード
// 2. ダウンロードしたJSONを ms/firebase-service-account.json として配置
// 3. このファイルをサーバーにアップロード

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://buzzgis.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

$keyFile = __DIR__ . '/firebase-service-account.json';
if (!file_exists($keyFile)) {
    http_response_code(500);
    echo json_encode(['error' => 'service account not configured']);
    exit;
}

$key  = json_decode(file_get_contents($keyFile), true);
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['token'])) {
    http_response_code(400);
    echo json_encode(['error' => 'token required']);
    exit;
}

$title = $data['title'] ?? 'メッセージ';
$body  = $data['body']  ?? '';

// ── Google OAuth2 JWTでアクセストークン取得 ──
function base64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

$now     = time();
$header  = base64url(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
$payload = base64url(json_encode([
    'iss'   => $key['client_email'],
    'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
    'aud'   => 'https://oauth2.googleapis.com/token',
    'iat'   => $now,
    'exp'   => $now + 3600,
]));

$sig = '';
openssl_sign("$header.$payload", $sig, $key['private_key'], OPENSSL_ALGO_SHA256);
$jwt = "$header.$payload." . base64url($sig);

$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion'  => $jwt,
    ]),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
]);
$tokenResp = json_decode(curl_exec($ch), true);
curl_close($ch);

if (empty($tokenResp['access_token'])) {
    http_response_code(500);
    echo json_encode(['error' => 'oauth failed']);
    exit;
}

// ── FCM v1 API でプッシュ送信 ──
$msg = [
    'message' => [
        'token'        => $data['token'],
        'notification' => ['title' => $title, 'body' => $body],
        'android'      => [
            'priority'     => 'high',
            'notification' => ['channel_id' => 'msg_ch', 'sound' => 'default'],
        ],
    ],
];

$ch2 = curl_init("https://fcm.googleapis.com/v1/projects/{$key['project_id']}/messages:send");
curl_setopt_array($ch2, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ' . $tokenResp['access_token'],
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS     => json_encode($msg),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 10,
]);
echo curl_exec($ch2);
curl_close($ch2);

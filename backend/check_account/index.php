<?php
require('../vendor/autoload.php');
include('../common/functions.php');
include('../common/general_rate_limit.php');

use Goutte\Client;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\RetryableHttpClient;

use RateLimit\Exception\LimitExceeded;
use RateLimit\Rate;
use RateLimit\RedisRateLimiter;

$conn = connect_to_database();

// Check token
if (!UOMA_CONFIG['allow_unauthenticated']) {
    $token_ability = check_token($conn);
    if (check_token($conn) === false) {
        // Token not verified
        rest_response(array(
            'tokenRequired' => true
        ));

        $conn->close();
        die();
    }
} else if (!UOMA_CONFIG['allow_account']) {
    // Don't allow
    rest_die('Feature not allowed.', $conn);
}

$conn->close();

// Get cahced data (if exists)
$user = get_user();

// Rate limit
if (UOMA_RATE_LIMIT) {
    $redis = new Redis();
    if ($redis->connect(UOMA_REDIS['host'], UOMA_REDIS['port'])) {
        $rateLimiter = new RedisRateLimiter($redis);

        $apiKey = 'check-account-'.$user['username'];
    
        try {
            $rateLimiter->limit($apiKey, Rate::custom(3, 10));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
    }
}

// Set up HTTP client
$httpClient = new RetryableHttpClient(HttpClient::create([
    'timeout' => 30,
    'headers' => [
        'User-Agent' => UOMA_USER_AGENT,
    ],
]), null, 1);

$client = new Client($httpClient);

$client->restart();

// Login from CAS, regardless of Cookie since there is already a cache layer
$client->request(
    'GET',
    'https://login.manchester.ac.uk/cas/login?service=https%3A%2F%2Fstudentnet.cs.manchester.ac.uk%2Fugt%2Fattendance%2F'
);

$crawler = $client->submitForm('Login', [
    'username' => $user['username'],
    'password' => $user['password'],
]);

if (strpos($crawler->html(), 'class="cas-logout"') === false) {
    rest_response(array(
        'login' => false,
    ));
    die();
}

// Response
rest_response(array(
    'login' => true,
));

?>
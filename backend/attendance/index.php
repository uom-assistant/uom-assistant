<?php
require('../vendor/autoload.php');
include('../common/functions.php');
include('../common/cache.php');
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

// Get cahced data (if exists)
$user = get_user();

// Rate limit
if (UOMA_RATE_LIMIT) {
    $redis = new Redis();
    if ($redis->connect(UOMA_REDIS['host'], UOMA_REDIS['port'])) {
        $rateLimiter = new RedisRateLimiter($redis);

        $apiKey = 'get-attendance-'.$user['username'];
    
        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 10));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.');
        }
    } else {
        rest_die('Rate limit error.');
    }
}

$cached_response = get_cache('attendance', $user['username'], $conn);

if ($cached_response !== false) {
    // Send cached response back
    rest_response($cached_response);

    $conn->close();
} else {
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

    if (strpos($crawler->html(), 'additionalattendancetableid') === false) {
        rest_die('Unable to login', $conn);
    }

    // Check absent
    $absent_list = array_values(array_filter($crawler->filter('#additionalattendancetableid > tbody > tr')->each(function(\Symfony\Component\DomCrawler\Crawler $node, $i) {
        if ($node->filter('td')->eq(3)->text() !== 'Present') {
            return array(
                'name' => $node->filter('td')->eq(2)->text(),
                'subject' => $node->filter('td')->eq(1)->text(),
                'date' => $node->filter('td')->eq(0)->text()
            );
        }
        return false;
    })));

    // Response
    $response = array(
        'lastMonth' => substr(explode('h: ', $crawler->filter('.mainContentContainer .curved .indentdiv > div')->first()->filter('div > div')->eq(2)->filter('ul')->eq(1)->filter('li')->eq(1)->text())[1], 0, -1),
        'annual' => substr(explode('l: ', $crawler->filter('.mainContentContainer .curved .indentdiv > div')->first()->filter('div > div')->eq(2)->filter('ul')->eq(1)->filter('li')->first()->text())[1], 0, -1),
        'absentRecord' => $absent_list,
    );
    rest_response($response);

    // Set cache
    set_cache('attendance', $user['username'], $response, '+3 hours', $conn);

    $conn->close();
}

?>
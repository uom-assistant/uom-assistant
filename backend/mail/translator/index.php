<?php
require('../../vendor/autoload.php');
include('../../common/functions.php');
include('../../common/cache.php');
include('../common/general_rate_limit.php');

use RateLimit\Exception\LimitExceeded;
use RateLimit\Rate;
use RateLimit\RedisRateLimiter;

if (!function_exists('imap_open')) {
    rest_die('Feature not allowed.');
}

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
} else if (!UOMA_CONFIG['allow_mail_server']) {
    // Don't allow
    rest_die('Feature not allowed.', $conn);
}

$data = get_post_data();

// Rate limit
if (UOMA_RATE_LIMIT) {
    $redis = new Redis();
    if ($redis->connect(UOMA_REDIS['host'], UOMA_REDIS['port'])) {
        $rateLimiter = new RedisRateLimiter($redis);

        $apiKey = 'get-mail-translatior-'.$data['email'];

        try {
            $rateLimiter->limit($apiKey, Rate::custom(30, 30));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
    }
}


if (!isset($data['email']) || !validate_data('email', $data['email'])) {
    rest_die('Invalid request.', $conn);
}

$translator = false;

if (!UOMA_CONFIG['allow_mail_translator'] || !UOMA_CONFIG['mail_translator_config'] || (UOMA_CONFIG['mail_translator_config']['service'] !== 'deepl' && UOMA_CONFIG['mail_translator_config']['service'] !== 'azure' && UOMA_CONFIG['mail_translator_config']['service'] !== 'google') || (UOMA_CONFIG['mail_translator_config']['service'] === 'azure' && UOMA_CONFIG['mail_translator_config']['region'] === '') || UOMA_CONFIG['mail_translator_config']['gateway'] === '' || UOMA_CONFIG['mail_translator_config']['token'] === '') {
    $translator = false;
} else {
    $translator = UOMA_CONFIG['mail_translator_config']['service'];
}

rest_response(array(
    'translator' => $translator,
));

$conn->close();

?>
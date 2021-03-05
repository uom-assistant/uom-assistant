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

// Get cahced data (if exists)
$user = get_user();

// Rate limit
if (UOMA_RATE_LIMIT) {
    $redis = new Redis();
    if ($redis->connect(UOMA_REDIS['host'], UOMA_REDIS['port'])) {
        $rateLimiter = new RedisRateLimiter($redis);

        $apiKey = 'get-mail-body-'.$user['email'];
    
        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 10));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.');
        }
    } else {
        rest_die('Rate limit error.');
    }
}

if ($user['email'] === false || !isset(get_post_data()['mail_id'])) {
    rest_die('Invalid request.', $conn);
}
$id = (int)get_post_data()['mail_id'];

$purifier = new HTMLPurifier(HTMLPurifier_HTML5Config::createDefault());

$mailbox = new PhpImap\Mailbox(
    '{outlook.office365.com:993/imap/ssl}INBOX',
    $user['email'],
    $user['password'],
    null,
    'UTF-8'
);

$mailbox->setConnectionArgs(CL_EXPUNGE);
$mailbox->setAttachmentsIgnore(true);
$mailbox->setPathDelimiter('/');

try {
    $email = $mailbox->getMail($id, true);
} catch(PhpImap\Exceptions\ConnectionException $e) {
    rest_die('IMAP connection failed.');
} catch(UnexpectedValueException $e) {
    rest_die('Unable to login.');
}

if (!empty($email->autoSubmitted)) {
    $mailbox->markMailAsRead($id);
}
if (!empty($email->precedence)) {
    $mailbox->markMailAsRead($id);
}

rest_response(array(
    'id' => $id,
    'attachments' => (!empty($email->getAttachments())) ? count($email->getAttachments()) : 0,
    'content' => $email->textHtml ? $purifier->purify($email->textHtml) : $email->textPlain,
    'plainContent' => $email->textPlain,
));

$mailbox->disconnect();

?>
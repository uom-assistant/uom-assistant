<?php
require('../../vendor/autoload.php');
include('../../common/functions.php');
include('../../common/cache.php');
include('../common/general_rate_limit.php');

use RateLimit\Exception\LimitExceeded;
use RateLimit\Rate;
use RateLimit\RedisRateLimiter;

ob_implicit_flush(true);
ob_end_flush();

header('Access-Control-Allow-Origin: '.get_access_control_allow_origin_header());

if (!function_exists('imap_open')) {
    http_response_code(500);
}

$conn = connect_to_database();

// Check token
if (!UOMA_CONFIG['allow_unauthenticated']) {
    $token_ability = check_token($conn);
    if (check_token($conn) === false) {
        // Token not verified
        http_response_code(403);

        $conn->close();
        die();
    }
} else if (!UOMA_CONFIG['allow_mail_server']) {
    // Don't allow
    http_response_code(403);
}

// Get cahced data (if exists)
$user = get_user();

// Rate limit
if (UOMA_RATE_LIMIT) {
    $redis = new Redis();
    if ($redis->connect(UOMA_REDIS['host'], UOMA_REDIS['port'])) {
        $rateLimiter = new RedisRateLimiter($redis);

        $apiKey = 'download-attachment-'.$user['email'];
    
        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 10));
        } catch (LimitExceeded $exception) {
            http_response_code(403);
        }
    } else {
        http_response_code(403);
    }
}

$data = get_post_data();

if ($user['email'] === false || !isset($data['mailId']) || !isset($data['fileName'])) {
    http_response_code(403);
}
$id = (int)$data['mailId'];

$mailbox = new PhpImap\Mailbox(
    '{outlook.office365.com:993/imap/ssl}INBOX',
    $user['email'],
    $user['password'],
    null,
    'UTF-8'
);

$mailbox->setConnectionArgs(CL_EXPUNGE);
$mailbox->setPathDelimiter('/');

try {
    $email = $mailbox->getMail($id, false);
} catch(PhpImap\Exceptions\ConnectionException $e) {
    http_response_code(500);
} catch(UnexpectedValueException $e) {
    http_response_code(403);
}

$attachments = $email->getAttachments();
if (!empty($attachments)) {
    foreach ($attachments as $attachment) {
        if ('attachment' == \mb_strtolower((string) $attachment->disposition) && $attachment->name === $data['fileName']) {
            header('Content-Type: '.$attachment->getFileInfo(FILEINFO_MIME));
            echo $attachment->getContents();
            break;
        }
    }
}

$mailbox->disconnect();

$conn->close();

?>
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

        $apiKey = 'mail-action-'.$user['email'];

        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 5));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
    }
}

$data = get_post_data();
if ($user['email'] === false || !isset($data['mailId']) || !isset($data['action'])) {
    rest_die('Invalid request.', $conn);
}
if ($data['action'] !== 'junk' && $data['action'] !== 'flag' && $data['action'] !== 'unflag' && $data['action'] !== 'seen' && $data['action'] !== 'delete' && $data['action'] !== 'allread') {
    rest_die('Invalid request.', $conn);
}
$id = (int)$data['mailId'];

$imap = imap_open('{outlook.office365.com:993/imap/ssl}INBOX', $user['email'], $user['password']);

if ($data['action'] === 'junk') {
    imap_mail_move($imap, strval(imap_msgno($imap, (int)$data['mailId'])), 'Junk');
} else if ($data['action'] === 'flag') {
    imap_setflag_full($imap, strval(imap_msgno($imap, (int)$data['mailId'])), '\\Flagged');
} else if ($data['action'] === 'unflag') {
    imap_clearflag_full($imap, strval(imap_msgno($imap, (int)$data['mailId'])), '\\Flagged');
} else if ($data['action'] === 'seen') {
    imap_setflag_full($imap, strval(imap_msgno($imap, (int)$data['mailId'])), '\\Seen');
} else if ($data['action'] === 'delete') {
    imap_delete($imap, strval(imap_msgno($imap, (int)$data['mailId'])));
} else if ($data['action'] === 'allread') {
    $all = imap_search($imap, 'UNDELETED UNSEEN ALL');
    if ($all) {
        imap_setflag_full($imap, implode(',', $all), '\\Seen');
    }
}

rest_response([]);

imap_close($imap, CL_EXPUNGE);

$conn->close();

?>
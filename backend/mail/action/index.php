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
            rest_die('Rate limit exceeded.');
        }
    } else {
        rest_die('Rate limit error.');
    }
}

$data = get_post_data();
if ($user['email'] === false || !isset($data['mail_id']) || !isset($data['action'])) {
    rest_die('Invalid request.', $conn);
}
if ($user['action'] !== 'junk' && $user['action'] !== 'flag' && $user['action'] !== 'detele' && $user['action'] !== 'unread' && $user['action'] !== 'allread') {
    rest_die('Invalid request.', $conn);
}
$id = (int)get_post_data()['mail_id'];

$imap = imap_open('{outlook.office365.com:993/imap/ssl}INBOX', $user['email'], $user['password']);

if ($user['action'] === 'junk') {
    imap_mail_move($imap, strval(imap_msgno($imap, (int)$data['mail_id'])), '{outlook.office365.com:993/imap/ssl}Junk Email');
} else if ($user['action'] === 'flag') {
    imap_setflag_full($imap, strval(imap_msgno($imap, (int)$data['mail_id'])), '\\Flagged');
} else if ($user['action'] === 'detele') {
    imap_delete($imap, strval(imap_msgno($imap, (int)$data['mail_id'])));
} else if ($user['action'] === 'unread') {
    imap_clearflag_full($imap, strval(imap_msgno($imap, (int)$data['mail_id'])), '\\Seen');
} else if ($user['action'] === 'allread') {
    $all = imap_search($imap, 'UNDELETED UNSEEN ALL');
    imap_setflag_full($imap, implode(',', $all), '\\Seen');
}

rest_response([]);

imap_close($imap, CL_EXPUNGE);

?>
<?php
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

        $apiKey = 'get-mail-list-'.$user['email'];
    
        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 10));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.');
        }
    } else {
        rest_die('Rate limit error.');
    }
}

if ($user['email'] === false) {
    rest_die('Invalid request.', $conn);
}
$cached_response = get_cache('mail_list', $user['email'], $conn);

if ($cached_response !== false) {
    // Send cached response back
    rest_response($cached_response);

    $conn->close();
} else {
    // Login to mailbox
    $imap = imap_open('{outlook.office365.com:993/imap/ssl}INBOX', $user['email'], $user['password']);

    if ($imap === false) {
        rest_die('Unable to login.', $conn);
    }

    // Fetch emails within 2 weeks
    $all = imap_search($imap, 'UNDELETED SINCE "'.date('j-M-Y', strtotime('-2 weeks')).'"');

    if ($all === false) {
        rest_response([]);
    }

    $headers = [];
    foreach ($all as $item) {
        $mail_header = json_decode(json_encode(imap_header($imap, $item)), true);
        $to = [];
        if (isset($mail_header['to'])) {
            foreach ($mail_header['to'] as $item) {
                $to[] = array(
                    'name' => isset($item['personal']) ? trim($item['personal']) : false,
                    'address' => trim($item['mailbox']).'@'.trim($item['host'])
                );
            }
        }

        $cc = [];
        if (isset($mail_header['cc'])) {
            foreach ($mail_header['cc'] as $item) {
                $cc[] = array(
                    'name' => isset($item['personal']) ? trim($item['personal']) : false,
                    'address' => trim($item['mailbox']).'@'.trim($item['host'])
                );
            }
        }
        $headers[] = array(
            'subject' => isset($mail_header['subject']) ? trim($mail_header['subject']) : false,
            'from' => trim($mail_header['from'][0]['personal']) === '' ? false : trim($mail_header['from'][0]['personal']),
            'fromAddress' => trim($mail_header['from'][0]['mailbox']).'@'.trim($mail_header['from'][0]['host']),
            'replyTo' => isset($mail_header['reply_to'][0]['personal']) ? trim($mail_header['reply_to'][0]['personal']) : false,
            'replyToAddress' => isset($mail_header['reply_to'][0]) ? trim($mail_header['reply_to'][0]['mailbox']).'@'.trim($mail_header['reply_to'][0]['host']) : false,
            'to' => $to,
            'cc' => $cc,
            'id' => imap_uid($imap, (int)trim($mail_header['Msgno'])),
            'messageId' => (isset($mail_header['message_id']) && strlen(trim($mail_header['message_id'])) > 7) ? str_replace('"', '', (trim($mail_header['message_id']))) : false,
            'date' => $mail_header['udate'],
            'flagged' => $mail_header['Flagged'] === 'F',
            'unseen' => $mail_header['Unseen'] === 'U' || $mail_header['Recent'] === 'N'
        );
    }

    rest_response($headers);

    imap_close($imap, CL_EXPUNGE);

    // Set cache
    set_cache('mail_list', $user['email'], $headers, '+5 minutes', $conn);

    $conn->close();
}

?>
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
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
    }
}

// Handle imap mime encode. Code from https://github.com/barbushin/php-imap/blob/master/src/PhpImap/Mailbox.php
function lowercase_mb_list_encodings() {
    $lowercase_encodings = [];
    $encodings = \mb_list_encodings();
    foreach ($encodings as $encoding) {
        $lowercase_encodings[] = \strtolower($encoding);
    }
    return $lowercase_encodings;
}

function convert_to_utf8($string, $fromCharset) {
    $fromCharset = mb_strtolower($fromCharset);
    $newString = '';

    switch ($fromCharset) {
        case 'default': // Charset default is already ASCII (not encoded)
        case 'utf-8': // Charset UTF-8 is OK
            $newString .= $string;
            break;
        default:
            // If charset exists in mb_list_encodings(), convert using mb_convert function
            if (\in_array($fromCharset, lowercase_mb_list_encodings(), true)) {
                $newString .= \mb_convert_encoding($string, 'UTF-8', $fromCharset);
            } else {
                // Fallback: Try to convert with iconv()
                $iconv_converted_string = @\iconv($fromCharset, 'UTF-8', $string);
                if (!$iconv_converted_string) {
                    // If iconv() could also not convert, return string as it is
                    // (unknown charset)
                    $newString .= $string;
                } else {
                    $newString .= $iconv_converted_string;
                }
            }
            break;
    }
    return $newString;
}

/**
 * Decodes a mime string.
 *
 * @param string $string MIME string to decode
 * @return string Converted string if conversion was successful, or the original string if not
 */
function mime_encode($string) {
    $newString = '';
    $elements = \imap_mime_header_decode($string);
    if (false === $elements) {
        return $string;
    }
    foreach ($elements as $element) {
        $newString .= convert_to_utf8($element->text, $element->charset);
    }
    return $newString;
}

/**
 * Find a header value from a header array.
 *
 * @param string $header The header is looking for
 * @param array $raw The headers array
 * @return mixed The value of the header or false if not found
 */
function get_header($header, $raw) {
    $header = strtolower($header);
    foreach ($raw as $line) {
        if (strpos(strtolower($line) , $header.':') === 0) {
            return trim(explode(':', $line, 2)[1]);
        }
    }
    return false;
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
        $mail_header = json_decode(json_encode(imap_headerinfo($imap, $item)), true);
        $mail_raw_header = preg_split("/\R/", imap_fetchheader($imap, $item));
        $to = [];
        if (isset($mail_header['to'])) {
            foreach ($mail_header['to'] as $item) {
                $to[] = array(
                    'name' => isset($item['personal']) ? mime_encode(trim($item['personal'])) : false,
                    'address' => trim($item['mailbox']).'@'.trim($item['host'])
                );
            }
        }

        $importance = 'm';
        $h_importance = strtolower(get_header('Importance', $mail_raw_header));
        $h_priority = strtolower(get_header('Priority', $mail_raw_header));
        $h_x_priority = strtolower(get_header('X-Priority', $mail_raw_header));
        $h_x_msmail_priority = strtolower(get_header('X-MSMail-Priority', $mail_raw_header));
        if ($h_importance) {
            if ($h_importance === 'low') {
                $importance = 'l';
            } elseif ($h_importance === 'high') {
                $importance = 'h';
            }
        } elseif ($h_priority) {
            if ($h_priority === 'non-urgent') {
                $importance = 'l';
            } elseif ($h_priority === 'urgent') {
                $importance = 'h';
            }
        } elseif ($h_x_priority) {
            if ($h_priority === '4' || $h_priority === '5') {
                $importance = 'l';
            } elseif ($h_priority === '1' || $h_priority === '2') {
                $importance = 'h';
            }
        } elseif ($h_x_msmail_priority) {
            if ($h_x_msmail_priority === 'low') {
                $importance = 'l';
            } elseif ($h_x_msmail_priority === 'high') {
                $importance = 'h';
            }
        }

        $confirm = false;
        $h_x_confirm_reading_to = trim(strtolower(get_header('X-Confirm-Reading-To', $mail_raw_header)), '<>');
        $h_return_receipt_to = trim(strtolower(get_header('Return-Receipt-To', $mail_raw_header)), '<>');
        $h_read_receipt_to = trim(strtolower(get_header('Read-Receipt-To', $mail_raw_header)), '<>');
        if ($h_x_confirm_reading_to) {
            $confirm = $h_x_confirm_reading_to;
        } elseif ($h_return_receipt_to) {
            $confirm = $h_return_receipt_to;
        } elseif ($h_read_receipt_to) {
            $confirm = $h_read_receipt_to;
        }

        $cc = [];
        if (isset($mail_header['cc'])) {
            foreach ($mail_header['cc'] as $item) {
                $cc[] = array(
                    'name' => isset($item['personal']) ? mime_encode(trim($item['personal'])) : false,
                    'address' => trim($item['mailbox']).'@'.trim($item['host'])
                );
            }
        }
        $headers[] = array(
            'subject' => isset($mail_header['subject']) ? mime_encode(trim($mail_header['subject'])) : false,
            'from' => ((!isset($mail_header['from'][0]['personal'])) || trim($mail_header['from'][0]['personal']) === '') ? false : mime_encode(trim($mail_header['from'][0]['personal'])),
            'fromAddress' => trim($mail_header['from'][0]['mailbox']).'@'.trim($mail_header['from'][0]['host']),
            'replyTo' => isset($mail_header['reply_to'][0]['personal']) ? mime_encode(trim($mail_header['reply_to'][0]['personal'])) : false,
            'replyToAddress' => isset($mail_header['reply_to'][0]) ? trim($mail_header['reply_to'][0]['mailbox']).'@'.trim($mail_header['reply_to'][0]['host']) : false,
            'to' => $to,
            'cc' => $cc,
            'id' => imap_uid($imap, (int)trim($mail_header['Msgno'])),
            'messageId' => (isset($mail_header['message_id']) && strlen(trim($mail_header['message_id'])) > 7) ? str_replace('"', '', (trim($mail_header['message_id']))) : false,
            'date' => $mail_header['udate'],
            'flagged' => $mail_header['Flagged'] === 'F',
            'unseen' => $mail_header['Unseen'] === 'U' || $mail_header['Recent'] === 'N',
            'importance' => $importance,
            'confirm' => $confirm,
        );
    }

    rest_response($headers);

    imap_close($imap, CL_EXPUNGE);

    // Set cache
    set_cache('mail_list', $user['email'], $headers, '+5 minutes', $conn);

    $conn->close();
}

?>
<?php
require('../../vendor/autoload.php');
include('../../common/functions.php');
include('../../common/cache.php');
include('../common/general_rate_limit.php');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

use Pelago\Emogrifier\CssInliner;
use Pelago\Emogrifier\HtmlProcessor\CssToAttributeConverter;
use Pelago\Emogrifier\HtmlProcessor\HtmlNormalizer;

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
// Check args
$data = get_post_data();
$user = get_user();

// Rate limit
if (UOMA_RATE_LIMIT) {
    $redis = new Redis();
    if ($redis->connect(UOMA_REDIS['host'], UOMA_REDIS['port'])) {
        $rateLimiter = new RedisRateLimiter($redis);

        $apiKey = 'send-mail-'.$user['email'];

        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 30));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
    }
}

if ($user['email'] === false || !isset($data['to']) || gettype($data['to']) !== 'array' || !isset($data['reply_to']) || gettype($data['reply_to']) !== 'array' || !isset($data['cc']) || gettype($data['cc']) !== 'array' || !isset($data['reply']) || gettype($data['reply']) !== 'string' || !isset($data['subject']) || gettype($data['subject']) !== 'string' || strlen($data['subject']) > 500 || !isset($data['body']) || gettype($data['body']) !== 'string' || !isset($data['altbody']) || gettype($data['altbody']) !== 'string') {
    rest_die('Invalid request.', $conn);
}

/**
 * Get name from an email address
 * 
 * @param string $email Email address
 * @return string name
 */
function get_name($email) {
    return ucwords(strtolower(trim(str_replace('.', ' ', str_replace('-', ' ', preg_replace('/\d/', '', explode('@', $email)[0]))))), ' ');
}

$mail = new PHPMailer();
$mail->CharSet = 'UTF-8';
$mail->Encoding = 'base64';
$mail->isSMTP();
$mail->SMTPDebug = SMTP::DEBUG_OFF;

$mail->Host = 'smtp.office365.com';
$mail->Port = 587;
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->SMTPAuth = true;

$mail->Username = $user['email'];
$mail->Password = $user['password'];

$mail->setFrom($mail->Username, get_name($mail->Username));

$to_list = $data['to'];
if (count($data['to']) === 0) {
    $to_list = $data['reply_to'];
}
if (count($to_list) === 0) {
    rest_die('Invalid request.', $conn);
}

foreach ($to_list as $item) {
    if (preg_match('/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/', $item['address'])) {
        $mail->addAddress($item['address'], isset($item['name']) ? $item['name'] : '');
    } else {
        rest_die('Invalid request.', $conn);
    }
}

foreach ($data['cc'] as $item) {
    if (preg_match('/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/', $item['address'])) {
        $mail->addCC($item['address'], '');
    } else {
        rest_die('Invalid request.', $conn);
    }
}

if ($data['reply'] !== '' && preg_match('/^<(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))>$/', $data['reply'])) {
    $mail->addCustomHeader('In-Reply-To', $data['reply']);
    $mail->addCustomHeader('References', $data['reply']);
}

$mail->Subject = $data['subject'];
$mail->msgHTML(HtmlNormalizer::fromHtml(CssToAttributeConverter::fromHtml(CssInliner::fromHtml($data['body'])->inlineCss()->render())
->convertCssToVisualAttributes()->render())->render());
$mail->AltBody = $data['altbody'];

if (!$mail->send()) {
    rest_die('Error: '.$mail->ErrorInfo, $conn);
} else {
    rest_response([]);
}

$conn->close();

?>
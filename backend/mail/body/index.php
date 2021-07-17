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
            $rateLimiter->limit($apiKey, Rate::custom(2, 5));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
    }
}

if ($user['email'] === false || !isset(get_post_data()['mailId'])) {
    rest_die('Invalid request.', $conn);
}
$id = (int)get_post_data()['mailId'];

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
    $email = $mailbox->getMail($id, true);
} catch(PhpImap\Exceptions\ConnectionException $e) {
    rest_die('IMAP connection failed.', $conn);
} catch(UnexpectedValueException $e) {
    rest_die('Unable to login.', $conn);
}

if (!empty($email->autoSubmitted)) {
    $mailbox->markMailAsRead($id);
}
if (!empty($email->precedence)) {
    $mailbox->markMailAsRead($id);
}

$email->embedImageAttachments();

$encode_array = array(
    'UTF-8',
    'ASCII',
    'GBK',
    'UTF-16',
    'UTF-7',
    'UTF7-IMAP',
    'EUC-JP',
    'SJIS',
    'eucJP-win',
    'SJIS-win',
    'ISO-2022-JP',
    'ISO-2022-JP-MS',
    'CP932',
    'CP51932',
    'SJIS-mac',
    'SJIS-Mobile#DOCOMO',
    'SJIS-Mobile#KDDI',
    'SJIS-Mobile#SOFTBANK',
    'UTF-8-Mobile#DOCOMO',
    'UTF-8-Mobile#KDDI-A',
    'UTF-8-Mobile#KDDI-B',
    'UTF-8-Mobile#SOFTBANK',
    'ISO-2022-JP-MOBILE#KDDI',
    'JIS',
    'JIS-ms',
    'CP50220',
    'CP50220raw',
    'CP50221',
    'CP50222',
    'ISO-8859-1',
    'ISO-8859-2',
    'ISO-8859-3',
    'ISO-8859-4',
    'ISO-8859-5',
    'ISO-8859-6',
    'ISO-8859-7',
    'ISO-8859-8',
    'ISO-8859-9',
    'ISO-8859-10',
    'ISO-8859-13',
    'ISO-8859-14',
    'ISO-8859-15',
    'ISO-8859-16',
    'byte2be',
    'byte2le',
    'byte4be',
    'byte4le',
    'BASE64',
    'HTML-ENTITIES',
    '7bit',
    '8bit',
    'EUC-CN',
    'CP936',
    'GB18030',
    'HZ',
    'EUC-TW',
    'CP950',
    'BIG-5',
    'EUC-KR',
    'UHC',
    'ISO-2022-KR',
    'Windows-1251',
    'Windows-1252',
    'CP866',
    'KOI8-R',
    'KOI8-U',
    'ArmSCII-8',
);

$attachments = $email->getAttachments();
$attachment_list = [];
if (!empty($attachments)) {
    foreach ($attachments as $attachment) {
        if ('attachment' == \mb_strtolower((string) $attachment->disposition)) {
            $attachment_list[] = [(string) $attachment->name, (int) strlen($attachment->getContents())];
        }
    }
}

$translator = false;

if (UOMA_CONFIG['allow_mail_translator'] && !(!UOMA_CONFIG['mail_translator_config'] || (UOMA_CONFIG['mail_translator_config']['service'] !== 'deepl' && UOMA_CONFIG['mail_translator_config']['service'] !== 'azure' && UOMA_CONFIG['mail_translator_config']['service'] !== 'google') || (UOMA_CONFIG['mail_translator_config']['service'] === 'azure' && UOMA_CONFIG['mail_translator_config']['service'] === 'region') || UOMA_CONFIG['mail_translator_config']['gateway'] === '' || UOMA_CONFIG['mail_translator_config']['token'] === '')) {
    $translator = UOMA_CONFIG['mail_translator_config']['service'];
}

rest_response(array(
    'id' => $id,
    'attachments' => $attachment_list,
    'content' => $email->textHtml ? mb_convert_encoding($email->textHtml, 'UTF-8', mb_detect_encoding($email->textHtml, $encode_array)) : $email->textPlain,
    'plainContent' => $email->textPlain,
    'translator' => $translator,
));

$mailbox->disconnect();

$conn->close();

?>
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
} else if (!UOMA_CONFIG['allow_mail_translator']) {
    // Don't allow
    rest_die('Feature not allowed.', $conn);
} else if (!UOMA_CONFIG['mail_translator_config'] || (UOMA_CONFIG['mail_translator_config']['service'] !== 'deepl' && UOMA_CONFIG['mail_translator_config']['service'] !== 'azure' && UOMA_CONFIG['mail_translator_config']['service'] !== 'google') || (UOMA_CONFIG['mail_translator_config']['service'] === 'azure' && UOMA_CONFIG['mail_translator_config']['service'] === 'region') || UOMA_CONFIG['mail_translator_config']['gateway'] === '' || UOMA_CONFIG['mail_translator_config']['token'] === '') {
    // Don't allow
    rest_die('Feature not allowed.', $conn);
}

$data = get_post_data();

// Rate limit
if (UOMA_RATE_LIMIT) {
    $redis = new Redis();
    if ($redis->connect(UOMA_REDIS['host'], UOMA_REDIS['port'])) {
        $rateLimiter = new RedisRateLimiter($redis);

        $apiKey = 'get-mail-translation-'.$data['email'];
    
        try {
            $rateLimiter->limit($apiKey, Rate::custom(1, 5));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
    }
}


if (!isset($data['email']) || !isset($data['mailId']) || !isset($data['subject']) || !isset($data['body']) || !isset($data['from']) || !isset($data['to']) || !validate_data('email', $data['email']) || strlen($data['body']) <= 5) {
    rest_die('Invalid request.', $conn);
}

try {
    if (UOMA_CONFIG['mail_translator_config']['service'] === 'deepl') {
        // Handle DeepL API
        $query = http_build_query(array(
            'auth_key' => UOMA_CONFIG['mail_translator_config']['token'],
            'target_lang' => $data['to'],
            'tag_handling' => 'xml',
            'split_sentences' => 'nonewlines',
            'preserve_formatting' => '1',
            'text' => $data['body'],
            'ignore_tags' => 'head,style,script,title,meta,link,code,pre,svg'
        ));

        if ($data['subject'] !== '') {
            $query .= '&'.http_build_query(array(
                'text' => $data['subject'],
            ));
        }

        if ($data['from'] !== 'auto') {
            $query .= '&'.http_build_query(array(
                'source_lang' => $data['from'],
            ));
        }

        $options = array(
            'http' => array(
                'method' => 'POST',
                'header' => 'Content-type: application/x-www-form-urlencoded',
                'content' => $query,
                'timeout' => 30 * 60
            )
        );
        $result = file_get_contents(UOMA_CONFIG['mail_translator_config']['gateway'], false, stream_context_create($options));

        if ($result === false) {
            rest_die('Unable to translate.', $conn);
        } else {
            $result = json_decode($result, true);
        }

        rest_response(array(
            'id' => (int)$data['mailId'],
            'source' => $data['from'] !== 'auto' ? $data['from'] : $result['translations'][0]['detected_source_language'],
            'translatedSubject' => $data['subject'] === '' ? '' : $result['translations'][1]['text'],
            'translatedBody' => $result['translations'][0]['text'],
        ));
    } else if (UOMA_CONFIG['mail_translator_config']['service'] === 'google') {
        // Handle Google API
        $query = http_build_query(array(
            'key' => UOMA_CONFIG['mail_translator_config']['token'],
            'target' => $data['to'],
            'format' => 'html',
            'q' => $data['body']
        ));
        
        if ($data['subject'] !== '') {
            $query .= '&'.http_build_query(array(
                'q' => $data['subject'],
            ));
        }

        if ($data['from'] !== 'auto') {
            $query .= '&'.http_build_query(array(
                'source' => $data['from'],
            ));
        }

        $options = array(
            'http' => array(
                'method' => 'POST',
                'header' => 'Content-type: application/x-www-form-urlencoded',
                'content' => $query,
                'timeout' => 30 * 60
            )
        );
        $result = file_get_contents(UOMA_CONFIG['mail_translator_config']['gateway'], false, stream_context_create($options));

        if ($result === false) {
            rest_die('Unable to translate.', $conn);
        } else {
            $result = json_decode($result, true);
        }

        rest_response(array(
            'id' => (int)$data['mailId'],
            'source' => $data['from'] !== 'auto' ? $data['from'] : $result['data']['translations'][0]['detectedSourceLanguage'],
            'translatedSubject' => $data['subject'] === '' ? '' : $result['data']['translations'][1]['translatedText'],
            'translatedBody' => $result['data']['translations'][0]['translatedText'],
        ));
    } else if (UOMA_CONFIG['mail_translator_config']['service'] === 'azure') {
        // Handle Azure API
        $query = http_build_query(array(
            'api-version' => '3.0',
            'to' => $data['to'],
            'textType' => 'html',
        ));

        if ($data['from'] !== 'auto') {
            $query .= '&'.http_build_query(array(
                'from' => $data['from'],
            ));
        }

        $options = array(
            'http' => array(
                'method' => 'POST',
                'header' => "Content-type: application/json; charset=UTF-8\r\nOcp-Apim-Subscription-Key: ".UOMA_CONFIG['mail_translator_config']['token']."\r\nOcp-Apim-Subscription-Region: ".UOMA_CONFIG['mail_translator_config']['region']."\r\n",
                'content' => json_encode($data['subject'] !== '' ? array(
                    array(
                        "text" => $data['body']
                    ),
                    array(
                        "text" => $data['subject']
                    )
                ) : array(
                    array(
                        "text" => $data['body']
                    )
                )),
                'timeout' => 30 * 60
            )
        );
        $result = file_get_contents(UOMA_CONFIG['mail_translator_config']['gateway'].'?'.$query, false, stream_context_create($options));

        if ($result === false) {
            rest_die('Unable to translate.', $conn);
        } else {
            $result = json_decode($result, true);
        }

        if ($result['error']) {
            rest_die($result['error']['message'], $conn);
        }

        rest_response(array(
            'id' => (int)$data['mailId'],
            'source' => $data['from'] !== 'auto' ? $data['from'] : $result[0]['detectedLanguage']['language'],
            'translatedSubject' => $data['subject'] === '' ? '' :$result[1]['translations'][0]['text'],
            'translatedBody' => $result[0]['translations'][0]['text'],
        ));
    }
    $conn->close();
} catch (\Exception $e) {
    rest_die($e->getMessage(), $conn);
} catch (\Error $e) {
    rest_die($e->getMessage(), $conn);
}

?>
<?php
/**
 * This file handles logic related to config
 */

if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    http_response_code(404);
    die();
}

require(dirname(__FILE__).'/../config.php');

/**
 * Get HTTP Referer header value or ''
 * 
 * @return string Referer header value
 */
function get_referer(): string {
    return isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';
}

/**
 * Get host (host name + port) for an given URL
 * 
 * @param string $url URL
 * @return mixed Host of the given URL of false on failure
 */
function get_url_host(string $url) {
    $parsed_url = parse_url($url);

    if (!$parsed_url || !isset($parsed_url['host'])) {
        return false;
    }

    if (isset($parsed_url['port'])) {
        return 'https://'.$parsed_url['host'].':'.$parsed_url['host'];
    } else {
        return 'https://'.$parsed_url['host'];
    }
}

/**
 * Get HTTP Access Control Allow Origin header as a string
 * 
 * @return string Access Control Allow Origin value
 */
function get_access_control_allow_origin_header(): string {
    if (is_array(UOMA_CONFIG['access_control_allow_origin'])) {
        $referer = get_referer();

        if ($referer === '') {
            return 'https://'.$_SERVER['SERVER_NAME'];
        }

        $parsed_referer = get_url_host($referer);

        if ($parsed_referer === false) {
            return 'https://'.$_SERVER['SERVER_NAME'];
        }

        foreach (UOMA_CONFIG['access_control_allow_origin'] as $url) {
            $parsed_url = get_url_host($url);

            if ($parsed_url === false) {
                return 'https://'.$_SERVER['SERVER_NAME'];
            }

            if ($parsed_url === $parsed_referer) {
                return $parsed_url;
            }
        }

        return 'https://'.$_SERVER['SERVER_NAME'];
    } else if (is_string(UOMA_CONFIG['access_control_allow_origin'])) {
        if (UOMA_CONFIG['access_control_allow_origin'] !== '*') {
            $parsed_url = get_url_host(UOMA_CONFIG['access_control_allow_origin']);

            if ($parsed_url === false) {
                return 'https://'.$_SERVER['SERVER_NAME'];
            }

            return $parsed_url;
        }
        return '*';
    } else {
        return 'https://'.$_SERVER['SERVER_NAME'];
    }
}

?>
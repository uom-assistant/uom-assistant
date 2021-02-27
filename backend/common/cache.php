<?php
/**
 * This file controls the cahce layer
 */

if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    http_response_code(404);
    die();
}

/**
 * Get cache by key and user from database
 * @param string $key Cahce key
 * @param array $user User info array
 * @param mysqli $conn Database connecter
 * @return mixed Cached data
 */
function get_cache(string $key, array $user, mysqli $conn) {
    // TODO
    return false;
}

/**
 * Get cache by key and user from database
 * @param string $key Cahce key
 * @param array $user User info array
 * @param mixed $data Data to be cached
 * @param string $expire Cache expired time. Can be any string that valid for strtotime()
 * @param mysqli $conn Database connecter
 * @return bool If the data is cached
 */
function set_cache(string $key, array $user, $data, string $expire = "", mysqli $conn): bool {
    // TODO
    return true;
}

?>
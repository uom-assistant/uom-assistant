<?php
/**
 * This file conatains some common functions
 */

if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    http_response_code(404);
    die();
}

require('read_config.php');

// set_exception_handler('exception_handler');

/**
 * Parse POST data from JSON to array
 * 
 * @return array Post data as an array
 */
function get_post_data(): array {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data === null) {
        return array();
    }
    return $data;
}

/**
 * Print error message and end request
 * 
 * @param string $reason The reason of the error
 * @param mysqli $conn Database connecter, if given, the connection will be closed before die
 * @return void
 */
function rest_die(string $reason, $conn = null): void {
    // Close database connection
    if ($conn !== null) {
        $conn->close();
    }

    // Add headers
    header('Access-Control-Allow-Origin: '.get_access_control_allow_origin_header());
    header('Content-type: application/json');

    // Print error
    echo json_encode(array(
        'success' => false,
        'uomabVersion' => UOMA_VERSION,
        'maintenance' => UOMA_MAINTENANCE,
        'reason' => $reason
    ));

    die();
}

/**
 * Print REST response
 * 
 * @param mixed $data Response data
 * @return void
 */
function rest_response($data): void {
    // Add headers
    header('Access-Control-Allow-Origin: '.get_access_control_allow_origin_header());
    header('Content-type: application/json');

    // Return data
    echo json_encode(array(
        'success' => true,
        'uomabVersion' => UOMA_VERSION,
        'maintenance' => UOMA_MAINTENANCE,
        'data' => $data
    ));
}

/**
 * Global handler for exceptions
 * 
 * @param mixed $exception Exception instance
 * @return void
 */
function exception_handler($exception): void {
    rest_die($exception->getMessage());
}

/**
 * Connect to database
 * 
 * @return mysqli Database connection object if connection is established
 */
function connect_to_database(): mysqli {
    $conn = new mysqli(UOMA_DATABASE['host'], UOMA_DATABASE['username'], UOMA_DATABASE['password'], UOMA_DATABASE['database'], UOMA_DATABASE['port']);

    if ($conn->connect_error) {
        rest_die('Database error.');
    }

    $conn->set_charset('utf8mb4');

    return $conn;
}

/**
 * Validate data
 * 
 * @param string $type Data type
 * @param string $data Data to be validated
 * @return bool If the given data is validated
 */
function validate_data(string $type, string $data): bool {
    if ($type === 'username') {
        return preg_match('/^[a-z]\d{5}[a-z]{2}$/', $data) === 1;
    }
    if ($type === 'password') {
        return strlen($data) >= 5;
    }
    if ($type === 'email') {
        return preg_match('/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-z])+\.)*manchester\.ac\.uk$/', $data) === 1;
    }
}

/**
 * Get user info from post data
 * 
 * @param mysql $conn Database connecter, if given, the connection will be closed if there is any error
 * @return array User info
 */
function get_user($conn = null): array {
    $post_data = get_post_data();

    // Check username and password
    if (!isset($post_data['username']) || !isset($post_data['password']) || !validate_data('username', $post_data['username']) || !validate_data('password', $post_data['password'])) {
        rest_die('Invalid request.', $conn);
    }

    $user = array(
        'username' => $post_data['username'],
        'password' => $post_data['password'],
        'email' => false
    );

    // Check email if exists
    if (isset($post_data['email'])) {
        if (!validate_data('email', $post_data['email'])) {
            rest_die('Invalid request.', $conn);
        }
        $user['email'] = $post_data['email'];
    }

    return $user;
}

/**
 * Connect to database
 * 
 * @param mysqli $conn Database connection object if connection is established
 * @return mixed Token ability or false
 */
function check_token($conn) {
    // TODO
    return false;
}

?>
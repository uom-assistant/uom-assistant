<?php
/**
 * This file initialize the database. Can only run in CLI
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(404);
}

include('../common/functions.php');

// TODO

?>
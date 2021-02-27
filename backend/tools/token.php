<?php
/**
 * This file contains some useful functions related to tokens. Can only run in CLI
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(404);
}

include('../common/functions.php');

// TODO

?>
<?php
include('../common/functions.php');
include('../common/general_rate_limit.php');

if (UOMA_CONFIG['allow_unauthenticated']) {
    rest_response(array(
        'tokenRequired' => false,
        'allowAccount' => UOMA_CONFIG['allow_account'],
        'allowEmail' => UOMA_CONFIG['allow_mail_server'],
        'welcomeMessage' => UOMA_CONFIG['welcome_message'],
    ));
} else {
    $conn = connect_to_database();

    $token_ability = check_token($conn);
    if (check_token($conn) !== false) {
        rest_response(array(
            'tokenRequired' => false,
            'allowAccount' => $token_ability['allow_account'],
            'allowEmail' => $token_ability['allow_mail_server'],
            'welcomeMessage' => UOMA_CONFIG['welcome_message'],
        ));
    } else {
        rest_response(array(
            'tokenRequired' => true
        ));
    }

    $conn->close();
}

?>
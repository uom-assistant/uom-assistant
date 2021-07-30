<?php
include('../common/functions.php');
include('../common/cache.php');
include('../common/general_rate_limit.php');

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
}

// Get cached data (if exists)
$data = get_post_data();
if (isset($data['subid'])) {
    $cached_response = get_cache('calendar', $data['subid'], $conn);
} else {
    rest_die('Invalid request.', $conn);
}

if ($cached_response !== false) {
    // Send cached response back
    rest_response($cached_response);

    $conn->close();
} else {
    // Not cached
    $ics = file_get_contents('https://scientia-eu-v2-4-api-d3-02.azurewebsites.net/api/ical/'.$data['subid'].'/timetable.ics');

    rest_response($ics);

    // Set cache
    set_cache('calendar', $data['subid'], $ics, '+12 hours', $conn);

    $conn->close();
}

?>

<?php
require('../vendor/autoload.php');
include('../common/functions.php');
include('../common/cache.php');
include('../common/general_rate_limit.php');

use Goutte\Client;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\RetryableHttpClient;

use RateLimit\Exception\LimitExceeded;
use RateLimit\Rate;
use RateLimit\RedisRateLimiter;

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
} else if (!UOMA_CONFIG['allow_account']) {
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

        $apiKey = 'get-grade-attendance-'.$user['username'];
    
        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 10));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.');
        }
    } else {
        rest_die('Rate limit error.');
    }
}

$cached_response = get_cache('grade', $user['username'], $conn);

if ($cached_response !== false) {
    // Send cached response back
    rest_response($cached_response);

    $conn->close();
} else {
    // Set up HTTP client
    $httpClient = new RetryableHttpClient(HttpClient::create([
        'timeout' => 30,
        'headers' => [
            'User-Agent' => UOMA_USER_AGENT,
        ],
    ]), null, 1);

    $client = new Client($httpClient);

    $client->restart();

    // Login from CAS, regardless of Cookie since there is already a cache layer
    $client->request(
        'GET',
        'https://login.manchester.ac.uk/cas/login?service=https%3A%2F%2Fstudentnet.cs.manchester.ac.uk%2Fme%2Fspot%2F'
    );

    $crawler = $client->submitForm('Login', [
        'username' => $user['username'],
        'password' => $user['password'],
    ]);

    if (strpos($crawler->html(), 'class="courseHeader"') === false) {
        rest_die('Unable to login', $conn);
    }

    // Read grades
    $grade_list = $crawler->filter($crawler->filter('.container')->first()->filter('ul.nav.nav-tabs > li.nav-item.active > a')->attr('href'))->first()->filter('.container > table.cwk')->each(function(\Symfony\Component\DomCrawler\Crawler $node, $i) {
        $subject = explode(' ', $node->filter('td.courseHeader > b')->first()->text());
        $subject_id = $subject[0];
        array_pop($subject);
        array_shift($subject);
        $grade_detail = array_values(array_filter($node->filter('tr')->each(function(\Symfony\Component\DomCrawler\Crawler $tr, $j) {
            if ($j >= 2) {
                if (strpos($tr->text(), 'Weighted summative') === false) {
                    $grade = trim($tr->filter('td')->eq(1)->text());
                    if ($grade !== '' && stripos($grade, ' /') !== false && explode(' /', $grade)[0] !== '#') {
                        $name = $tr->filter('td')->eq(0)->text();
                        $display_name = preg_replace('/^\d{4,6}-/', '', str_replace('-S-', '-', str_replace('-F-', '-', $name)));
                        $grade_time = date_create_from_format('d-M-y H:i', trim($tr->filter('td')->eq(2)->text()));
                        return array(
                            'rawName' => $name,
                            'name' => $display_name,
                            'summative' => strpos($name, '-F-') === false,
                            'grade' => explode(' /', $grade)[0],
                            'gradeAll' => trim(explode('(', explode(' /', $grade)[1])[0]),
                            'time' => date_format(($grade_time === false ? date_create_from_format('d-M-y H:i', trim($tr->filter('td')->eq(3)->text())) : $grade_time), 'Y-m-d H:i:s'),
                            'late' => strpos($grade, 'LATE') !== false,
                        );
                    }
                    return false;
                }
                return false;
            }
            return false;
        })));

        // Aggregate similar courseworks
        $patterns = [];
        foreach ($grade_detail as $index => $grade_item) {
            if (count($patterns) === 0) {
                $patterns[] = array(
                    'pattern' => preg_replace('/\d/', '', $grade_item['rawName']),
                    'index' => [$index]
                );
            } else {
                $found_flag = false;
                $name = preg_replace('/\d/', '', $grade_item['rawName']);
                foreach ($patterns as &$pattern) {
                    if (levenshtein($pattern['pattern'], $name) <= 1) {
                        $pattern['index'][] = $index;
                        $found_flag = true;
                        break;
                    }
                }
                unset($pattern);
                if (!$found_flag) {
                    $patterns[] = array(
                        'pattern' => $name,
                        'index' => [$index]
                    );
                }
            }
        }

        if (count($patterns) > 0) {
            $new_list = [];
            foreach ($patterns as $pattern) {
                if (count($pattern['index']) > 1) {
                    $similar_set = [];
                    foreach ($pattern['index'] as $index) {
                        $similar_set[] = $grade_detail[$index];
                    }
                    $new_list[] = $similar_set;
                } else {
                    $new_list[] = $grade_detail[$pattern['index'][0]];
                }
            }
        } else {
            $new_list = $grade_detail;
        }

        return array(
            'subject' => $subject_id,
            'name' => implode(' ', $subject),
            'weightedGrade' => substr($node->filter('td.totalSoFar > b')->first()->text(), 0, -1),
            'detail' => $new_list
        );
    });

    $crawler = $client->request(
        'GET',
        'https://studentnet.cs.manchester.ac.uk/ugt/attendance/'
    );

    if (strpos($crawler->html(), 'additionalattendancetableid') === false) {
        rest_response(array(
            'grade' => $grade_list,
            'attendance' => false,
        ));
    }

    // Check absent
    $absent_list = array_values(array_filter($crawler->filter('#additionalattendancetableid > tbody > tr')->each(function(\Symfony\Component\DomCrawler\Crawler $node, $i) {
        if ($node->filter('td')->eq(3)->text() !== 'Present') {
            return array(
                'name' => $node->filter('td')->eq(2)->text(),
                'subject' => $node->filter('td')->eq(1)->text(),
                'date' => $node->filter('td')->eq(0)->text()
            );
        }
        return false;
    })));

    // Response
    $response = array(
        'lastMonth' => substr(explode('h: ', $crawler->filter('.mainContentContainer .curved .indentdiv > div')->first()->filter('div > div')->eq(2)->filter('ul')->eq(1)->filter('li')->eq(1)->text())[1], 0, -1),
        'annual' => substr(explode('l: ', $crawler->filter('.mainContentContainer .curved .indentdiv > div')->first()->filter('div > div')->eq(2)->filter('ul')->eq(1)->filter('li')->first()->text())[1], 0, -1),
        'absentRecord' => $absent_list,
    );

    // Response
    rest_response(array(
        'grade' => $grade_list,
        'attendance' => $response,
    ));

    // Set cache
    set_cache('grade', $user['username'], $grade_list, '+3 hours', $conn);

    $conn->close();
}

?>
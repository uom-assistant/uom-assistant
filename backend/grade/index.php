<?php
require('../vendor/autoload.php');
include('../common/functions.php');
include('../common/cache.php');
include('../common/general_rate_limit.php');

use Goutte\Client;
use Symfony\Component\HttpClient\HttpClient;
use Symfony\Component\HttpClient\RetryableHttpClient;
use Symfony\Component\DomCrawler\Crawler;

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

        $apiKey = 'get-grade-'.$user['username'];

        try {
            $rateLimiter->limit($apiKey, Rate::custom(2, 10));
        } catch (LimitExceeded $exception) {
            rest_die('Rate limit exceeded.', $conn);
        }
    } else {
        rest_die('Rate limit error.', $conn);
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
        'https://login.manchester.ac.uk/cas/login?service=https%3A%2F%2Fstudentnet.cs.manchester.ac.uk%2Fme%2Fspotv2%2Fspotv2.php'
    );

    $crawler = $client->submitForm('Login', [
        'username' => $user['username'],
        'password' => $user['password'],
    ]);

    function get_timestamp($date, $base = 0, $format = 'd M H:i') {
        if ($base === 0) {
            $base = intval(date('Y'));
        }
        if (strpos($date, 'Sep') === false && strpos($date, 'Oct') === false && strpos($date, 'Nov') === false && strpos($date, 'Dec') === false) {
            $base++;
        }
        return intval(DateTime::createFromFormat('Y '.$format, strval($base).' '.$date, new DateTimeZone('Europe/London'))->format('U')) * 1000;
    }

    function html_trim($str) {
        return trim($str, "  \t\n\r\0\x0B");
    }

    // Check login
    if (strpos($crawler->html(), '<title>SPOT v2</title>') === false) {
        rest_die('Unable to login', $conn);
    }

    $grade_list_all = array();
    $grade_list_all_crawler = array();

    // Get year list
    $years = $crawler->filterXPath('//button[contains(@id, "AY-")]')->evaluate('substring-after(@id, "-")');
    if (count($years) === 0) {
        $years = array(date('Y'));
    }

    $current_year = intval(substr(html_trim(explode(' • ', $crawler->filter('.container > div')->eq(2)->text())[2]), -1));

    $all_year = array();
    foreach ($years as $year) {
        $all_grades = array(
            array(
                'name' => 'Semester 1',
                'data' => array(),
            ),
            array(
                'name' => 'Semester 2',
                'data' => array(),
            ),
            array(
                'name' => 'All Year',
                'data' => array(),
            ),
        );

        // Get year summary
        $summary_ele = $crawler->filter('#summaryPage'.$year)->first();
        $year_summary_ele = $summary_ele->filter('table > tfoot > tr')->first();
        $year_summary = array(
            'coursework' => html_trim($year_summary_ele->filter('th')->eq(3)->text()),
            'exam' => html_trim($year_summary_ele->filter('th')->eq(4)->text()),
            'overall' => html_trim(explode('%', $year_summary_ele->filter('th')->eq(5)->text())[0]),
        );

        // Get course list
        $all_course = $crawler->filter('#menuDiv'.$year)->first()->filter('button.menuButton.menuCourse')->each(function (\Symfony\Component\DomCrawler\Crawler $node, $i) {
            $course_id = $node->attr('name');
            $grade_list = array(
                'subject' => 'COMP'.$course_id,
                'name' => '',
                'credits' => '',
                'leader' => array(
                    'name' => '',
                    'email' => '',
                ),
                'summary' => false,
                'detail' => array(),
            );
            return $grade_list;
        });

        // Get course summary
        $course_summary_crawler = new Crawler(str_replace(array('<tbody>', '</tbody>'), '', $summary_ele->filter('table')->first()->html()));
        $all_course_summary = $course_summary_crawler->filter('body > tr')->each(function (\Symfony\Component\DomCrawler\Crawler $node, $i) {
            $exam_detail = array();
            if (strpos($node->filter('td')->eq(4)->text(), 'ℹ') !== false) {
                $exam_info = $node->filter('td')->eq(4)->filter('span[data-content]')->attr('data-content');
                foreach (explode('<br><br><b>', $exam_info) as $exam) {
                    $exam_info_parts = explode('<br>', str_replace(array('<b>', '</b>'), '', $exam));
                    $raw_name = html_trim($exam_info_parts[0]);
                    $raw_grade = html_trim(explode(': ', $exam_info_parts[2])[1]);

                    $exam_detail[] = array(
                        'rawName' => $raw_name,
                        'name' => preg_replace('/^(COMP)?\d{4,6}(-| )/', '', html_trim(str_replace(array('-S-', '-F-'), '-', $raw_name))),
                        'summative' => true,
                        'grade' => html_trim(explode('/', $raw_grade)[0]),
                        'gradeAll' => html_trim(explode(' (', explode('/', $raw_grade)[1])[0]),
                        'time' => -1,
                        'rawTime' => '',
                        'status' => 'exam',
                        'weight' => html_trim(substr(explode(': ', $exam_info_parts[1])[1], 0, -1)),
                        'tag' => false,
                    );
                }
            }

            return array(
                'id' => html_trim($node->filter('td')->eq(0)->text()),
                'weight' => html_trim($node->filter('td')->eq(2)->text()),
                'coursework' => html_trim($node->filter('td')->eq(3)->text()),
                'exam' => html_trim(str_replace('ℹ', '', $node->filter('td')->eq(4)->text())),
                'overall' => html_trim($node->filter('td')->eq(5)->text()),
                'examDetail' => $exam_detail,
            );
        });

        foreach ($all_course as $course) {
            $grade_detail = array();

            // Get all grades
            foreach (array('SUM', 'FOR') as $part) {
                $table = $crawler->filter('#'.$part.'-'.$course['subject'])->first()->filter('table')->first();
                $head = $table->filter('thead > tr')->first()->filter('th')->first();

                $course['name'] = html_trim($head->filter('a[target]')->first()->text());
                $course['credits'] = html_trim(explode(' | Duration', explode('Credits: ', $head->text())[1])[0]);
                $course['leader']['name'] = html_trim($head->filter('a')->eq(1)->text());
                $course['leader']['email'] = explode('to:', $head->filter('a')->eq(1)->attr('href'))[1];

                $table_crawler = new Crawler(str_replace(array('<tbody>', '</tbody>'), '', $table->html()));
                $result = array_filter($table_crawler->filter('body > tr')->each(function (\Symfony\Component\DomCrawler\Crawler $node, $i) use ($year) {
                    $count = $node->filter('td')->count();
                    if ($count >= 3) {
                        $raw_name = html_trim($node->filter('td')->eq(0)->text());
                        $raw_time = html_trim($node->filter('td')->eq($count === 3 ? 1 : 2)->text());
                        $raw_grade = html_trim($node->filter('td')->eq($count === 3 ? 2 : 3)->text());
                        $grade = html_trim(explode('/', $raw_grade)[0]);

                        $status = 'past';
                        if (strpos($raw_time, '🟢') !== false) {
                            $status = 'upcoming';
                        } elseif (strpos($raw_time, '🔴') !== false || strpos($raw_time, '🟠') !== false) {
                            $status = 'late';
                        } elseif (strpos($raw_time, '🕖') !== false) {
                            $status = 'penalty';
                        }

                        $original_grade = $grade;

                        $time = -1;
                        $ddl_time = -1;
                        $late = 0;
                        $penalty = false;
                        if ($status === 'past' && strpos($raw_time, 'No Submission Date') === false && strpos($raw_time, 'Deadline Unknown') === false) {
                            $time = get_timestamp($raw_time, intval($year));
                            $ddl_time = $time;
                        } elseif ($status === 'upcoming') {
                            $time = get_timestamp(explode(' due ', $raw_time)[1], intval($year));
                            $ddl_time = $time;
                        } elseif ($status === 'late') {
                            if ($node->filter('td')->eq($count === 3 ? 1 : 2)->filter('span[data-content]')) {
                                $time = get_timestamp(html_trim(explode('.', preg_split('/(closed on the )|(the deadline was the )/', html_trim($node->filter('td')->eq($count === 3 ? 1 : 2)->filter('span[data-content]')->first()->attr('data-content')))[1])[0]), intval($year));
                            }
                        } elseif ($status === 'penalty') {
                            $time = get_timestamp(html_trim(str_replace('🕖', '', $raw_time)), intval($year));
                            if ($node->filter('td')->eq($count === 3 ? 1 : 2)->filter('span[data-content]')) {
                                $text = explode('<br>', html_trim($node->filter('td')->eq($count === 3 ? 1 : 2)->filter('span[data-content]')->first()->attr('data-content')));
                                if (strpos($text[0], 'Original') !== false) {
                                    $original_grade = html_trim(explode(': ', $text[0])[1]);
                                }
                                if (count($text) > 1 && strpos($text[1], 'Deadline') !== false) {
                                    $ddl_time = get_timestamp(html_trim(explode(': ', $text[1])[1]), intval($year), 'M d H:i');
                                }
                                if (count($text) > 2 && strpos($text[2], 'Late by') !== false) {
                                    $late = intval(html_trim(explode(' ', $text[2])[2]));
                                }
                                if (count($text) > 3 && strpos($text[3], 'Penalty for') !== false) {
                                    $penalty = html_trim(explode(': ', $text[3])[1]);
                                }
                            }
                        }

                        $tag = false;
                        if (strpos($raw_name, '&nbsp Tag') !== false) {
                            if ($node->filter('td')->first()->filter('span[data-content]')) {
                                $tag = explode('</b>', explode('Tag: <b>', $node->filter('td')->first()->filter('span[data-content]')->first()->attr('data-content'))[1])[0];
                            }
                        }

                        return array(
                            'rawName' => $raw_name,
                            'name' => preg_replace('/^\d{4,6}-/', '', html_trim(str_replace(array('Tag', '&nbsp;', '&nbsp'), '', str_replace(array('-S-', '-F-'), '-', $raw_name)))),
                            'summative' => strpos($raw_name, '-F-') === false,
                            'grade' => $grade,
                            'originalGrade' => $original_grade,
                            'gradeAll' => html_trim(explode(' (', explode('/', $raw_grade)[1])[0]),
                            'time' => $time,
                            'ddlTime' => $ddl_time,
                            'rawTime' => html_trim(str_replace(array('🔴', '🟠', '🟢', '🕖'), '', $raw_time)),
                            'status' => $status,
                            'weight' => $count === 3 ? false : html_trim($node->filter('td')->eq(1)->text()),
                            'tag' => $tag,
                            'late' => $late,
                            'penalty' => $penalty,
                        );
                    }
                }), function ($val) {
                    return $val !== null;
                });

                // Correct upcoming courseworks
                foreach ($result as &$item) {
                    if ((strpos($item['rawTime'], 'No Submission Date') !== false || strpos($item['rawTime'], 'Deadline Unknown') !== false) && intval(substr($course['subject'], 4, 1)) >= $current_year) {
                        if ($item['grade'] === '0') {
                            $item['status'] = 'upcoming';
                        }
                    }
                }

                $grade_detail = array_merge($grade_detail, $result);
            }

            // Get course summary
            foreach ($all_course_summary as $course_summary) {
                if ($course_summary['id'] === $course['subject']) {
                    $course['summary'] = array(
                        'weight' => $course_summary['weight'],
                        'coursework' => $course_summary['coursework'],
                        'exam' => $course_summary['exam'],
                        'overall' => $course_summary['overall']
                    );
                    $grade_detail = array_merge($grade_detail, $course_summary['examDetail']);
                    break;
                }
            }

            // Merge similar courseworks
            $patterns = [];
            foreach ($grade_detail as $index => $grade_item) {
                if (count($patterns) === 0) {
                    $patterns[] = array(
                        'pattern' => preg_replace('/\d/', '', $grade_item['rawName']),
                        'summative' => $grade_item['summative'],
                        'index' => [$index]
                    );
                } else {
                    $found_flag = false;
                    $name = preg_replace('/\d/', '', $grade_item['rawName']);
                    foreach ($patterns as &$pattern) {
                        if (levenshtein($pattern['pattern'], $name) <= 1 && $pattern['summative'] === $grade_item['summative'] && ($grade_item['status'] === 'past' || $grade_item['status'] === 'late' || $grade_item['status'] === 'penalty')) {
                            $pattern['index'][] = $index;
                            $found_flag = true;
                            break;
                        }
                    }
                    unset($pattern);
                    if (!$found_flag) {
                        $patterns[] = array(
                            'pattern' => $name,
                            'summative' => $grade_item['summative'],
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

            $course['detail'] = $new_list;

            if (substr($course['subject'], -1) === '0') {
                $all_grades[2]['data'][] = $course;
            } elseif (substr($course['subject'], -1) === '1') {
                $all_grades[0]['data'][] = $course;
            } elseif (substr($course['subject'], -1) === '2') {
                $all_grades[1]['data'][] = $course;
            }
        }

        $all_year[] = array(
            'year' => $year,
            'summary' => $year_summary,
            'grade' => $all_grades,
        );
    }

    // Response
    rest_response(array(
        'blackboardUpdated' => get_timestamp(substr(html_trim(explode(': ', $crawler->filter('.container > div')->eq(2)->filter('span[data-content]')->text())[1]), 0, -5)),
        'data' => $all_year,
    ));

    // Set cache
    set_cache('grade', $user['username'], $grade_list_all, '+3 hours', $conn);

    $conn->close();
}

?>
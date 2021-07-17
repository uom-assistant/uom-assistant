<?php
/**
 * UoM Assistant Backend Project 0.1.0
 * By Axton and other contributors
 * Open sourced under GPL v3.0 license
 * 
 * Copyright 2021 Axton
 * This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with this program; if not, write to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */

/**
 * This is the main config file for UoM Assistant Backend
 * You can modify configurations here
 * Documentation: https://github.com/uom-assistant/uom-assistant/blob/master/backend/README.md
 */

// Backend version
define('UOMA_VERSION', '0.1.0');

// If ture, the frontend wants to connect to this backend instance will receive a messages says the backend is offline temporarily
define('UOMA_MAINTENANCE', false);

// **Requires Redis and PHP Redis extension.** If ture, the built-in rate limiter will be activated. Not recommended since this needs PHP. A server-level rate limiter like Ngnix is better
define('UOMA_RATE_LIMIT', false);

// Redis connection config (when built-in rate limiter enabled)
define('UOMA_REDIS', array(
    'host' => 'localhost',
    'port' => 6379,
));

// Set the user agent used in external HTTP requests. More at https://developer.mozilla.org/docs/Web/HTTP/Headers/User-Agent
define('UOMA_USER_AGENT', 'UOM-ASSISTANT-BACKEND/'.UOMA_VERSION.' Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.0 Safari/537.36');

// Info needed for MySQL database connection
define('UOMA_DATABASE', array(
    'host' => 'localhost',
    'port' => 3306,
    'database' => '',
    'username' => '',
    'password' => '',
));

// Other configurations
define('UOMA_CONFIG', array(
    // If true, users can access to widgets like grade overview, attendance and mail which need an UoM account
    'allow_account' => false,

    // If true, users can sync settings and data between devices through this backend instance using their UoM accounts (which means this backend instance will store UoM account informations except UoM passwords)
    'allow_sync' => false,

    // Allow all users to connect to this backend instance even they don't hava a valid token
    'allow_unauthenticated' => false,

    // If true, users can access to mail widget in the frontend, which they can fetch and send mails using their UoM maill addresses
    'allow_mail_server' => false,

    // If non-empty, a message will be shown in the frontend when a user is connected to this backend instance
    'welcome_message' => '',

    // Controls which frontend can connect to this backend. Can be a string or an array (auto match). More at https://developer.mozilla.org/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
    'access_control_allow_origin' => '*',

    // If true, the mail widget will show a translator and user can translate a mail to their preferred language
    'allow_mail_translator' => false,

    'mail_translator_config' => array(
        // The translation service will using, supports 'deepl', 'azure' or 'google'
        'service' => 'google',

        // Translation API gateway. More at https://github.com/uom-assistant/uom-assistant/blob/master/backend/README.md
        'gateway' => '',

        // Translation API region. Only works on Azure API. More at https://docs.microsoft.com/azure/cognitive-services/translator/reference/v3-0-reference#authenticating-with-a-multi-service-resource. For other translation services, just leave it blank
        'region' => '',

        // Your translation API token
        'token' => ''
    )
));

?>
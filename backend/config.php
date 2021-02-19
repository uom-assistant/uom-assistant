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
 * Documentation: https://github.com/yrccondor/uom-assistant/backend/README.md
 */

// Backend version
define('UOMA_VERSION', '0.1.0');

// If ture, the frontend wants to connect to this backend instance will receive a messages says the backend is offline temporarily
define('UOMA_MAINTENANCE', false);

// Info needed for MySQL database connection
define('UOMA_DATABASE', array(
    'host' => 'localhost',
    'port' => '3306',
    'database' => '',
    'username' => '',
    'password' => '',
));

// Other configurations
define('UOMA_CONFIG', array(
    'allow_account' => false, // If true, users can access to widgets like grade overview, attendance and mail which need an UoM account
    'allow_sync' => false, // If true, users can sync settings and data between devices through this backend instance using their UoM accounts (which means this backend instance will store UoM account informations)
    'allow_unauthenticated' => false, // Allow all users to connect to this backend instance even they don't hava a valid token
    'allow_mail_server' => false, // If true, users can access to mail widget in the frontend, which they can fetch and send mails using their UoM maill addresses
    'welcome_message' => '', // If non-empty, a message will shown in the frontend when a user connect to this backend instance
    'access_control_allow_origin' => '*' // Controls which frontend can connect to this backend. Can be a string or an array (auto match). More at https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin
));
?>
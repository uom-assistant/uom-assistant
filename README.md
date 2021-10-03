# UoM Assistant

An all-in-one productivity tool to help coordinate uni work. Designed for you.

![Main Screen](github_assets/uoma.jpg)

Languages: English | [Chinese (Simplified)](https://github.com/uom-assistant/uom-assistant/tree/master/READMEs/zh_CN.md)

## Development

**This project is still under development.** Please don't use it as a final product.

### Progress

Frontend:

- [x] Clock widget
- [x] TO-DO widget
- [x] Coursework widget
- [x] Course manage widget
- [x] Calendar widget
- [x] Quick links widget
- [x] Online session links widget
- [x] Quick notes widget
- [x] Attendance widget
- [x] Overview widget
- [x] Inbox widget
- [x] Grade summary widget
- [ ] Plug-in widget
- [ ] Search
- [ ] Set up guide
- [ ] Settings page
- [x] About page
- [x] Logo

Backend:

- [ ] Database
- [x] Ability check API
- [x] Attendance API
- [x] Calendar API
- [x] Inbox API
- [x] Send mail API
- [x] Grade summary API
- [ ] Sync settings API
- [ ] Clear data API
- [ ] CLI tools

## Introduction

UoM Assistant is a web app that offers many helpful tools for students in Department of Computer Science, University of Manchester. All the information you need for your study life is now in one place and reachable with a glance.

This project was originally a personal project, born during the pandemic with all the courses were moved to be online, and I needed a panel that could gather and display all the information I needed for study. As the project gradually improved, I started to develop it as a formal project and named it as UoM Assistant.

## Features

- Get known of your course schedule with a glance
- Open online sessions by one click
- Easily check your attendance and grades
- Forget how to calculate the time difference, let the widget tell you
- Precise time zone and DST support
- Check your inbox in the same page and keep away from phishing and spam emails
- A bunch of useful extras to help you organise your study life
- Control all your private data and safely sync them across devices
- Third-party plug-in support
- Elegant and easy-to-use UI with dark mode support
- i18n ready: English (UK), Chinese (Simplified), Spanish and Japanese are currently supported. [Locale status & maintainers](https://github.com/uom-assistant/uom-assistant/tree/master/src/locales/maintainers.md)
- ...

## Deploy guide

### Frontend

Download latest `frontend.zip` from [Releases](https://github.com/uom-assistant/uom-assistant/releases), and decompress the files to the root directory of your site. Note that UoM Assistant must be deployed to the root directory of a site.

To make router working properly, you need to update the config of your server. If you are using Nginx, you can add these lines to your site config:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

or you may using Apache (`.htaccess` is already provided):

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

#### Deploy frontend with JAMstack platforms

<p>
<a href="https://app.netlify.com/start/deploy?repository=https://github.com/uom-assistant/uom-assistant" title="Deploy to Netlify"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"/></a>&nbsp;&nbsp;<a href="https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fuom-assistant%2Fuom-assistant&project-name=uom-assistant&repository-name=uom-assistant" title="Deploy with Vercel"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>&nbsp;&nbsp;<a href="https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2Fuom-assistant%2Fuom-assistant&branch=master&appName=uom-assistant" title="Deploy to Tencent CloudBase"><img src="https://main.qcloudimg.com/raw/95b6b680ef97026ae10809dbd6516117.svg" alt="Deploy to Tencent CloudBase"/></a>
</p>

or [Deploy with Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages/new)

### Backend

Download latest `backend.zip` from [Releases](https://github.com/uom-assistant/uom-assistant/releases), and decompress the files to the right place of your site. Edit `config.php`, and your backend is now on. Note that to enable mail related features you need to install following PHP extentions: `fileinfo`, `imap` and `mbstring`.

#### Deploy backend with serverless platforms

<p>
<a href="https://heroku.com/deploy" title="Deploy to Heroku"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku"></a>&nbsp;&nbsp;<a href="https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2Fuom-assistant%2Fuom-assistant&workDir=backend&branch=master&appName=uom-assistant" title="Deploy to Tencent CloudBase"><img src="https://main.qcloudimg.com/raw/95b6b680ef97026ae10809dbd6516117.svg" alt="Deploy to Tencent CloudBase"/></a>
</p>

[More about backend usage](https://github.com/uom-assistant/uom-assistant/blob/master/backend/README.md)

### Deploy with Docker

If you are using docker, `docker-compose.yml` has already offered you a good start. Check out the file and modify it as you want.

## Build and deploy from source

Make sure you have `npm` and `composer` installed.

### Frontend

```shell
$ git submodule update --init --recursive
$ npm install
$ npm run build
```

...and deploy the `dist` folder.

### Backend

```shell
$ cd backend
```

...edit `config.php`, then

```shell
$ composer install --no-dev --optimize-autoloader
$ cd ../
```

...and deploy the `backend` folder.

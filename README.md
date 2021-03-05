# UoM Assistant

An all-in-one productivity tool to help coordinate uni work. Designed for you.

![Main Screen](github_assets/main.jpg)

## Development

**This project is still under development.** Please don't use it as a final product.

### Progress

Frontend:

- [x] Clock widget
- [x] TO-DO widget
- [x] Coursework widget
- [x] Subject manage widget
- [x] Calendar widget
- [x] Quick links widget
- [x] Online session links widget
- [x] Quick notes widget
- [x] Attendance widget
- [ ] Overview widget
- [ ] Inbox widget
- [x] Grade summary widget
- [ ] Search
- [ ] Set up guide
- [ ] Settings page
- [ ] About page
- [ ] Logo

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

This project was originally a personal project, born during the pandemic with all the courses were moved to be online, and I needed a panel that could gather and display all the information I needed for study. As the project gradually improved, I started to develop it as a formal project. Therefore UoM Assistant also contains many useful features for remote study.

## Features

- Get known of your course schedule with a glance
- Open online sessions by one click
- Easily check your attendance and grades
- Forget how to calculate the time difference, let the widget tell you
- Precise time zone and DST support
- Control all your private data and safely sync them across devices
- Elegant and easy-to-use UI with dark mode support
- i18n support: English (UK) and Chinese (Simplified)
- ...

## Deploy guide

### Frontend

Download latest `frontend.zip` from [Releases](https://github.com/yrccondor/uom-assistant/releases), and decompress the files to the root directory of your site. Note that UoM Assistant must be deployed to the root directory of a site.

### Backend

Download latest `backend.zip` from [Releases](https://github.com/yrccondor/uom-assistant/releases), and decompress the files to the right place of your site. Edit `config.php`, and your backend is on. Note that to enable mail related features you need to install following PHP extentions: `fileinfo`, `imap` and `mbstring`.

## Build and deploy from source

### Frontend

```
$ npm install
$ npm run build
```

...and deploy the `dist` folder.

### Backend

```
$ cd backend
```

...edit `config.php`, then

```
$ composer install --no-dev --optimize-autoloader
$ cd ../
```

...and deploy the `backend` folder.

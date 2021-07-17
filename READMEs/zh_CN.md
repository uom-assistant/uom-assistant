# 曼大助手

助你安排大学内学习生活的一体化的生产力工具，为你而设计。

![Main Screen](../github_assets/uoma.jpg)

Languages: [English](https://github.com/uom-assistant/uom-assistant) | Chinese (Simplified)


## 介绍

曼大助手是为曼彻斯特大学计算机科学系的学生设计的实用 Web 应用。你学习生活中所需要的所有信息现在都在一个地方，只要看一眼就能获取。

这个项目最初是一个诞生于疫情期间的个人项目。由于课程教授方式被转为线上，我开始开发一个可以收集并集中显示所有学习所需信息的 Web 面板。随着项目的逐步完善，我开始将其视为一个正式的项目，并最终将其命名为曼大助手。

## 特点

- 直观地获取你的课程安排
- 一键加入线上课堂
- 轻松查阅你的成绩和出勤状况
- 无需反复转换时区，让曼大助手为你代劳
- 精确的时区与夏令时支持
- 快速检查邮箱，避免钓鱼与垃圾邮件的骚扰
- 大量实用附加功能助你安排学习生活
- 掌控你所有的私密数据并将它们安全地跨设备同步
- 支持第三方插件
- 优雅美观的用户界面，同时带有暗色模式
- 国际化支持: 目前已支持英语（英国）和中文（简体）
- ...

## 部署指南

### 前端

从 [Releases](https://github.com/uom-assistant/uom-assistant/releases) 下载最新的 `frontend.zip`，并将所有文件解压到你站点的根目录。请注意曼大助手必须被部署于站点根目录。

要使页面路由正确工作，你可能需要修改服务器的配置文件。如果你正在使用 Nginx，你可以将以下内容添加进站点配置：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

如果你使用的是 Apache，则可以将以下内容添加进站点配置（`.htaccess` 已提供，因此你可能不需要手动修改配置）:

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

#### 通过 JAMstack 平台部署前端

<p>
<a href="https://app.netlify.com/start/deploy?repository=https://github.com/uom-assistant/uom-assistant" title="Deploy to Netlify"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"/></a>&nbsp;&nbsp;<a href="https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2Fuom-assistant%2Fuom-assistant&project-name=uom-assistant&repository-name=uom-assistant" title="Deploy with Vercel"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>&nbsp;&nbsp;<a href="https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2Fuom-assistant%2Fuom-assistant&branch=master&appName=uom-assistant" title="Deploy to Tencent CloudBase"><img src="https://main.qcloudimg.com/raw/67f5a389f1ac6f3b4d04c7256438e44f.svg" alt="Deploy to Tencent CloudBase"/></a>
</p>

或[使用 Cloudflare Pages 部署](https://dash.cloudflare.com/?to=/:account/pages/new)

### 后端

从 [Releases](https://github.com/uom-assistant/uom-assistant/releases) 下载最新的 `backend.zip`，并将所有文件解压到你站点的合适位置，按你的需求编辑 `config.php` 即可。请注意邮件相关功能需要以下 PHP 扩展：`fileinfo`、`imap` 和 `mbstring`。

#### 通过 Serverless 平台部署后端

<p>
<a href="https://heroku.com/deploy" title="Deploy to Heroku"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Deploy to Heroku"></a>&nbsp;&nbsp;<a href="https://console.cloud.tencent.com/tcb/env/index?action=CreateAndDeployCloudBaseProject&appUrl=https%3A%2F%2Fgithub.com%2Fuom-assistant%2Fuom-assistant&workDir=backend&branch=master&appName=uom-assistant" title="Deploy to Tencent CloudBase"><img src="https://main.qcloudimg.com/raw/67f5a389f1ac6f3b4d04c7256438e44f.svg" alt="Deploy to Tencent CloudBase"/></a>
</p>

[有关后端使用的更多信息](https://github.com/uom-assistant/uom-assistant/blob/master/backend/README.md)

### 使用 Docker 部署

如果你希望使用 Docker，那么 `docker-compose.yml` 已经为你提供了一个不错的开始。请查看该文件并按你的想法修改它。

## 从源码构建并部署

请确保你安装了 `npm` 与 `composer`。

### 前端

```shell
$ git submodule update --init --recursive
$ npm install
$ npm run build
```

...然后部署 `dist` 目录。

### 后端

```shell
$ cd backend
```

...编辑 `config.php`，并执行

```shell
$ composer install --no-dev --optimize-autoloader
$ cd ../
```

...然后部署 `backend` 目录。

<template>
    <div class="about" :class="{ 'small-screen': $vuetify.breakpoint.smAndDown }">
        <div class="about-head" :class="{ 'small-screen': $vuetify.breakpoint.xsOnly }">
            <img :src="$vuetify.theme.dark ? '/img/logo-dark.svg' : '/img/logo.svg'" class="about-logo">
            <div class="about-content">
                <h1>UoM Assistant</h1>
                <h2 v-if="$t('title') !== 'UoM Assistant'" class="text--secondary">{{ $t('title') }}</h2>
                <div class="mt-3">
                    <p>{{ $t('about_1') }}</p>
                    <p>{{ $t('about_2') }}</p>
                    <p>{{ $t('about_3') }}</p>
                    <div class="mt-4">
                        <v-btn
                            x-large
                            depressed
                            color="primary"
                            class="mr-2 mt-2"
                            href="https://github.com/uom-assistant/uom-assistant"
                            target="_blank"
                            rel="noopener nofollow"
                        >
                            <v-icon class="mr-3">mdi-open-in-new</v-icon> {{ $t('learn_more') }}
                        </v-btn>
                        <v-btn
                            x-large
                            depressed
                            :color="!$vuetify.theme.dark ? '#24292E' : '#3A3A3A'"
                            dark
                            class="mt-2"
                            href="https://github.com/uom-assistant/uom-assistant"
                            target="_blank"
                            rel="noopener nofollow"
                        >
                            <v-icon class="mr-3">mdi-github</v-icon> GitHub
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>

        <v-divider></v-divider>

        <div class="author">
            <h1 class="mb-3">{{ $t('author') }}</h1>
            <v-container class="ma-0 pa-0 author-container">
                <v-row class="author-row">
                    <v-col sm="6" md="4">
                        <a href="https://github.com/yrccondor" target="_blank" rel="noopener nofollow">
                            <v-card
                                outlined
                                class="rounded-lg overflow-hidden"
                            >
                                <div class="d-flex flex-no-wrap justify-start">
                                    <v-avatar
                                        size="100"
                                        tile
                                    >
                                        <v-img src="https://avatars.githubusercontent.com/u/14820835?v=4"></v-img>
                                    </v-avatar>
                                    <div>
                                        <v-card-title class="text-h5 text-truncate">yrccondor</v-card-title>
                                        <v-card-subtitle class="text--secondary text-truncate">AxtonYao</v-card-subtitle>
                                    </div>
                                </div>
                            </v-card>
                        </a>
                    </v-col>
                </v-row>
            </v-container>
        </div>

        <div class="author">
            <h1 class="mb-3">{{ $t('contributors') }}</h1>
            <span class="text--disabled" v-if="!Array.isArray(contributors)">{{ $t('loading') }}</span>
            <v-container class="ma-0 pa-0 author-container" v-else>
                <v-row class="author-row">
                    <v-col sm="6" md="4" v-for="member in contributors" :key="member.id">
                        <a :href="member.html_url" target="_blank" rel="noopener nofollow">
                            <v-card
                                outlined
                                class="rounded-lg overflow-hidden"
                            >
                                <div class="d-flex flex-no-wrap justify-start">
                                    <v-avatar
                                        size="100"
                                        tile
                                    >
                                        <v-img :src="member.avatar_url"></v-img>
                                    </v-avatar>
                                    <div>
                                        <v-card-title class="text-h5 text-truncate">{{ member.login }}</v-card-title>
                                        <v-card-subtitle class="text--secondary text-truncate">{{ $tc('contribute', member.contributions, [member.contributions]) }}</v-card-subtitle>
                                    </div>
                                </div>
                            </v-card>
                        </a>
                    </v-col>
                </v-row>
            </v-container>
        </div>

        <div class="version">
            <h1 class="mb-3">{{ $t('version') }}</h1>
            <div class="versions">
                <span class="text--disabled mr-2">{{ $t('frontend') }}</span>{{ frontendVersion }}<span v-if="frontendVersion !== false && latestFrontendVersion !== '' && frontendVersion === latestFrontendVersion" class="version-tip">{{ $t('latest') }}</span><span v-if="frontendVersion !== false && latestFrontendVersion !== '' && frontendVersion !== latestFrontendVersion" class="version-tip">{{ $t('latest_version', [latestFrontendVersion]) }}</span><br>
                <span class="text--disabled mr-2">{{ $t('backend') }}</span>{{ backendVersion === 'null' ? $t('null') : (backendVersion === 'unknown' ? $t('unknown') : (backendVersion === false ? $t('loading') : backendVersion)) }}<span v-if="backendVersion !== false && latestBackendVersion !== '' && backendVersion === latestBackendVersion" class="version-tip">{{ $t('latest') }}</span><span v-if="backendVersion !== false && backendVersion !== 'null' && backendVersion !== 'unknown' && latestBackendVersion !== '' && backendVersion !== latestBackendVersion" class="version-tip">{{ $t('latest_version', [latestBackendVersion]) }}</span>
                <div class="text--disabled mt-2">Copyright © UoM Assistant Contributors</div>
            </div>
        </div>

        <div class="about-footer d-flex align-center">
            <v-divider class="mr-5"></v-divider>
            Made with ❤ by&nbsp;<a href="https://axton.im">Axton Yao</a>
            <v-divider class="ml-5"></v-divider>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import betterFetch from '@/tools/betterFetch';

import * as version from '../../public/version.json';

export default {
    name: 'About',
    data() {
        return {
            contributors: false,
            frontendVersion: version.version,
            latestFrontendVersion: false,
            backendVersion: false,
            latestBackendVersion: false,
        };
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
    },
    methods: {
        /**
         * Load contributors from GitHub
         */
        async loadContributors() {
            this.contributors = (await betterFetch('https://api.github.com/repositories/340121100/contributors?per_page=100').catch(() => [])).filter((item) => item.type !== 'Bot').sort((a, b) => ((a.contributions > b.contributions) ? -1 : 1));
        },
        /**
         * Load latest frontend version online
         */
        async loadLatestFrontendVersion() {
            this.latestFrontendVersion = (await betterFetch('https://cdn.jsdelivr.net/gh/uom-assistant/uom-assistant/public/version.json').catch(() => ({ version: '' }))).version || '';
        },
        /**
         * Load current backend version from backend
         */
        async loadbackendVersion() {
            if (!this.backend.url) {
                this.backendVersion = 'null';
                return;
            }
            this.backendVersion = (await betterFetch(`https://${this.backend.url}/check_ability/`).catch(() => ({ uomabVersion: 'unknown' }))).uomabVersion || 'unknown';
        },
        /**
         * Load latest backend version online
         */
        async loadLatestBackendVersion() {
            this.latestBackendVersion = (await betterFetch('https://cdn.jsdelivr.net/gh/uom-assistant/uom-assistant/backend/composer.json').catch(() => ({ version: '' }))).version || '';
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            backend: (state) => state.backend,
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        this.loadContributors();
        this.loadLatestFrontendVersion();
        this.loadLatestBackendVersion();
        this.$nextTick(() => {
            this.loadbackendVersion();
        });
    },
};
</script>

<style lang="less" scoped>
.about {
    min-height: calc(100vh - 64px);
    padding: 20px;
    padding-top: 100px;
    padding-bottom: 30px;
    margin: 0 auto;
    max-width: 1200px;
    &.small-screen {
        min-height: calc(100vh - 56px);
        padding-top: 50px;
    }
    .about-head {
        display: flex;
        margin-bottom: 70px;
        .about-logo {
            width: 120px;
            height: 120px;
            margin-right: 40px;
            margin-bottom: 30px;
        }
        .about-content {
            display: flex;
            width: calc(100% - 160px);
            flex-direction: column;
            h1 {
                font-size: 45px;
                line-height: 45px;
            }
            h2 {
                font-weight: normal;
                font-size: 25px;
            }
            p {
                font-size: 18px;
                margin: 8px 0;
            }
            button {
                border-radius: 6px;
            }
        }
        &.small-screen {
            flex-wrap: wrap;
            .about-content {
                width: 100%;
            }
        }
    }
    hr {
        border-width: 2px 0 0 0;
    }
    .author, .version {
        margin-top: 60px;
        h1 {
            font-size: 30px;
        }
        a {
            text-decoration: none;
        }
        .author-container {
            max-width: 100%;
        }
        .author-row {
            width: calc(100% + 24px);
        }
    }
    .version {
        margin-bottom: 60px;
        .versions {
            margin-top: -2px;
            font-size: 20px;
        }
        .version-tip {
            display: inline-block;
            font-size: 14px;
            padding: 2px 6px;
            background-color: rgba(119, 119, 119, 0.5);
            color: white;
            margin-left: 8px;
            border-radius: 3px;
            vertical-align: text-top;
        }
    }
    .about-footer {
        text-align: center;
        font-size: 18px;
        a {
            text-decoration: none;
        }
    }
}
</style>

<i18n>
{
    "en": {
        "title": "UoM Assistant",
        "learn_more": "Learn More",
        "about_1": "The UoM Assistant is a web application that can help you throughout your student life at the University of Manchester. All the information you will need is at your fingertips.",
        "about_2": "The UoM Assistant is open-source; therefore, you can freely use UoM Assistant, make suggestions to us, try self-hosting and even modify it as you wish or help us develop it.",
        "about_3": "The UoM Assistant project was initiated by Axton Yao and developed by Axton Yao and other contributors. You can check out our project on GitHub or visit our website to find out more.",
        "author": "Author",
        "contributors": "Contributors",
        "contribute": "{0} contribution | {0} contributions",
        "loading": "Loading…",
        "version": "Version",
        "frontend": "Frontend",
        "backend": "Backend",
        "latest": "Up-to-date",
        "null": "N/A",
        "unknown": "Unknown",
        "latest_version": "Latest {0}"
    },
    "zh": {
        "title": "曼大助手",
        "learn_more": "了解更多",
        "about_1": "曼大助手是一个能在你于曼彻斯特大学的学习生活中助你一臂之力的 Web 应用程序。你所需要的一切信息，皆在视线所及的范围之内。",
        "about_2": "曼大助手是开源的，因此你可以自由使用曼大助手、向我们提出建议、尝试自托管曼大助手，甚至按你的心意随意修改曼大助手或是帮助我们开发曼大助手。",
        "about_3": "曼大助手项目由 Axton Yao 发起并由 Axton Yao 与其他贡献者共同开发。你可以查看我们的 GitHub 项目或是访问我们的网站来了解更多。",
        "author": "作者",
        "contributors": "贡献者",
        "contribute": "{0} 次贡献 | {0} 次贡献",
        "loading": "加载中…",
        "version": "版本",
        "frontend": "前端",
        "backend": "后端",
        "latest": "已是最新",
        "null": "无",
        "unknown": "未知",
        "latest_version": "最新 {0}"
    },
    "es": {
        "title": "UoM Assistant",
        "learn_more": "Saber más",
        "about_1": "UoM Assistant es una aplicación web que te echará una mano en tu vida universitaria en la Universidad de Manchester. Todo lo que necesites, a su alcance.",
        "about_2": "UoM Assistant es de código abierto; por lo tanto, puedes usar UoM Assistant libremente, hacernos sugerencias, probar el autohospedaje e incluso modificarlo como desees o ayudarnos a desarrollarlo.",
        "about_3": "El proyecto UoM Assistant fue iniciado por Axton Yao y desarrollado por Axton Yao y otros colaboradores. Puede consultar nuestro proyecto en GitHub o visitar nuestro sitio web para obtener más información.",
        "author": "Autor",
        "contributors": "Colaboradores",
        "contribute": "{0} contribución | {0} contribuciones",
        "loading": "Cargando…",
        "version": "Versión",
        "frontend": "Front-end",
        "backend": "Back-end",
        "latest": "Actualizado",
        "null": "N/A",
        "unknown": "Desconocido",
        "latest_version": "Última {0}"
    },
    "ja": {
        "title": "UoMアシスタント",
        "learn_more": "もっと詳しく",
        "about_1": "UoMアシスタントは、あなたのマンチェスター大学での学習を協力するWebアプリケーションです。すべて必要な情報が、あなたの目の届くところにあります。",
        "about_2": "UoMアシスタントはオープンソースですから、ご自由に利用してくだいさい、私たちに意見を出してくれるもお願いします。自分のサーバーで配備する、ソースコードを編集することはも許可されています。私たちに協力してくれるも歓迎します。",
        "about_3": "UoMアシスタントプロジェクトは、Axton Yao氏によって開始された、そしてAxton Yao氏と他の貢献者によって共に開発されました。もっと知りたいと思ったら、私たちのGitHubページ又は公式サイトをアクセスしてください。",
        "author": "著者",
        "contributors": "貢献者",
        "contribute": "{0} 回貢献 | {0} 回貢献",
        "loading": "ローディング…",
        "version": "バージョン",
        "frontend": "フロントエンド",
        "backend": "バックエンド",
        "latest": "最新バージョン",
        "null": "無",
        "unknown": "不明",
        "latest_version": "最新 {0}"
    }
}
</i18n>

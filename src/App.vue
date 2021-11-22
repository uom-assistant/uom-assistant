<template>
    <v-app>
        <v-app-bar class="elevation-0" color="lighten-4">
            <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
            <v-toolbar-title class="not-selectable app-title" @click="$route.path === '/' ? null : $router.push('/')" :class="{ pointer: $route.path !== '/' }">{{ $t($route.name === 'Home' ? 'title' : ($route.name || '').toLowerCase()) }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-menu
                v-model="showSettingsMenu"
                offset-y
                bottom
                left
                transition="slide-y-transition"
                nudge-bottom="5"
                v-show="$route.path === '/'"
                :close-on-content-click="false"
            >
                <template v-slot:activator="{ on, attrs }">
                   <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        v-show="$route.path === '/'"
                        v-shortkey="['ctrl', 'm']"
                        @shortkey="toggleDark"
                    >
                        <v-icon>mdi-tune</v-icon>
                    </v-btn>
                </template>
                <v-list flat class="shown-list">
                    <v-list-item class="daynight" @click="toggleDark">
                        <v-list-item-icon>
                            <v-icon>{{ $vuetify.theme.dark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ $vuetify.theme.dark ? $t('light_mode') : $t('dark_mode') }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item @click="layoutLock = !layoutLock" class="daynight">
                        <v-list-item-icon class="layout-lock" ref="lockicon">
                            <div class="lock-head no-animation" ref="lockhead" :class="{ off: !layoutLock }"></div>
                            <div class="lock-body"></div>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ layoutLock ? $t('unlock_layout') : $t('lock_layout') }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item @click="newCourseSound = !newCourseSound" class="daynight">
                        <v-list-item-icon class="check-in-bell" :class="{ off: !newCourseSound }" ref="bellicon">
                            <v-icon class="on-icon">{{ 'mdi-bell-outline' }}</v-icon>
                            <v-icon class="off-icon">{{ 'mdi-bell-off-outline' }}</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ $t('new_course_sound') }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider class="my-2"></v-divider>
                    <v-list-item-group
                        v-model="ifWidgets"
                        multiple
                    >
                        <v-list-item v-for="(item, index) in widgets" :key="index">
                            <template v-slot:default="{ active }">
                                <v-list-item-action>
                                    <v-checkbox :input-value="active"></v-checkbox>
                                </v-list-item-action>
                                <v-list-item-content>
                                    <v-list-item-title>{{ $t(item) }}</v-list-item-title>
                                </v-list-item-content>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-menu>
            <v-btn
                icon
                v-show="$route.path !== '/'"
                @click="toggleDark"
            >
                <v-icon>{{ $vuetify.theme.dark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
            </v-btn>
            <v-menu
                offset-y
                bottom
                left
                transition="slide-y-transition"
                nudge-bottom="5"
            >
                <template v-slot:activator="{ on, attrs }">
                   <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                    >
                        <v-icon>mdi-translate</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item v-for="language in languageList" :key="language.locale" @click="toggleLocale(language.locale)">
                        <v-list-item-title>{{ language.name }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn
                icon
                v-show="$route.path === '/'"
                v-shortkey="['ctrl', 'k']"
                @click="openSearch"
                @shortkey="toggleSearch"
            >
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <v-text-field
                solo
                v-model="searching"
                :label="$t('search')"
                :class="{ open: searchOpened }"
                hide-details="auto"
                prepend-inner-icon="mdi-magnify"
                append-icon="mdi-close"
                class="global-search-input"
                ref="searchInput"
                @click:append="closeSearch"
            ></v-text-field>
        </v-app-bar>
        <div id="search-result" class="elevation-3" :class="{ open: searchOpened }" v-show="searching !== '' && searching !== null && searchIndexFiltered.filter((item) => item).flat().length > 0">
            <div>
                <div class="overline mb-1 text--secondary" v-if="searchIndexFiltered[7] && searchIndexFiltered[7].length > 0">
                    {{ $t('note') }}
                </div>
                <noteSearch :notes="searchIndexFiltered[7]" v-if="searchIndexFiltered[7] && searchIndexFiltered[7].length > 0"></noteSearch>
                <div class="overline mb-1 text--secondary" v-if="searchIndexFiltered[5] && searchIndexFiltered[5].length > 0">
                    {{ $t('task') }}
                </div>
                <taskSearch :tasks="searchIndexFiltered[5]" v-if="searchIndexFiltered[5] && searchIndexFiltered[5].length > 0"></taskSearch>
                <div class="overline mb-1 text--secondary" v-if="searchIndexFiltered[8] && searchIndexFiltered[8].length > 0">
                    {{ $t('mail') }}
                </div>
                <mailSearch :mails="searchIndexFiltered[8]" v-if="searchIndexFiltered[8] && searchIndexFiltered[8].length > 0"></mailSearch>
                <div class="overline mb-1 text--secondary" v-if="searchIndexFiltered[9] && searchIndexFiltered[9].length > 0">
                    {{ $t('grade') }}
                </div>
                <gradeSearch :grades="searchIndexFiltered[9]" v-if="searchIndexFiltered[9] && searchIndexFiltered[9].length > 0"></gradeSearch>
                <div class="overline mb-1 text--secondary" v-if="searchIndexFiltered[0] && searchIndexFiltered[0].length > 0">
                    {{ $t('clock') }}
                </div>
                <clockSearch v-if="searchIndexFiltered[0] && searchIndexFiltered[0].length > 0" :city="searchIndexFiltered[0][0].display" :timezone="searchIndexFiltered[0][0].code"></clockSearch>
            </div>
        </div>
        <v-navigation-drawer
            v-model="drawer"
            temporary
            fixed
        >
            <v-list-item>
                <v-list-item-avatar tile size="37">
                    <img :src="$vuetify.theme.dark ? '/img/logo-dark.svg' : '/img/logo.svg'">
                </v-list-item-avatar>
                <v-list-item-content class="not-selectable ml-1">
                    <v-list-item-title class="title">
                        {{ $t('title') }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                        By Axton
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>

            <v-divider></v-divider>

            <v-list
                nav
                dense
            >
                <v-list-item-group
                    v-model="group"
                    active-class="primary--text"
                >
                    <v-list-item to="/">
                        <v-list-item-icon>
                            <v-icon>mdi-view-dashboard</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ $t('dashboard') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item to="/settings">
                        <v-list-item-icon>
                            <v-icon>mdi-cog-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ $t('settings') }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item to="/about">
                        <v-list-item-icon>
                            <v-icon>mdi-information-outline</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ $t('about') }}</v-list-item-title>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-navigation-drawer>
        <v-main>
            <v-container fluid>
                <keep-alive include="Home">
                    <router-view ref="view" :key="`router-${routerRefreshKey}`"></router-view>
                </keep-alive>
            </v-container>
        </v-main>
        <v-dialog
            v-model="welcome"
            persistent
            max-width="1000"
            :content-class="welcomeMessageDialog ? 'welcome-dialog welcome-overflow' : 'welcome-dialog'"
            :no-click-animation="true"
            :fullscreen="$vuetify.breakpoint.xs"
            :transition="$vuetify.breakpoint.xs ? 'slide-y-reverse-transition' : 'dialog-transition'"
        >
            <v-card class="welcome-dialog-card" :class="$vuetify.breakpoint.xs ? 'rounded-0' : ''">
                <v-stepper
                    :value="stage"
                    class="mb-10 stepper elevation-0"
                    :class="{ shown: stage > 0 }"
                >
                    <v-stepper-header>
                        <v-stepper-step
                            step="1"
                            :complete="stage > 1"
                        ></v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step
                            step="2"
                            :complete="stage > 2"
                        >
                        </v-stepper-step>
                        <v-divider></v-divider>
                        <v-stepper-step
                            step="3"
                            :complete="stage > 3"
                        ></v-stepper-step>
                    </v-stepper-header>
                </v-stepper>
                <v-card-text :class="{ 'hide-0': stage !== 0 }">
                    <img src="@/assets/img/welcome/welcome.svg" :class="{ 'small-screen': $vuetify.breakpoint.xs, animation: welcome }" alt="Welcome!">
                    <h1 class="text-h4" :class="$vuetify.breakpoint.xs ? 'mb-4' : 'mb-6'">{{ $t('welcome') }}</h1>
                    <v-select
                        v-model="locale"
                        :items="languageList"
                        :class="$vuetify.breakpoint.xs ? 'small-screen' : ''"
                        item-text="name"
                        item-value="locale"
                        prepend-inner-icon="mdi-translate"
                        class="select"
                        outlined
                        dense
                    ></v-select>
                    <p class="text-body-1" :class="$vuetify.breakpoint.xs ? 'mb-4' : 'mb-7'">{{ $t('not_yet') }}<br>{{ $t('press_to_settings') }}</p>
                    <v-btn
                        depressed
                        x-large
                        color="primary"
                        class="mb-3 main-btn"
                        @click="startWelcome"
                    >
                        {{ $t('continue') }}
                    </v-btn>
                    <div>
                        <v-btn
                            depressed
                            small
                            class="second-btn"
                            @click="skip"
                        >
                            {{ $t('import') }}
                        </v-btn>
                    </div>
                </v-card-text>
                <v-card-text class="same-height" :class="{ 'show-1': stage === -1 }">
                    <div class="intro">
                        <v-card class="rounded-lg mx-auto mb-5 intro-card" outlined>
                            <v-card-text>
                                <v-icon color="primary">mdi-fingerprint</v-icon>
                                <div>
                                    <h1 class="text-h4 primary--text">
                                        {{ $t('value_privacy') }}
                                    </h1>
                                    <p>{{ $t('privacy_policy') }}</p>
                                    <i18n path="read_privacy_policy" tag="p">
                                        <a @click="privacyPolicy = true">{{ $t('privacy_policy_link') }}</a>
                                    </i18n>
                                </div>
                            </v-card-text>
                        </v-card>
                        <v-card class="rounded-lg mx-auto mb-5 intro-card" outlined>
                            <v-card-text>
                                <v-icon color="primary">mdi-information-outline</v-icon>
                                <div>
                                    <h1 class="text-h4 primary--text">
                                        {{ $t('student_lead') }}
                                    </h1>
                                    <p><strong>{{ $t('not_offical') }}</strong>{{ $t('lead_by') }}</p>
                                    <p></p>
                                </div>
                            </v-card-text>
                        </v-card>
                    </div>
                    <v-btn
                        depressed
                        large
                        color="primary"
                        class="mb-3 main-btn"
                        @click="goToSettings"
                    >
                        {{ $t('got_it') }}
                    </v-btn>
                </v-card-text>
                <v-card-text class="same-height backend" :class="{ 'show-1': stage === 1 }">
                    <div class="mt-12 settings">
                        <h1 class="mt-12 pb-12 pt-10" :class="$vuetify.breakpoint.xs ? 'text-h5' : 'text-h4'">{{ $t('connect_to') }}</h1>
                        <v-text-field
                            v-model.trim="backendURL"
                            outlined
                            validate-on-blur
                            :label="$t('backend_url')"
                            :rules="rulesUrl"
                            :readonly="loading"
                            :disabled="needToken"
                            :error="urlError"
                            :error-messages="urlError ? (urlErrorTemp ? $t('backend_maintenance') : $t('wrong_url')) : []"
                            prefix="https://"
                            prepend-inner-icon="mdi-server"
                            class="input mt-12"
                            ref="backendUrl"
                            @keydown="urlError = false"
                            @keydown.enter="checkConnection"
                        ></v-text-field>
                        <v-text-field
                            v-model.trim="backendToken"
                            outlined
                            :label="$t('backend_token')"
                            :class="{ shown: needToken }"
                            :hint="$t('need_token')"
                            :error="tokenError"
                            :error-messages="tokenError ? $t('wrong_token') : []"
                            :type="showToken ? 'text' : 'password'"
                            :append-icon="showToken ? 'mdi-eye' : 'mdi-eye-off'"
                            prepend-inner-icon="mdi-shield-lock"
                            class="input mb-10 token-input"
                            ref="backendTk"
                            @keydown="tokenError = false"
                            @keydown.enter="checkConnection"
                            @click:append="showToken = !showToken"
                        ></v-text-field>
                    </div>
                    <v-btn
                        depressed
                        large
                        color="primary"
                        class="mb-3 main-btn mt-10"
                        @click="checkConnection"
                        :loading="loading"
                        :disabled="loading || !urlValid || !tokenValid"
                    >
                        {{ $t('next') }}
                    </v-btn>
                    <v-btn
                        depressed
                        small
                        class="second-btn"
                        @click="skip"
                    >
                        {{ $t('skip') }}
                    </v-btn>
                </v-card-text>
                <v-card-text class="same-height personal" :class="{ 'show-1': stage === 2 }">
                    <h1 class="mt-12 pb-4 pt-10" :class="$vuetify.breakpoint.xs ? 'text-h5' : 'text-h4'">{{ $t('account_settings') }}</h1>
                    <settings class="settings mt-4" ref="settingsField" @valid="(status) => settingsValid = status" @submit="checkConfig"></settings>
                    <v-btn
                        depressed
                        large
                        color="primary"
                        class="mb-3 main-btn mt-3"
                        @click="checkConfig()"
                        :loading="loading"
                        :disabled="loading || !settingsValid"
                    >
                        {{ $t('next') }}
                    </v-btn>
                </v-card-text>
                <v-card-text class="same-height done" :class="{ 'show-1': stage === 3 }">
                    <h1 class="mt-15 pt-10 set-up-done-title" :class="$vuetify.breakpoint.xs ? 'text-h3 pb-5' : 'text-h1 pb-15'">🎉</h1>
                    <div v-html="$t('setup_done')" class="text-body-1 set-up-done" :class="$vuetify.breakpoint.xs ? 'small mb-3' : 'mb-10'"></div>
                    <v-btn
                        depressed
                        x-large
                        color="primary"
                        class="mb-3 main-btn mt-3"
                        @click="welcomeDone"
                    >
                        {{ $t('done') }}
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="welcomeMessageDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('message_from_backend') }}
                </v-card-title>
                <v-card-text>
                    {{ welcomeMessage }}
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="dismissWelcomeMessage"
                >
                    {{ $t('ok') }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="accountNotice"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('account_notice_title') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('account_notice_body') }}
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    text
                    @click="accountNotice = false"
                >
                    {{ $t('cancel') }}
                </v-btn>
                <v-btn
                    color="primary"
                    text
                    @click="checkConfig(true)"
                >
                    {{ $t('continue') }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="loginError"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('login_error_title') }}
                </v-card-title>
                <v-card-text>
                    {{ $t(loginErrorText) }}
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="closeLoginError"
                >
                    {{ $t('ok') }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="privacyPolicy"
            max-width="500"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('privacy_policy_link') }}
                </v-card-title>
                <v-card-text class="privacy-policy-dialog-text" v-html="$t('privacy_policy_text')"></v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="privacyPolicy = false"
                >
                    {{ $t('ok') }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="updating"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline text-center d-block">
                    {{ $t('updating') }}
                </v-card-title>
                <v-card-text>
                    <v-progress-linear
                        indeterminate
                        color="primary"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
        <div id="alert-space" v-show="displayErrors.length > 0" :style="{ bottom: updateReady ? '135px' : '5px' }">
            <v-alert
                v-for="(item, index) in displayErrors"
                :key="item.id"
                border="left"
                elevation="6"
                dismissible
                :type="item.type"
                :icon="item.type === 'error' ? 'mdi-alert-circle-outline' : (item.type === 'warning' ? 'mdi-alert-outline' : 'mdi-check-circle-outline')"
                close-icon="mdi-close"
            >
            <template v-slot:close>
                <v-btn icon small @click="dismissError(index)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </template>
                <strong>{{ item.title }}</strong><br><span class="text-body-2">{{ item.content }}</span>
            </v-alert>
        </div>
        <v-snackbar
            v-model="updateReady"
            vertical
            timeout="-1"
            right
        >
            <div>
                <strong class="mb-2 d-block update-title">{{ $t('title') }} {{ updateReadyVersion }}</strong>
                {{ $t('front_end_update_ready') }}
            </div>
            <template v-slot:action="{ attrs }">
                <v-btn
                    color="grey lighten-1"
                    text
                    v-bind="attrs"
                    @click="updateReady = false"
                >
                    {{ $t('front_end_ignore') }}
                </v-btn>
                <v-btn
                    color="uomthemelight"
                    text
                    v-bind="attrs"
                    @click="updateFrontend"
                >
                    {{ $t('front_end_update') }}
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>

<script>
import { mapState } from 'vuex';
import semVerCmp from 'semver-compare';
import * as JsSearch from 'js-search';

import settings from '@/components/settings.vue';
import noteSearch from '@/components/search/note.vue';
import taskSearch from '@/components/search/task.vue';
import mailSearch from '@/components/search/mail.vue';
import gradeSearch from '@/components/search/grade.vue';
import clockSearch from '@/components/search/clock.vue';

import checkBackendVersion from '@/tools/checkBackendVersion';
import betterFetch from '@/tools/betterFetch';
import formatDateTime from '@/tools/formatDateTime';
import updateStorage from '@/tools/update';
import localeList from '@/locales/localeList';
import * as version from '../public/version.json';

import '@/styles/highlight.less';

let checkInBellTimer = -1;
let layoytLockTimer = -1;
let backendToken = '';

// Set shared time formatters
// Intl.DateTimeFormat is expensive, see https://bugs.chromium.org/p/v8/issues/detail?id=6528
const initLang = localStorage.getItem('language') || 'en';
const langIso = localeList.find((item) => item.locale === initLang).iso;
window.uomaTimeFormatters = {
    month: new Intl.DateTimeFormat(langIso, {
        month: 'short',
        day: 'numeric',
    }),
    day: new Intl.DateTimeFormat(langIso, {
        day: 'numeric',
    }),
    date: new Intl.DateTimeFormat(langIso, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'long',
    }),
    time: new Intl.DateTimeFormat(langIso, {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    }),
    relative: new Intl.RelativeTimeFormat(langIso, { numeric: 'auto' }),
};
window.displayFormatters = {
    region: new Intl.DisplayNames([langIso], { type: 'region' }),
};

let timeFormattersInited = false;

// requestIdleCallback fallbck for Safari
if (!window.requestIdleCallback) {
    window.requestIdleCallback = (cb, config) => setTimeout(cb, config ? config.timeout / 2 : 3000);
}
if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = (cbId) => clearTimeout(cbId);
}

export default {
    name: 'App',
    components: {
        settings,
        noteSearch,
        taskSearch,
        mailSearch,
        gradeSearch,
        clockSearch,
    },
    data: () => ({
        showSettingsMenu: false,
        welcome: false,
        drawer: false,
        group: 0,
        stage: 0,
        backendURL: '',
        urlError: false,
        urlErrorTemp: false,
        backendToken: '',
        showToken: false,
        needToken: false,
        tokenError: false,
        loading: false,
        welcomeMessage: '',
        welcomeMessageDialog: false,
        darkMode: false,
        locale: '',
        localeDetail: null,
        backend: {},
        account: {},
        searchOpened: false,
        settingsValid: false,
        accountNotice: false,
        routerRefreshKey: 0,
        loginError: false,
        loginErrorText: '',
        privacyPolicy: false,
        rulesUrl: [
            (value) => !!value || '',
            (value) => /^[\w-]+(\.[\w-]+)+([\w.,@^=%:/~+-]*)?$/i.test(value) || '',
        ],
        languageList: localeList,
        ifWidgets: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        widgets: [
            'clock',
            'bblinks',
            'livelinks',
            'subjects',
            'attendance',
            'calendar',
            'task',
            'note',
            'mail',
            'grade',
            'plugins',
        ],
        searching: '',
        searchIndexFiltered: [null, null, null, null, null, null, null, null, null, null, null],
        searchers: [null, null, null, null, null, null, null, null, null, null, null],
        timer: null,
        updateReady: false,
        updateReadyVersion: '',
        updating: false,
        newCourseSound: true,
        layoutLock: false,
    }),
    methods: {
        /**
         * Set language globally
         * @param {string} language target langue
         */
        toggleLocale(language) {
            this.locale = language;
        },
        /**
         * Dismiss an error
         * @param {string} index target error index
         */
        dismissError(index) {
            this.$store.commit('removeError', index);
        },
        /**
         * Skip initial settings
         */
        skip() {
            this.welcome = false;
        },
        /**
         * Start setup guide
         */
        startWelcome() {
            this.stage = -1;

            // Download guide notes
            this.$store.commit('setSearchNotification', {
                target: 'note',
                payload: { action: 'initGuide', index: this.locale },
            });

            // Set default translation language
            this.$store.commit('setSearchNotification', {
                target: 'mail',
                payload: {
                    action: 'initTranslationSettings',
                    data: {
                        language: this.localeDetail.iso3,
                        locale: this.locale,
                    },
                },
            });
        },
        /**
         * Start initial settings
         */
        goToSettings() {
            const backend = JSON.parse(localStorage.getItem('backend') || `{
                "url": "",
                "token": "",
                "status": true
            }`);

            this.backendURL = backend.url;

            this.stage = 1;
            setTimeout(() => {
                this.$refs.backendUrl.focus();
            }, 500);
        },
        /**
         * Check if the backend is ready
         */
        async checkConnection() {
            if (!this.urlValid || !this.tokenValid) {
                // Button disabled
                return;
            }
            // Reset flags
            this.tokenError = false;
            this.loading = true;

            let requestFailed = false;
            // Send request
            const response = await betterFetch(`https://${this.backendURL}${this.backendURL.substr(-1) === '/' ? '' : '/'}check_ability/`, {
                method: 'POST',
                body: JSON.stringify({
                    token: this.backendToken ? this.backendToken : '',
                }),
            }).catch(() => {
                // Network error
                this.urlErrorTemp = false;
                this.urlError = true;
                this.loading = false;
                requestFailed = true;
            });

            if (requestFailed) {
                return;
            }

            if (!response.uomabVersion || !response.success) {
                // Not a valid UoM Assistant backend
                this.urlErrorTemp = false;
                this.urlError = true;
                this.loading = false;
                return;
            }

            if (response.maintenance || !checkBackendVersion(response.uomabVersion)) {
                // Backend maintenance
                this.urlErrorTemp = true;
                this.urlError = true;
                this.loading = false;
                return;
            }

            if (response.data.tokenRequired) {
                // Wrong Token
                if (this.needToken) {
                    this.tokenError = true;
                }

                this.needToken = true;
                setTimeout(() => {
                    this.$refs.backendTk.focus();
                }, 500);
                this.loading = false;
            } else {
                // Connected successfully
                backendToken = this.backendToken;

                if (response.data.welcomeMessage && response.data.welcomeMessage !== '') {
                    // Show welcome messages
                    this.welcomeMessage = response.data.welcomeMessage;
                    this.welcomeMessageDialog = true;
                    this.$refs.settingsField.setState(response.data);
                } else {
                    // Go to account settings
                    this.stage = 2;
                    this.$refs.settingsField.setState(response.data);
                    this.$nextTick(() => {
                        this.$refs.settingsField.refreshKey = new Date().valueOf();
                    });
                    setTimeout(() => {
                        this.$refs.settingsField.focusFirst();
                    }, 500);
                    setTimeout(() => {
                        this.loading = false;
                    }, 200);
                }
            }
        },
        /**
         * Check UoM Account info and finish the guide
         * @param {boolean} skipAccountCheck whether to skip account check
         */
        async checkConfig(skipAccountCheck = false) {
            this.accountNotice = false;

            if (!this.settingsValid) {
                return;
            }

            // Restore account info if present
            const account = JSON.parse(localStorage.getItem('account') || `{
                "calendar": "",
                "email": "",
                "password": "",
                "username": ""
            }`);

            // Set calendar URL
            account.calendar = this.$refs.settingsField.calendarURL.slice(8).replace(/\/api\/ical\//g, '/').split('/').slice(1, 3).join('/');

            // Check if UoM account info is presented
            if (!skipAccountCheck && this.$refs.settingsField.allowAccount && (!this.$refs.settingsField.username && !this.$refs.settingsField.password && !this.$refs.settingsField.email)) {
                this.accountNotice = true;
                return;
            }

            if ((!this.$refs.settingsField.allowAccount && this.$refs.settingsField.calendarURL) || (this.$refs.settingsField.allowAccount && (!this.$refs.settingsField.username && !this.$refs.settingsField.password && !this.$refs.settingsField.email))) {
                // Store account info without username and password
                localStorage.setItem('account', JSON.stringify({
                    calendar: account.calendar,
                    email: '',
                    password: '',
                    username: '',
                }));

                // Store backend info
                localStorage.setItem('backend', JSON.stringify({
                    url: this.backendURL.substr(-1) === '/' ? this.backendURL.slice(0, -1) : this.backendURL,
                    token: backendToken || '',
                    status: true,
                }));

                // Go to finish screen
                this.stage = 3;
                setTimeout(() => {
                    this.loading = false;
                }, 200);
                return;
            }

            // Try to login
            if (this.$refs.settingsField.allowAccount && ((this.$refs.settingsField.username && this.$refs.settingsField.password && this.$refs.settingsField.email) || (!this.$refs.settingsField.username && !this.$refs.settingsField.password && !this.$refs.settingsField.email))) {
                this.loading = true;
                let requestFailed = false;

                const response = await betterFetch(`https://${this.backendURL}${this.backendURL.substr(-1) === '/' ? '' : '/'}check_account/`, {
                    method: 'POST',
                    body: JSON.stringify({
                        username: this.$refs.settingsField.username,
                        password: this.$refs.settingsField.password,
                        token: backendToken || '',
                    }, true),
                }).catch(() => {
                    // Network error
                    this.loading = false;
                    this.loginError = true;
                    this.loginErrorText = 'network_error';
                    requestFailed = true;
                });

                if (requestFailed) {
                    return;
                }

                if (!response.uomabVersion || !response.success) {
                    // Not a valid UoM Assistant backend
                    this.loading = false;
                    this.loginError = true;
                    this.loginErrorText = 'backend_error';
                    return;
                }

                if (response.data.tokenRequired) {
                    // Not a valid UoM Assistant backend
                    this.loading = false;
                    this.loginError = true;
                    this.loginErrorText = 'token_required';
                    return;
                }

                if (response.maintenance || !checkBackendVersion(response.uomabVersion)) {
                    // Backend maintenance
                    this.loading = false;
                    this.loginError = true;
                    this.loginErrorText = 'backend_maintenance';
                    return;
                }

                if (!response.data.login) {
                    // Wrong Token
                    this.loading = false;
                    this.loginError = true;
                    this.loginErrorText = 'login_error';
                    return;
                }

                // Store account info
                account.username = this.$refs.settingsField.username.toLowerCase();
                account.password = this.$refs.settingsField.password;
                account.email = `${this.$refs.settingsField.email}.manchester.ac.uk`.toLowerCase();
                localStorage.setItem('account', JSON.stringify(account));

                // Store backend info
                localStorage.setItem('backend', JSON.stringify({
                    url: this.backendURL.substr(-1) === '/' ? this.backendURL.slice(0, -1) : this.backendURL,
                    token: backendToken || '',
                    status: true,
                }));

                // Mark setuo guide as done
                localStorage.setItem('setup', 'true');

                // Go to finish screen
                this.stage = 3;
                setTimeout(() => {
                    this.loading = false;
                }, 200);
            }
        },
        /**
         * Close the login error dialog and focus the username input in needed
         */
        closeLoginError() {
            this.loginError = false;
            if (this.loginErrorText === 'login_error') {
                this.$nextTick(() => {
                    this.$refs.settingsField.focusUsername();
                });
            }
        },
        /**
         * Close the setup guide and refresh the dashboard
         */
        welcomeDone() {
            this.$store.commit('setBackend', JSON.parse(localStorage.getItem('backend')) || { status: true });
            this.$store.commit('setBackendStatus', true);
            this.$store.commit('setAccount', JSON.parse(localStorage.getItem('account')) || {});
            this.welcome = false;
            if (this.$route.path === '/') {
                this.routerRefreshKey = new Date().valueOf();
            }
        },
        /**
         * Dismiss welcome message dialog and go to account settings
         */
        dismissWelcomeMessage() {
            this.welcomeMessageDialog = false;
            this.stage = 2;
            this.$nextTick(() => {
                this.$refs.settingsField.refreshKey = new Date().valueOf();
            });
            setTimeout(() => {
                this.$refs.settingsField.focusFirst();
            }, 500);
            setTimeout(() => {
                this.loading = false;
            }, 200);
        },
        /**
         * Toggle dark mode globally
         */
        toggleDark() {
            this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
            this.$store.commit('setDarkMode', this.$vuetify.theme.dark);
            localStorage.setItem('dark', this.$vuetify.theme.dark ? 'true' : 'false');

            document.querySelector('meta[name="theme-color"]').setAttribute('content', this.$vuetify.theme.dark ? '#272727' : '#F5F5F5');

            if (window.__UOMA_ELECTRON__ && window.__UOMA_ELECTRON_BRIDGE__) {
                window.__UOMA_ELECTRON_BRIDGE__.setAttr('theme', this.$vuetify.theme.dark ? 'dark' : 'light');
            }
        },
        /**
         * Open search bar and focus on it
         */
        openSearch() {
            this.searchOpened = true;
            if (this.searching !== '' && this.searching !== null) {
                this.searchResult();
            }
            setTimeout(() => {
                if (this.searchOpened) {
                    this.$refs.searchInput.focus();
                }
            }, 350);
        },
        /**
         * Close search bar and blur the input field
         */
        closeSearch() {
            this.searchOpened = false;
            this.$refs.searchInput.blur();
        },
        /**
         * Toggle search bar
         */
        toggleSearch() {
            if (this.searchOpened) {
                this.closeSearch();
            } else if (this.$route.path === '/') {
                this.openSearch();
            }
        },
        /**
         * Rebuild searchers from search indexes when search indexes changed
         */
        rebuildSearchIndex() {
            for (let i = 0; i < this.searchIndex.length; i += 1) {
                const item = this.searchIndex[i];
                if (item.name) {
                    const searcher = new JsSearch.Search(item.key);

                    searcher.tokenizer = {
                        tokenize: (text) => [].concat(...text.split(/([\u4E00-\u9FA5\uF900-\uFA2D])/).map((textMap) => textMap.split(' '))).filter((textFilter) => textFilter !== ''),
                    };
                    searcher.indexStrategy = new JsSearch.AllSubstringsIndexStrategy();
                    for (let j = 0; j < item.indexes.length; j += 1) {
                        searcher.addIndex(item.indexes[j]);
                    }
                    searcher.addDocuments(item.data);

                    this.searchers[i] = searcher;
                } else {
                    this.searchers[i] = null;
                }
            }
        },
        /**
         * Search result from search index based on input
         */
        searchResult() {
            if (!this.searching) {
                this.searchIndexFiltered = [];
                return;
            }
            const result = [];
            for (let i = 0; i < this.searchIndex.length; i += 1) {
                const item = this.searchIndex[i];
                if (item.name) {
                    result.push(this.searchers[i].search(this.searching).slice(0, 7));
                } else {
                    result.push(null);
                }
            }
            this.searchIndexFiltered = result;
        },
        /**
         * Check if there is a new version of the frontend
         */
        async checkFrontEndUpdate() {
            let requestFailed = false;
            // Send request
            const response = await betterFetch('/version.json').catch(() => {
                // Network error
                requestFailed = true;
            });

            if (requestFailed) {
                return;
            }

            if (semVerCmp(version.version, response.version) < 0) {
                this.updateReady = true;
                this.updateReadyVersion = response.version;
            }
        },
        /**
         * Update frontend
         */
        updateFrontend() {
            localStorage.setItem('update_frontend', 'true');
            window.location.replace(window.location.href);
        },
        /**
         * Check whether to show the welcome dialog
         */
        checkWelcome() {
            if (this.$route.path === '/' && localStorage.getItem('setup') !== 'true') {
                this.welcome = true;
            }
        },
    },
    computed: {
        ...mapState({
            displayErrors: (state) => state.errorList,
            backendStatus: (state) => state.backendStatus,
            searchIndex: (state) => state.searchIndex,
            searchIndexChecker: (state) => state.searchIndexChecker,
        }),
        /**
         * Check if the URL field is valid
         * @returns {boolean} whether the URL field is valid
         */
        urlValid() {
            if (this.backendURL.length === 0) {
                return false;
            }
            if (/^[\w-]+(\.[\w-]+)+([\w.,@^=%:/~+-]*)?$/i.test(this.backendURL)) {
                return true;
            }
            return false;
        },
        /**
         * Check if the token field is valid
         * @returns {boolean} whether the token field is valid
         */
        tokenValid() {
            if (this.needToken && ((this.backendToken && this.backendToken.length !== 32) || !this.backendToken)) {
                return false;
            }
            return true;
        },
    },
    watch: {
        ifWidgets() {
            // Store widget status to local storage
            localStorage.setItem('if_widgets', JSON.stringify(this.ifWidgets));
            this.$store.commit('setWidgets', this.ifWidgets);
        },
        newCourseSound() {
            // Store class bell status to local storage
            localStorage.setItem('class_bell', this.newCourseSound);
            this.$store.commit('setClassBell', this.newCourseSound);

            if (this.$refs.bellicon) {
                this.$nextTick(() => {
                    this.$refs.bellicon.classList[this.newCourseSound ? 'add' : 'remove']('on');

                    if (this.newCourseSound) {
                        if (checkInBellTimer !== -1) {
                            clearTimeout(checkInBellTimer);
                        }
                        checkInBellTimer = setTimeout(() => {
                            this.$refs.bellicon.classList.remove('on');
                        }, 500);
                    }
                });
            }
        },
        layoutLock() {
            // Store layout lock status to local storage
            localStorage.setItem('lock_layout', this.layoutLock);
            this.$store.commit('setLayoutLock', this.layoutLock);

            if (this.$refs.lockicon) {
                this.$nextTick(() => {
                    this.$refs.lockicon.classList[this.layoutLock ? 'add' : 'remove']('on');

                    this.$refs.lockhead.classList.remove('no-animation');
                    this.$refs.lockhead.classList[this.layoutLock ? 'add' : 'remove']('on');

                    if (layoytLockTimer !== -1) {
                        clearTimeout(layoytLockTimer);
                    }
                    layoytLockTimer = setTimeout(() => {
                        this.$refs.lockicon.classList.remove('on');
                        this.$refs.lockhead.classList.remove('on');
                        this.$refs.lockhead.classList.add('no-animation');
                    }, 500);
                });
            }
        },
        locale() {
            // Store language settings to local storage
            this.$i18n.locale = this.locale;
            this.localeDetail = this.languageList.find((item) => item.locale === this.locale);
            this.$vuetify.lang.current = this.localeDetail.localeName;

            document.documentElement.lang = this.locale;
            localStorage.setItem('language', this.locale);

            this.$store.commit('setLocale', this.locale);
            this.$store.commit('setLocaleDetail', this.localeDetail);

            if (window.__UOMA_ELECTRON__ && window.__UOMA_ELECTRON_BRIDGE__) {
                window.__UOMA_ELECTRON_BRIDGE__.setAttr('language', this.locale);
            }

            if (timeFormattersInited) {
                // Set shared time formatters
                window.uomaTimeFormatters = {
                    month: new Intl.DateTimeFormat(this.localeDetail.iso, {
                        month: 'short',
                        day: 'numeric',
                    }),
                    day: new Intl.DateTimeFormat(this.localeDetail.iso, {
                        day: 'numeric',
                    }),
                    date: new Intl.DateTimeFormat(this.localeDetail.iso, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        weekday: 'long',
                    }),
                    time: new Intl.DateTimeFormat(this.localeDetail.iso, {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                    }),
                    relative: new Intl.RelativeTimeFormat(this.localeDetail.iso, { numeric: 'auto' }),
                };
                window.displayFormatters = {
                    region: new Intl.DisplayNames([this.localeDetail.iso], { type: 'region' }),
                };
            } else {
                timeFormattersInited = true;
            }

            this.$nextTick(() => {
                this.searchResult();
            });
        },
        backendStatus() {
            if (this.backendStatus === true) {
                this.$store.commit('addError', {
                    title: this.$t('backend_reconnect'),
                    content: this.$t('backend_reconnect_body'),
                    type: 'success',
                });
            }
        },
        searching() {
            this.searchResult();
        },
        searchIndexChecker() {
            // Search indexes changed
            this.rebuildSearchIndex();
            if (this.searching !== '' && this.searching !== null && this.searchOpened) {
                this.searchResult();
            }
        },
    },
    mounted() {
        window.isUoma = true;

        // Initialize language
        this.locale = initLang;

        // Set version
        updateStorage();
        localStorage.setItem('uoma_version', version.version);

        // Check if updating
        const updating = localStorage.getItem('update_frontend') || 'false';
        if (updating === 'true') {
            localStorage.setItem('update_frontend', 'remove');
            this.updating = true;
            window.addEventListener('load', () => {
                setTimeout(() => {
                    window.location.replace(window.location.href);
                }, 30000);
            });
        } else if (updating === 'remove') {
            localStorage.removeItem('update_frontend');
        }

        // Initialize widget status
        try {
            this.ifWidgets = JSON.parse(localStorage.getItem('if_widgets')) || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        } catch {
            this.ifWidgets = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        }
        localStorage.setItem('if_widgets', JSON.stringify(this.ifWidgets));
        this.$store.commit('setWidgets', this.ifWidgets);

        // Initialize class bell status
        this.newCourseSound = (localStorage.getItem('class_bell') || 'true') === 'true';
        this.$store.commit('setClassBell', this.newCourseSound);

        // Initialize layout lock status
        this.layoutLock = (localStorage.getItem('lock_layout') || 'false') === 'true';
        this.$store.commit('setLayoutLock', this.layoutLock);

        // Initialize dark mode status
        const darkMode = localStorage.getItem('dark');
        this.$vuetify.theme.dark = darkMode ? (darkMode === 'true') : false;
        this.$store.commit('setDarkMode', this.$vuetify.theme.dark);

        document.querySelector('meta[name="theme-color"]').setAttribute('content', this.$vuetify.theme.dark ? '#272727' : '#F5F5F5');

        if (window.__UOMA_ELECTRON__ && window.__UOMA_ELECTRON_BRIDGE__) {
            window.__UOMA_ELECTRON_BRIDGE__.setAttr('theme', this.$vuetify.theme.dark ? 'dark' : 'light');
        }

        // Initialize backend connection
        try {
            this.backend = JSON.parse(localStorage.getItem('backend')) || { status: true };
        } catch {
            this.backend = { status: true };
        }
        this.$store.commit('setBackend', this.backend);
        this.$store.commit('setBackendStatus', this.backend.status);

        // Initialize account data
        try {
            this.account = JSON.parse(localStorage.getItem('account')) || {};
        } catch {
            this.account = {};
        }
        this.$store.commit('setAccount', this.account);

        this.rebuildSearchIndex();

        if (updating !== 'true') {
            // Check update for front-end every 2 hours
            this.checkFrontEndUpdate();
            this.timer = setInterval(() => {
                this.checkFrontEndUpdate();
            }, 7200000);
        }

        this.$router.onReady(() => {
            this.checkWelcome();
        });
        this.$router.afterEach(() => {
            this.checkWelcome();
            if (this.$route.path !== '/' && this.searchOpened) {
                this.closeSearch();
            }
        });
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
    errorCaptured(err) {
        // Handle uncaught errors
        this.$store.commit('addError', {
            title: `${this.$t('unknown')} ${err.name}`,
            content: this.$t('error_at', [err.message, formatDateTime(new Date(), this.locale ? this.locale : 'en', window.uomaTimeFormatters)]),
            type: 'error',
        });
        return true;
    },
};
</script>

<style lang="less">
@keyframes welcome {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
@keyframes shake {
    0% {
        transform: rotate(0);
    }
    4.5% {
        transform: rotate(-8deg);
    }
    9.5% {
        transform: rotate(8deg);
    }
    14.5% {
        transform: rotate(-6deg);
    }
    23.5% {
        transform: rotate(6deg);
    }
    26.5% {
        transform: rotate(-4deg);
    }
    37.5% {
        transform: rotate(4deg);
    }
    40.5% {
        transform: rotate(-2deg);
    }
    46.5% {
        transform: rotate(2deg);
    }
    50% {
        transform: rotate(0);
    }
}
@keyframes unlock {
    0% {
        transform: translateY(0);
        width: 10px;
        left: 7px;
    }
    25% {
        transform: translateY(-2px);
        width: 10px;
        left: 7px;
    }
    62.5% {
        transform: translateY(-2px);
        width: 0;
        left: 17px;
    }
    62.6% {
        transform: translateY(-2px);
        width: 5px;
        left: 15px;
    }
    100% {
        transform: translateY(-2px);
        width: 10px;
        left: 15px;
    }
}
@keyframes lock {
    0% {
        transform: translateY(-2px);
        width: 10px;
        left: 15px;
    }
    24.9% {
        transform: translateY(-2px);
        width: 5px;
        left: 15px;
    }
    25% {
        transform: translateY(-2px);
        width: 0;
        left: 17px;
    }
    50% {
        transform: translateY(-2px);
        width: 10px;
        left: 7px;
    }
    100% {
        transform: translateY(0);
        width: 10px;
        left: 7px;
    }
}
@keyframes lockall {
    0% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(2px);
    }
    100% {
        transform: translateY(0);
    }
}

html::-webkit-scrollbar {
    width: 0;
}
.v-application {
    font-family: Roboto, -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
    -webkit-font-smoothing: antialiased;
    max-width: 100vw;
    overflow: hidden;
    #alert-space {
        width: calc(100% - 50px);
        right: 25px;
        max-width: 350px;
        position: fixed;
        z-index: 9999;
    }
    .text-h1, .overline, .title, .mail-view-subject > span, .mail-detail .text-body-2, .mail-translation .text-body-2 {
        font-family: Roboto, -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif!important;
    }
    .v-application--wrap > header {
        flex-grow: 0;
    }
    .v-main {
        overflow: hidden;
    }
}
.gray-container, .v-window-item > .container, .v-main__wrap > .container {
    background-color: #F5F5F5;
}
.v-main__wrap > .container {
    padding-top: 0;
    padding-bottom: 0;
    .v-calendar-events .v-event-timed {
        border-color: white!important;
    }
}
#app.theme--dark .v-window-item > .container, #app.theme--dark .v-main__wrap > .container {
    background-color: #272727;
    .v-calendar-events .v-event-timed {
        border-color: #303030!important;
    }
}
.v-menu__content.large-radius {
    border-radius: 8px!important;
}
.not-selectable {
    user-select: none;
    &.pointer {
        cursor: pointer;
    }
}
.dark-text-secondary {
    color: rgba(255, 255, 255, .6);
}
.daynight {
    .v-list-item__icon {
        margin: 12px 16px 12px 0;
        margin-right: 16px!important;
    }
    .layout-lock {
        position: relative;
        .lock-head {
            width: 10px;
            height: 8px;
            position: absolute;
            top: 1px;
            left: 7px;
            border: 2px solid #757575;
            border-radius: 5px 5px 0 0;
            border-bottom: none;
            z-index: 2;
            &.off {
                animation: unlock .3s 0s 1 linear both;
            }
            &.on {
                animation: lock .5s 0s 1 linear both;
            }
            &.no-animation {
                animation-duration: 0s;
            }
        }
        .lock-body {
            width: 16px;
            height: 14px;
            position: absolute;
            top: 8px;
            left: 4px;
            border: 2px solid #757575;
            border-radius: 2px;
            z-index: 3;
            &::before {
                content: "";
                width: 2px;
                height: 2px;
                position: absolute;
                top: -4px;
                left: 9px;
                background-color: #757575;
            }
            &::after {
                content: "";
                width: 4px;
                height: 4px;
                position: absolute;
                top: 3px;
                left: 4px;
                background-color: #757575;
                border-radius: 3px;
            }
        }
        &.on {
            animation: lockall .2s .4s 1 both;
        }
    }
    .check-in-bell {
        position: relative;
        .on-icon, .off-icon {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 2;
            transition: opacity .3s;
            opacity: 1;
            transform-origin: top center;
        }
        .off-icon {
            opacity: 0;
        }
        &::after {
            content: "";
            position: absolute;
            top: 1px;
            left: 2px;
            width: 114%;
            height: 3px;
            background-color: #757575;
            transform: rotate(45deg) scaleX(0) scaleY(.5);
            z-index: 3;
            transition: transform .3s, opacity 0s;
            transform-origin: left;
            opacity: 1;
        }
        &.on {
            animation: shake 1s ease-in-out 0s 1;
        }
        &.off {
            &::after, &::before {
                transform: rotate(45deg) scaleX(1) scaleY(.5);
                opacity: 0;
                transition: transform .3s, opacity 0s .3s;
            }
            .on-icon {
                opacity: 0;
                transition: opacity .2s .2s;
            }
            .off-icon {
                opacity: 1;
                transition: opacity .2s .2s;
            }
        }
    }
}
.shown-list {
    .v-list-item__action {
        margin-right: 16px!important;
    }
    .v-list-item {
        padding-right: 32px;
    }
}
.handle {
    user-select: none;
}
.katex .katex-mathml {
    top: -1000px;
    left: -1000px;
    opacity: 0;
}
.welcome-dialog {
    background-color: white;
    border-radius: 8px;
}
.welcome-dialog.v-dialog--fullscreen {
    border-radius: 0;
}
.welcome-dialog.welcome-overflow {
    overflow: hidden;
}
.welcome-dialog.rounded-0 .welcome-dialog-card {
    border-radius: 0;
}
.welcome-dialog .welcome-dialog-card {
    border-radius: 8px;
    overflow: hidden;
    .stepper {
        position: absolute;
        top: 30px;
        left: 10%;
        width: 0;
        height: 0;
        overflow: hidden;
        box-shadow: none;
        pointer-events: none;
        opacity: 0;
        background-color: transparent;
        transition: opacity .2s .2s;
        &.shown {
            width: 80%;
            height: auto;
            opacity: 1;
            pointer-events: auto;
        }
    }
    .intro {
        margin-top: 20px;
        width: 100%;
        height: calc(100% - 130px);
        margin-bottom: 40px;
        .intro-card {
            width: 100%;
            height: calc(50% - 10px);
            padding: 15px;
            overflow: auto;
            .v-card__text {
                height: 100%;
                display: flex;
                i {
                    font-size: 60px;
                    margin-bottom: 15px;
                }
                h1 {
                    font-size: 30px!important;
                    margin-bottom: 15px;
                }
                p {
                    font-size: 16px;
                    margin-bottom: 12px;
                    max-width: 600px;
                }
                @media (max-width: 430px) {
                    i {
                        font-size: 45px;
                        margin-bottom: 5px;
                    }
                    h1 {
                        font-size: 23px!important;
                        margin-bottom: 5px;
                    }
                    p {
                        font-size: 14px;
                        margin-bottom: 10px;
                    }
                }
            }
        }
    }
    .v-card__text {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        transition: opacity .2s;
        img {
            width: 90%;
            max-width: 500px;
            margin: 50px 0 30px 0;
            transform: translateY(30px);
            opacity: 0;
            &.animation {
                animation: welcome .3s .5s forwards;
            }
            &.small-screen {
                margin: 30px 0 30px 0;
            }
        }
        h1, p {
            text-align: center;
        }
        .select {
            width: 80%;
            max-width: 200px;
            &.small-screen {
                margin-bottom: -10px;
            }
        }
        .main-btn {
            border-radius: 6px;
        }
        .second-btn {
            background-color: transparent;
        }
        .input {
            width: 100%;
        }
        .settings {
            width: 95%;
            max-width: 500px;
        }
        &.same-height {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 0;
            pointer-events: none;
            opacity: 0;
            transition: opacity .2s, height 0s .2s, width 0s .2s;
            &.backend {
                z-index: 2;
            }
            &.personal {
                z-index: 3;
            }
            .token-input {
                height: 0;
                opacity: 0;
                transition: height .2s, opacity .2s .2s;
                &.shown {
                    height: 87px;
                    opacity: 1;
                }
            }
        }
        &.hide-0 {
            opacity: 0;
        }
        &.show-1 {
            opacity: 1;
            width: 100%;
            height: 100%;
            pointer-events: auto;
            transition: opacity .2s .2s;
        }
        .set-up-done-title {
            color: black;
        }
        .set-up-done {
            max-width: 500px;
            max-height: calc(100% - 310px);
            overflow: auto;
            p {
                text-align: left;
                color: rgba(0, 0, 0, .8);
                &:last-child {
                    margin-bottom: 0;
                }
            }
            &.small {
                p {
                    font-size: 14px;
                }
            }
        }
    }
}
.privacy-policy-dialog-text {
    padding: 10px 24px 0!important;
}
.global-search-input {
    position: absolute;
    top: 8px;
    right: 12px;
    opacity: 0;
    width: 52px;
    z-index: 5;
    pointer-events: none;
    transition: all .2s;
    .v-input__slot {
        border-radius: 6px;
    }
    &.open {
        opacity: 1;
        width: 600px;
        pointer-events: auto;
    }
}
#search-result {
    position: absolute;
    top: 64px;
    right: 12px;
    opacity: 0;
    width: 52px;
    z-index: 5;
    background-color: #F8F8F8;
    max-height: ~"min(700px, calc(100vh - 100px))";
    overflow: hidden;
    border-radius: 6px;
    pointer-events: none;
    transition: all .2s;
    & > div {
        width: 600px;
        padding: 10px 15px 7px 15px;
        max-height: ~"min(700px, calc(100vh - 200px))";
        overflow: auto;
    }
    &.open {
        opacity: 1;
        width: 600px;
        pointer-events: auto;
    }
}
.update-title {
    font-size: 1rem;
}
.v-application--is-ltr .v-toolbar__content > .v-btn.v-btn--icon:first-child + .v-toolbar__title {
    padding-left: 12px!important;
}
.v-slider__thumb:after {
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    content: '';
    color: inherit;
    width: 300%;
    height: 300%;
    border-radius: 50%;
    background: transparent;
    position: absolute;
    left: -100%;
    top: -100%;
}
code, kbd, pre, samp {
    font-family: 'Roboto Mono', Consolas, "Liberation Mono", Courier, "Courier New", Monaco, "Courier New SC", "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", monospace;
}
@media (max-width: 960px) {
    .global-search-input {
        top: 4px;
    }
    #search-result {
        top: 58px;
    }
}
@media (max-width: 624px) {
    .global-search-input, #search-result {
        &.open {
            width: calc(100% - 24px);
        }
    }
    #search-result > div {
        width: calc(100vw - 24px);
    }
}
#app.theme--dark {
    color-scheme: dark;
    .v-picker__title.primary {
        color: #424242;
        .v-time-picker-title {
            color: #424242;
        }
    }
    .welcome-dialog {
        background-color: #1E1E1E;
    }
    .welcome-dialog .welcome-dialog-card .main-btn {
        color: black;
    }
    .v-picker__body .v-btn--active, .v-slider__thumb-label, .v-time-picker-clock__item--active {
        color: #424242;
    }
    .v-btn.primary {
        color: #272727;
        .v-btn__content .v-icon {
            color: #272727;
        }
    }
    .theme--dark.v-icon {
        color: rgba(255, 255, 255, 0.7);
    }
    .v-stepper__step__step {
        color: #1E1E1E;
        .v-icon {
            color: #1E1E1E;
        }
    }
    .v-calendar-weekly {
        border-color: #575757;
        .v-calendar-weekly__day, .v-calendar-weekly__head-weekday {
            border-color: #575757;
        }
    }
    .v-calendar-daily {
        border-color: #575757;
        .v-calendar-daily__day, .v-calendar-daily__intervals-body, .v-calendar-daily__day-interval, .v-calendar-daily_head-day {
            border-color: #575757;
        }
        .v-calendar-daily__intervals-head {
            border-color: #575757;
            &::after {
                background: #575757;
                background: linear-gradient(90deg, rgba(87, 87, 87, 0), rgb(87, 87, 87));
            }
        }
        .v-calendar-daily__interval {
            &::after {
                border-color: #575757;
            }
        }
    }
    .v-navigation-drawer__content .primary--text .v-icon {
        color: #D099E0;
    }
    .v-data-table > .v-data-table__wrapper > table > tbody > tr:hover:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
        background: #333333;
    }
    #search-result {
        background-color: #1E1E1E;
    }
    .v-autocomplete__content.v-menu__content {
        box-shadow: 0px 5px 5px -3px rgba(0, 0, 0, .2), 0px 8px 10px 1px rgba(0, 0, 0, .14), 0px 3px 14px 2px rgba(0, 0, 0, .12);
    }
    .welcome-dialog .welcome-dialog-card .v-card__text .set-up-done p {
        color: rgba(255, 255, 255, .8);
    }
    .daynight {
        .layout-lock {
            .lock-head {
                border: 2px solid #BCBCBC;
                border-bottom: none;
            }
            .lock-body {
                border: 2px solid #BCBCBC;
                &::before {
                    background-color: #BCBCBC;
                }
                &::after {
                    background-color: #BCBCBC;
                }
            }
        }
        .check-in-bell {
            &::after {
                background-color: #BCBCBC;
                top: 1px;
                left: 1px;
                width: 116%;
                height: 2px;
                transform: rotate(45deg) scaleX(0);
            }
            &.off {
                &::after, &::before {
                    transform: rotate(45deg) scaleX(1);
                }
            }
        }
    }
}
</style>

<i18n>
{
    "en": {
        "title": "UoM Assistant",
        "dark_mode": "Switch to dark mode",
        "light_mode": "Switch to light mode",
        "front_end_update_ready": "New version of the frontend is now available",
        "front_end_update": "Update",
        "front_end_ignore": "Ignore",
        "updating": "Updating…",
        "dashboard": "Dashboard",
        "settings": "Settings",
        "about": "About",
        "not found": "UoM Assistant",
        "unknown": "Unknown",
        "error_at": "{0} at {1}",
        "backend_reconnect": "Backend is up",
        "backend_reconnect_body": "We have just reconnected to the backend",
        "search": "Search…",
        "welcome": "Hi there!",
        "not_yet": "Seems like you haven't set up your UoM Assistant yet",
        "press_to_settings": "Press \"Continue\" to set up your own dashboard",
        "continue": "Continue",
        "next": "Next",
        "import": "Import",
        "skip": "Skip",
        "value_privacy": "We value your privacy",
        "privacy_policy": "We understand how important your UoM account is to you. All your private data will be stored locally in your browser and will not be shared with any third party without your consent.",
        "read_privacy_policy": "Check out our {0}.",
        "privacy_policy_link": "privacy policy",
        "student_lead": "A student-led project",
        "not_offical": "UoM Assistant is not a product developed or published by the University of Manchester. ",
        "lead_by": "This project was designed and developed by a team of UoM students and is not an official representation of UoM.",
        "got_it": "Got it",
        "connect_to": "Connection",
        "backend_url": "Backend URL",
        "backend_maintenance": "The backend is under maintenance or backend version not supported",
        "wrong_url": "Cannot connect to this URL",
        "backend_token": "Token",
        "need_token": "You need a valid token to access this backend",
        "wrong_token": "This token is invalid",
        "message_from_backend": "Message from the backend",
        "ok": "OK",
        "account_settings": "Account Settings",
        "done": "Done",
        "account_notice_title": "UoM account not set",
        "account_notice_body": "You have not set up your UoM account information, which will result in the grade summary, attendance and inbox widget being unavailable. Continue anyway?",
        "cancel": "Cancel",
        "setup_done": "<p>Congratulations! Your UoM Assistant dashboard is now ready to use.</p><p>Now you can find a note in the \"Quick Notes\" widget called <em>UoM Assistant Quick Tour</em>. This note provides a brief introduction to the features that UoM Assistant provides and you can use it to quickly familiarise yourself with the use of UoM Assistant.</p><p>Thanks to the volunteers in the UoM Assistant community, you can now use the \"Course Info Importer\" plug-in in the \"Plug-ins\" widget to look for and import course data with few clicks for your year without filling in the course data manually.</p><p>For more information about UoM Assistant, please visit our <a href=\"https://github.com/uom-assistant/uom-assistant\" target=\"_blank\" rel=\"noopener nofollow\">GitHub Repo</a>.",
        "network_error": "Cannot verify your UoM account information due to network error. Please try again later.",
        "backend_error": "Cannot verify your UoM account information due to backend error. Please try again later.",
        "backend_maintenance": "Since the backend is under maintenance, we cannot verify your UoM account information. Please try again later.",
        "token_required": "Cannot verify your UoM account information due to backend token change. Please try again later.",
        "login_error": "Cannot verify your UoM account information. Please check the username and the password and try again.",
        "login_error_title": "Failed to verify",
        "privacy_policy_text": "<p><strong>We cannot guarantee the security of your personal information if you use an unofficial UoM Assistant instance. Third-party UoM Assistant instances may have their own privacy policy that you could read yourself.</strong></p><p>All your data used by UoM Assistant will be stored locally on your device. UoM Assistant will send your University of Manchester login details to the corresponding UoM Assistant backend to retrieve data such as your grades and attendance when necessary. The UoM Assistant backend will not retain your personal information or share them with any third party, including, but not limited to, your university email address, username, password, login cookie and token.</p><p>We cannot guarantee how your information will be handled by third parties, therefore, please be mindful when using third-party services and plug-ins. We will not share your personal information with any third party without your consent.</p><p>UoM Assistant does not track your use of UoM Assistant in any way.</p><p>Please note that we are not liable for any loss or corruption of data, so it is advised to backup important information such as notes and tasks. Clearing site data will remove all stored data of the website, including information such as your username and password, and bring UoM Assistant back to its original state. You can also clear all the data stored by UoM Assistant in your browser from the settings page of UoM Assistant.</p>",
        "lock_layout": "Lock Layout",
        "unlock_layout": "Unlock Layout",
        "clock": "Clock",
        "bblinks": "Quick Links",
        "livelinks": "Online Session Links",
        "subjects": "Manage Course Units",
        "attendance": "Attendance",
        "calendar": "Calendar",
        "task": "Task",
        "note": "Quick Notes",
        "mail": "Inbox",
        "grade": "Grade Summary",
        "plugins": "Plug-ins",
        "new_course_sound": "Check-in Bell"
    },
    "zh": {
        "title": "曼大助手",
        "dark_mode": "切换到暗色模式",
        "light_mode": "切换到亮色模式",
        "front_end_update_ready": "新版本的前端已经可用",
        "front_end_update": "更新",
        "front_end_ignore": "忽略",
        "updating": "正在更新…",
        "dashboard": "仪表板",
        "settings": "设置",
        "about": "关于",
        "not found": "曼大助手",
        "unknown": "未知",
        "error_at": "{0} 于 {1}",
        "backend_reconnect": "后端已恢复",
        "backend_reconnect_body": "已经成功连接到后端",
        "search": "搜索…",
        "welcome": "欢迎！",
        "not_yet": "看起来你还没有配置你的曼大助手",
        "press_to_settings": "点按“开始设置”来配置你的个人仪表板",
        "continue": "开始设置",
        "next": "下一步",
        "import": "导入",
        "skip": "跳过",
        "value_privacy": "我们尊重你的隐私",
        "privacy_policy": "我们深知你的曼大账号对你的重要性。你的所有私密数据均会被保存于浏览器本地，且在你授权之前曼大助手不会将你的私密数据分享给第三方。",
        "read_privacy_policy": "阅读我们的{0}。",
        "privacy_policy_link": "隐私声明",
        "student_lead": "由学生主导的项目",
        "not_offical": "曼大助手不是一个由曼彻斯特大学开发、发布的产品。",
        "lead_by": "此项目由一个曼大学生组成的团队设计、开发，不代表曼彻斯特大学官方。",
        "got_it": "明白了",
        "connect_to": "连接信息",
        "backend_url": "后端 URL",
        "backend_maintenance": "不支持的后端版本或后端正在维护，暂时无法连接",
        "wrong_url": "无法连接到这个地址",
        "backend_token": "令牌",
        "need_token": "访问这个后端需要正确的令牌",
        "wrong_token": "此令牌无效",
        "message_from_backend": "来自后端的消息",
        "ok": "好",
        "account_settings": "账户设置",
        "done": "完成",
        "account_notice_title": "未设置账户信息",
        "account_notice_body": "你没有设置曼大账户信息，这将会导致成绩概览、出勤统计及邮箱组件不可用。确定要继续吗？",
        "cancel": "取消",
        "setup_done": "<p>恭喜！你的曼大助手仪表板已经设置完毕，可以使用了。</p><p>现在你可以在“快速笔记”组件中找到名为《曼大助手漫游指南》的笔记。这篇笔记简单介绍了曼大助手的各项功能，你可以通过这篇笔记快速熟悉曼大助手的使用。</p><p>多亏了曼大助手社区志愿者的帮助，你现在可以通过“插件”组件中的 \"Course Info Importer\" 插件尝试寻找并快速导入对应年级的课程数据而无需手动填写课程数据。</p><p>要了解更多有关曼大助手的信息，欢迎访问我们的 <a href=\"https://github.com/uom-assistant/uom-assistant\" target=\"_blank\" rel=\"noopener nofollow\">GitHub</a>。",
        "network_error": "网络错误，无法验证你的曼大账户信息，请稍后重试。",
        "backend_error": "后端错误，无法验证你的曼大账户信息，请稍后重试。",
        "backend_maintenance": "后端正在维护，无法验证你的曼大账户信息，请稍后重试。",
        "token_required": "后端令牌已更改，请稍后重试",
        "login_error": "无法验证你的曼大账户信息，请检查用户名与密码并重试。",
        "login_error_title": "验证失败",
        "privacy_policy_text": "<p><strong>如果你使用非官方的曼大助手实例，我们无法保证你的个人信息安全。你可能需要自行了解第三方的曼大助手实例的隐私政策。</strong></p><p>曼大助手使用的所有信息将被存储在你的浏览器本地。曼大助手会在需要时将你的曼大登录信息发送到相应的曼大助手后端，以便获取你的成绩和出勤情况等数据并汇总展示在界面中。曼大助手后端不会保留任何你的个人信息，包括但不限于你的曼大邮箱地址、用户名、密码、登录 Cookie 和 Token 等，也不会与任何第三方分享这些信息。</p><p>我们不能保证第三方将如何处理你的信息，因此请小心使用第三方服务和插件。未经你的同意，我们不会与任何第三方分享你的个人信息。</p><p>曼大助手不会以任何方式跟踪你使用曼大助手的情况。</p><p>请注意，我们不对任何数据的丢失或损坏负责，因此强烈建议你备份笔记、任务等重要信息。清除网站数据将删除网站的所有存储数据，包括你的用户名和密码等信息，并完全重置曼大助手。你也可以在曼大助手的设置页清除曼大助手保存在浏览器中的所有信息。</p>",
        "lock_layout": "锁定布局",
        "unlock_layout": "解锁布局",
        "clock": "时钟",
        "bblinks": "快速链接",
        "livelinks": "在线课程链接",
        "subjects": "科目管理",
        "attendance": "出勤统计",
        "calendar": "日历",
        "task": "任务",
        "note": "快速笔记",
        "mail": "收件箱",
        "grade": "成绩概览",
        "plugins": "插件",
        "new_course_sound": "签到铃"
    },
    "es": {
        "title": "UoM Assistant",
        "dark_mode": "Cambiar a modo oscuro",
        "light_mode": "Cambiar a modo claro",
        "front_end_update_ready": "Nuava versión de front-end disponible",
        "front_end_update": "Actualizar",
        "front_end_ignore": "Ignorar",
        "updating": "Actualizando…",
        "dashboard": "Tablero",
        "settings": "Ajustes",
        "about": "Sobre",
        "not found": "UoM Assistant",
        "unknown": "Desconocido",
        "error_at": "{0} en {1}",
        "backend_reconnect": "Back-end reconectado",
        "backend_reconnect_body": "Conectada a back-end correctamente",
        "search": "Buscar…",
        "welcome": "Bienvenido!",
        "not_yet": "Parace ser que todavía no ha ajustado su UoM Assistant",
        "press_to_settings": "Haga clic en \"CONTINUAR\" para ajustar su propio tablero",
        "continue": "Continuar",
        "next": "Siguiente",
        "import": "Importar",
        "skip": "Saltar",
        "value_privacy": "Valoramos su privacidad",
        "privacy_policy": "Entendemos lo importante que es para usted su cuenta de UoM. Todos sus datos privados se almacenarán localmente en su navegador y no se compartirán con terceros hasta que usted lo autorice.",
        "read_privacy_policy": "Vea nustra {0}",
        "privacy_policy_link": "política de privacidad",
        "student_lead": "Un proyecto dirigido por estudiantes",
        "not_offical": "UoM Assistant no es un producto desarrollado ni publicado por la Universidad de Manchester. ",
        "lead_by": "Este proyecto está diseñado y desarrollado por un equipo de estudiantes de la UoM y no es una representación oficial de la UoM",
        "got_it": "Entendido",
        "connect_to": "Conexión",
        "backend_url": "Back-end URL",
        "backend_maintenance": "Versión de back-end no compatible o back-end en mantenimiento",
        "wrong_url": "No ha sido posible conectarse a este URL",
        "backend_token": "Token",
        "need_token": "Para acceder este back-end necesita un token válido",
        "wrong_token": "Token invalido",
        "message_from_backend": "Mensaje desde back-end",
        "ok": "OK",
        "account_settings": "Ajustes de la cuenta",
        "done": "",
        "account_notice_title": "",
        "account_notice_body": "",
        "cancel": "",
        "setup_done": "",
        "network_error": "",
        "backend_error": "",
        "backend_maintenance": "",
        "token_required": "",
        "login_error": "",
        "login_error_title": "",
        "privacy_policy_text": "",
        "lock_layout": "Lock Layout",
        "unlock_layout": "Unlock Layout",
        "clock": "Reloj",
        "bblinks": "Enlaces rápidos",
        "livelinks": "Enlaces de sesiones online",
        "subjects": "Asignaturas",
        "attendance": "Asistencia",
        "calendar": "Calendario",
        "task": "Tarea",
        "note": "Apuntes rápidos",
        "mail": "Correos",
        "grade": "Resumen de notas ",
        "plugins": "Complementos",
        "new_course_sound": "Campana de clase"
    },
    "ja": {
        "title": "UoMアシスタント",
        "dark_mode": "ダークモードに変更する",
        "light_mode": "ライトモードに変更する",
        "front_end_update_ready": "新バージョンのフロントエンドが利用可能です",
        "front_end_update": "アップデート",
        "front_end_ignore": "無視する",
        "updating": "アップデート中…",
        "dashboard": "ダッシュボード",
        "settings": "設定",
        "about": "バージョン情報",
        "unknown": "不明",
        "error_at": "{1} に {0} 発生",
        "backend_reconnect": "バックエンドは今正常に戻りました",
        "backend_reconnect_body": "バックエンドへの接続に成功しました",
        "search": "検索…",
        "welcome": "ようこそ！",
        "not_yet": "まだUoMアシスタントを設定されないようです..",
        "press_to_settings": "『セットアップ』をクリックして、あなたのダッシュボードを設定してください。",
        "continue": "セットアップ",
        "next": "次のステップ",
        "import": "インポート",
        "skip": "スキップ",
        "value_privacy": "貴方のプライバシーを尊重しています",
        "privacy_policy": "あなたにとって大学アカウントは重要なものことは、私たちはよく分かっています。全ての個人情報はブラウザーのローカルに保存します、それにあなたの授権を取得されない限り、UoMアシスタントは個人情報を第三者に送信しません。",
        "read_privacy_policy": "私たちの{0}を読んでください。",
        "privacy_policy_link": "プライバシーポリシー",
        "student_lead": "学生主導のプロジェクト",
        "not_offical": "UoMアシスタントはマンチェスター大学が開発·配布されたアプリケーションではない。",
        "lead_by": "このプロジェクトはマンチェスター大学の学生で構成されたチームによって設計·開発された、マンチェスター大学の公式を意味するものではない。",
        "got_it": "了解した",
        "connect_to": "バックエンドに接続する",
        "backend_url": "バックエンドのURL",
        "backend_maintenance": "サポートされないバックエンドバージョンか、バックエンドはまだメンテナンスています可能性がありますので、今は接続できません。",
        "wrong_url": "このURLに接続できません",
        "backend_token": "トークン",
        "need_token": "このバックエンドをアクセスために正しいトークンが必要です。",
        "wrong_token": "このトークンが無効です",
        "message_from_backend": "バックエンドからのメッセージ",
        "ok": "はい",
        "account_settings": "アカウント設定",
        "clock": "時計",
        "bblinks": "クイックリンク",
        "livelinks": "オンライン授業リンク",
        "done": "",
        "account_notice_title": "",
        "account_notice_body": "",
        "cancel": "",
        "setup_done": "",
        "network_error": "",
        "backend_error": "",
        "backend_maintenance": "",
        "token_required": "",
        "login_error": "",
        "login_error_title": "",
        "privacy_policy_text": "",
        "lock_layout": "",
        "unlock_layout": "",
        "subjects": "科目管理",
        "attendance": "出勤統計",
        "calendar": "カレンダー",
        "task": "タスク",
        "note": "クイックノート",
        "mail": "受信トレイ",
        "grade": "成績概要",
        "plugins": "プラグイン",
        "new_course_sound": ""
    }
}
</i18n>

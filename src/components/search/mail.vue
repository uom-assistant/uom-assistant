<template>
    <v-card
        class="mx-auto mail-search-container pl-0 pr-0 mb-2"
        outlined
    >
        <v-list flat class="list">
            <v-list-item v-for="(mail, index) in mailsCopy" :key="mail.id" @click.stop="openMail(mail.id)" :class="{ flaged: mail.flagged, unseen: mail.unseen }">
                <v-list-item-avatar :color="(mail.flagged || mail.unseen) ? 'uomthemelight' : ($vuetify.theme.dark ? 'grey darken-1' : 'grey lighten-2')" v-if="mail.course === false" :class="{ 'black--text': ((mail.flagged || mail.unseen) && $vuetify.theme.dark) }">
                    <span v-if="mail.avatar === false">{{ getTwoLetterSenderName(mail.from ? mail.from : mail.fromAddress) }}</span>
                    <v-img v-else :src="require(`@/assets/img/mail-avatars/${mail.avatar}`)"></v-img>
                </v-list-item-avatar>

                <v-list-item-avatar :color="subjectColor(mail.course)" v-else>
                    <v-icon color="white" v-if="mail.avatar === false">mdi-book-outline</v-icon><v-img v-else :src="require(`@/assets/img/mail-avatars/${mail.avatar}`)"></v-img>
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title :class="{ 'primary--text': mail.unseen }"><span v-if="mail.subject" :title="mail.subject">{{ mail.subject }}</span><em v-else>{{ $t('no_subject') }}</em></v-list-item-title>
                    <v-list-item-subtitle>
                        <span class="d-block text-truncate from">
                            <v-icon
                                small
                                class="person-icon mr-1"
                            >
                                mdi-account-arrow-right
                            </v-icon>
                            <span :title="mail.fromAddress">{{ mail.from ? getShortSenderName(mail.from) : mail.fromAddress }}</span>
                        </span>
                        <v-icon
                            small
                            class="time-icon mr-1"
                        >
                            mdi-clock-outline
                        </v-icon>
                        <span :title="getDate(new Date(mail.date * 1000))" :key="timeUpdate(mail.date * 1000) ? `${keyMin}-${index}` : `mail-key-${index}`">{{ displayDate(new Date(mail.date * 1000)) }}</span>
                        <v-icon
                            small
                            color="primary"
                            class="time-icon ml-2"
                            :title="$t('flagged')"
                            v-if="mail.flagged"
                        >
                            mdi-flag
                        </v-icon>
                        <span v-if="mail.course !== false" class="ml-3">
                            <span :class="subjectColor(mail.course)" class="subject-color-samll"></span>
                            {{ mail.courseName[0] }}
                        </span>
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';

import formatDateTime from '@/tools/formatDateTime';

export default {
    name: 'mailSearch',
    props: {
        mails: Array,
    },
    data() {
        return {
            mailsCopy: [],
            init: false,
            keyMin: '',
            refreshLoding: false,
        };
    },
    methods: {
        /**
         * Open viewer layer and show the mail by ID
         * @param {number} id mail ID
         */
        openMail(id) {
            const mail = this.mails.find((item) => item.id === id);
            if (!mail) {
                // Mail not found
                return;
            }
            this.$store.commit('setSearchNotification', {
                target: 'mail',
                payload: {
                    action: 'openMail',
                    data: id,
                },
            });
            this.$parent.$parent.searchOpened = false;
        },
        /**
         * Check if a mail is unseen
         * @param {number} id mail ID
         * @returns {boolean} if the given mail is unseen
         */
        isUnseen(id) {
            const mail = this.mails.find((item) => item.id === id);
            if (!mail) {
                return false;
            }
            return mail.unseen;
        },
        /**
         * Check if a mail is flagged
         * @param {number} id mail ID
         * @returns {boolean} if the given mail is flagged
         */
        isFlagged(id) {
            const mail = this.mails.find((item) => item.id === id);
            if (!mail) {
                return false;
            }
            return mail.flagged;
        },
        /**
         * Check if the time label needs to update
         * @param {number} date date timestamp
         * @returns {boolean} if the time label needs to update
         */
        timeUpdate(date) {
            return !(new Date().valueOf() - date >= 864000000);
        },
        /**
         * Get short name from an UoM account name
         * @param {string} name mail from name
         * @returns {string} short name
         */
        getShortSenderName(name) {
            const nameSplit = name.split(' - ').filter((val) => val !== '');
            if (nameSplit.length === 2 && /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-z])+\.)*manchester\.ac\.uk$/i.test(nameSplit[1])) {
                return nameSplit[0];
            }
            return name;
        },
        /**
         * Get two-letter name for mail avatar by mail from name
         * @param {string} name mail from name
         * @returns {string} two-letter name
         */
        getTwoLetterSenderName(name) {
            // If it's an UoM address
            const nameSplit = name.split(' - ').filter((val) => val !== '');
            if (nameSplit.length === 2 && /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-z])+\.)*manchester\.ac\.uk$/i.test(nameSplit[1])) {
                const realNameSplit = nameSplit[0].split(' ').filter((val) => val !== '');
                if (realNameSplit.length >= 2) {
                    return `${realNameSplit[0][0]}${realNameSplit[realNameSplit.length - 1][0]}`.toUpperCase();
                }
                return `${nameSplit[0][0]}${nameSplit[1].split('@')[1][0]}`.toUpperCase();
            }

            // If it's an email address
            if (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(name)) {
                const realNameSplit = name.split('@')[0].split(/-|\.| /).filter((val) => val !== '');
                if (realNameSplit.length >= 2) {
                    return `${realNameSplit[0][0]}${realNameSplit[realNameSplit.length - 1][0]}`.toUpperCase();
                }
                return `${name[0]}${name.split('@')[1][0]}`.toUpperCase();
            }

            // If it's a normal name
            const nameSplited = name.split(' ').filter((val) => val !== '');
            if (nameSplited.length >= 2) {
                return `${nameSplited[0][0]}${nameSplited[nameSplited.length - 1][0]}`.toUpperCase();
            }
            return `${name[0]}${name[1]}`.toUpperCase();
        },
        /**
         * Map from subject ID to subject color
         * @param {string|boolean} subject subject ID or false
         * @returns {string} subject color name or ''
         */
        subjectColor(subject) {
            if (!this.subjects) {
                return '';
            }
            for (const item of this.subjects) {
                if (item.id === subject) {
                    if (item.color) {
                        return item.color;
                    }
                }
            }
            return '';
        },
        /**
         * Calculate the time of a mail and format it as a string
         * @param {number} date time of the mail
         * @returns {string} formatted string
         */
        displayDate(date) {
            const now = new Date().valueOf();
            const mail = date.valueOf();

            // More than 10 days
            if (now - mail >= 864000000) {
                return this.getDate(date);
            }
            // More than 1 week
            if (now - mail >= 604800000) {
                return window.uomaTimeFormatters.relative.format(-1, 'week');
            }
            // More than 1 day
            if (now - mail >= 86400000) {
                const day = Math.floor((now - mail) / 86400000);
                return window.uomaTimeFormatters.relative.format(0 - day, 'day');
            }
            // More than 1 hour
            if (now - mail < 86400000 && now - mail > 3600000) {
                const hour = Math.round((now - mail) / 3600000);
                return window.uomaTimeFormatters.relative.format(0 - hour, 'hour');
            }
            // Less than 1 hour
            if (now - mail < 3600000 && now - mail > 120000) {
                const mins = Math.round((now - mail) / 60000);
                return window.uomaTimeFormatters.relative.format(0 - mins, 'minute');
            }
            // Less than 2 mins
            if (now - mail < 120000 && now - mail > 0) {
                return this.$t('just_now');
            }
            return this.getDate(date);
        },
        /**
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @returns {string} formatted a date string
         */
        getDate(dateObj) {
            return formatDateTime(dateObj, this.locale, window.uomaTimeFormatters, false);
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        timerMin() {
            this.keyMin = `key-min-${new Date().valueOf()}`;
        },
        mails() {
            this.mailsCopy = this.mails;
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            subjects: (state) => state.subjects,
            timerMin: (state) => state.timerMin,
            searchNotification: (state) => state.searchNotification,
        }),
        mailUnseen() {
            // Filter out unread mails
            return this.mails.filter((item) => item.unseen);
        },
    },
    async mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';
        this.mailsCopy = this.mails;
    },
};
</script>

<style lang="less">
.mail-search-container {
    overflow: hidden;
    border-radius: 6px!important;
    contain: layout paint;
    .list {
        padding: 8px 0;
        .v-list-item__action {
            margin: 0px 16px 0 0;
        }
        .v-list-item__icon {
            margin: 15px 16px 0 0;
        }
        .v-list-item {
            transition: background-color .2s;
            min-height: 30px;
            &:hover, &:focus {
                background-color: rgba(0, 0, 0, .04);
            }
            &.flaged, &.unseen {
                background-color: fade(#660099, 12%);
                &:hover, &:focus {
                    background-color: fade(#660099, 20%);
                }
            }
            &.unseen {
                border-left: 4px solid #660099;
                padding-left: 12px;
                .v-list-item__title {
                    font-weight: bold;
                }
            }
        }
        .v-list-item__content {
            padding: 10px 0;
            .from {
                margin-bottom: 3px;
            }
        }
        .time-icon {
            vertical-align: text-top;
        }
        .person-icon {
            vertical-align: text-top;
        }
        .subject-color-samll {
            width: 10px;
            height: 10px;
            display: inline-block;
            border-radius: 50%;
            margin: 0;
            margin-right: 3px;
        }
    }
}
#app.theme--dark .mail-search-container {
    background-color: #272727;
    .list {
        background-color: transparent!important;
        .v-list-item {
            &:hover, &:focus {
                background-color: rgba(255, 255, 255, .04);
            }
            &.flaged, &.unseen {
                background-color: fade(#D099E0, 12%);
                &:hover, &:focus {
                    background-color: fade(#D099E0, 20%);
                }
            }
            &.unseen {
                border-left: 4px solid #D099E0;
            }
        }
    }
}
#app.theme--dark .mail-course-card {
    .v-toolbar {
        background-color: #1E1E1E!important;
    }
    .list {
        background-color: #2c2c2c;
    }
}
</style>

<i18n>
{
    "en": {
        "no_subject": "No Subject",
        "just_now": "Just now",
        "flagged": "Flagged"
    },
    "zh": {
        "no_subject": "无主题",
        "just_now": "刚刚",
        "flagged": "已旗标"
    },
    "es": {
        "no_subject": "No asignaturas",
        "just_now": "Ahora mismo",
        "flagged": "Marcado",
        "flag": "Marcar"
    },
    "ja": {
        "no_subject": "件名無し",
        "just_now": "たった今",
        "flagged": "フラグを付済み"
    }
}
</i18n>

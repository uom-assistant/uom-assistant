<template>
    <v-card
        class="mx-auto coursework-search-container mb-2"
        outlined
    >
        <v-list flat class="list" :key="updateListKey">
            <v-list-item-group
                v-model="ifCourseworks"
                multiple
                active-class="done"
            >
                <v-list-item v-for="(coursework, index) in courseworks" :key="index">
                    <template v-slot:default="{ active }">
                        <v-list-item-action>
                            <v-checkbox :input-value="active"></v-checkbox>
                        </v-list-item-action>

                        <v-list-item-content>
                            <v-list-item-title><span v-if="coursework.deadline !== false && displayRemain(coursework.deadline, index) !== ''" class="d-inline-block time-remain" :class="checkExpired(coursework.deadline, index)"><v-icon :class="checkUrgent(coursework.deadline, index)" class="mr-1 urgent-icon" dense>mdi-clock-alert-outline</v-icon>{{ displayRemain(coursework.deadline, index) }}</span>{{ coursework.title }}</v-list-item-title>
                            <v-list-item-subtitle v-if="coursework.deadline !== false || coursework.subject !== false">
                                <span v-if="coursework.deadline !== false" class="mr-2">
                                    <v-icon
                                        v-if="coursework.deadline !== false"
                                        small
                                    >
                                        mdi-clock-outline
                                    </v-icon>
                                    {{ getDate(new Date(coursework.deadline)) }}
                                </span>
                                <span v-if="coursework.subject !== false">
                                    <span :class="subjectColor(coursework.subject)" class="subject-color-samll" v-if="coursework.subject !== false"></span>
                                    {{ subjectNameMap(coursework.subject) }}
                                </span>
                            </v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action class="delete">
                            <v-btn icon @click.stop="removeCoursework(coursework.rawIndex)">
                                <v-icon color="grey">mdi-delete-outline</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </template>
                </v-list-item>
            </v-list-item-group>
        </v-list>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import { vsprintf } from 'sprintf-js';
import formatDateTime from '@/tools/formatDateTime';

export default {
    name: 'courseworkSearch',
    props: {
        courseworks: Array,
    },
    data() {
        return {
            ifCourseworks: [],
            updateListKey: '',
            skipSyncBack: false,
        };
    },
    methods: {
        /**
         * Remove a coursework from the list by index in widget
         * @param {number} index coursework index
         */
        removeCoursework(index) {
            this.$store.commit('setSearchNotification', {
                target: 'coursework',
                payload: { action: 'delete', index },
            });
        },
        /**
         * Map from subject ID to subject color
         * @param {string} subject subject ID
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
         * Map from subject ID to subject short name
         * @param {string} subject subject ID
         * @returns {string} subject short name or raw ID (if none matched)
         */
        subjectNameMap(subject) {
            if (!this.subjects) {
                return subject;
            }
            for (const item of this.subjects) {
                if (item.id === subject) {
                    return item.shortName;
                }
            }
            return subject;
        },
        /**
         * Calculate the remaining time of a coursework and format it as a string
         * @param {number} deadline deadline
         * @param {number} index coursework index of the list
         * @returns {string} formatted string or ''
         */
        displayRemain(deadline, index) {
            if (this.ifCourseworks.includes(index)) {
                return '';
            }

            const now = new Date().valueOf();
            const ddl = deadline;

            // More than 1 day
            if (ddl - now >= 86400000) {
                const day = Math.floor((ddl - now) / 86400000);
                return vsprintf(day === 1 ? this.$t('remain_day') : this.$t('remain_day_plural'), [day]);
            }
            // More than 1 hour
            if (ddl - now < 86400000 && ddl - now > 3600000) {
                const hour = Math.round((ddl - now) / 3600000);
                return vsprintf(hour === 1 ? this.$t('remain_hour') : this.$t('remain_hour_plural'), [hour]);
            }
            // Less than 1 hour
            if (ddl - now < 3600000 && ddl - now > 0) {
                const mins = Math.round((ddl - now) / 60000);
                return vsprintf(mins === 1 ? this.$t('remain_min') : this.$t('remain_min_plural'), [mins]);
            }
            // Expired
            if (ddl - now < 0) {
                return this.$t('expired');
            }
            return '';
        },
        /**
         * Check if the coursework is urgent and return color classes
         * @param {number} deadline deadline
         * @param {number} index coursework index of the list
         * @returns {string} color classes or ''
         */
        checkUrgent(deadline, index) {
            if (this.ifCourseworks.includes(index)) {
                return 'd-none';
            }

            const now = new Date().valueOf();
            const ddl = deadline;

            // More than 1 day
            if (ddl - now >= 86400000) {
                return 'd-none';
            }
            // More than 1 hour
            if (ddl - now < 86400000 && ddl - now > 3600000) {
                return 'orange--text';
            }
            // Less than 1 hour
            if (ddl - now < 3600000) {
                return 'red--text text-darken-3';
            }
            // Coursework done
            return 'd-none';
        },
        /**
         * Check if the coursework is expired and return the classes for text
         * @param {number} deadline deadline
         * @param {number} index coursework index of the list
         * @returns {string} color classes or ''
         */
        checkExpired(deadline, index) {
            if (this.ifCourseworks.includes(index)) {
                return 'text--secondary';
            }

            const now = new Date().valueOf();
            if (deadline - now < 0) {
                return 'red--text text-darken-3';
            }
            return 'text--secondary';
        },
        /**
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @returns {string} formatted a date string
         */
        getDate(dateObj) {
            return formatDateTime(dateObj, this.locale, false);
        },
        /**
         * Update `ifTodos` based on prop
         */
        updateDone() {
            this.skipSyncBack = true;
            this.ifCourseworks = [];
            if (this.courseworks) {
                for (let i = 0; i < this.courseworks.length; i += 1) {
                    if (this.courseworks[i].done) {
                        this.ifCourseworks.push(i);
                    }
                }
            }
            this.$nextTick(() => {
                this.skipSyncBack = false;
            });
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        courseworks() {
            this.updateDone();
        },
        ifCourseworks() {
            // Sync states back to widget
            if (!this.skipSyncBack) {
                if (this.courseworks) {
                    const payload = [];
                    for (let i = 0; i < this.courseworks.length; i += 1) {
                        payload.push({
                            rawIndex: this.courseworks[i].rawIndex,
                            done: this.ifCourseworks.includes(i),
                        });
                    }
                    this.$store.commit('setSearchNotification', {
                        target: 'coursework',
                        payload: { action: 'syncDone', payload },
                    });
                }
            }
        },
        timerMin() {
            this.updateListKey = this.timerMin;
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            subjects: (state) => state.subjects,
            timerMin: (state) => state.timerMin,
        }),
        allSubjects() {
            if (!this.subjects) {
                return [];
            }
            return this.subjects.filter((subject) => !subject.hide);
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        this.updateDone();
    },
};
</script>

<style lang="less">
.coursework-search-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
    border-radius: 6px!important;
    contain: layout paint;
    .list {
        background-color: transparent;
        .v-list-item__action {
            margin: 6px 16px 6px 0;
        }
        .delete {
            margin-right: 0;
            margin-left: 8px;
            opacity: 0;
            transition: .2s;
        }
        .v-list-item {
            background-color: transparent;
            transition: background-color .2s;
            &:hover, &:focus {
                background-color: rgba(0, 0, 0, .04);
                .delete {
                    opacity: 1;
                }
            }
        }
        .time-remain {
            margin-right: 6px;
        }
        .urgent-icon {
            vertical-align: text-top;
            margin-top: -1px;
        }
        .v-list-item__subtitle {
            & > span.mr-2 > i {
                vertical-align: text-top;
            }
            .subject-color-samll {
                width: 10px;
                height: 10px;
                display: inline-block;
                border-radius: 50%;
                margin: 0;
            }
        }
        .v-list-item__content {
            padding: 8px 0;
        }
    }
    .done {
        color: rgba(0, 0, 0, .4);
        .v-list-item__title {
            text-decoration: line-through;
        }
    }
}
#app.theme--dark .coursework-search-container {
    background-color: #272727;
    .v-list-item {
        &:hover, &:focus {
            background-color: rgba(255, 255, 255, .04);
        }
    }
    .done {
        color: rgba(255, 255, 255, 0.4);
    }
}
</style>

<i18n>
{
    "en": {
        "remain_day": "%d day",
        "remain_day_plural": "%d days",
        "remain_hour": "%d hour",
        "remain_hour_plural": "%d hours",
        "remain_min": "%d min",
        "remain_min_plural": "%d mins",
        "expired": "Expired"
    },
    "zh": {
        "remain_day": "%d 天",
        "remain_day_plural": "%d 天",
        "remain_hour": "%d 小时",
        "remain_hour_plural": "%d 小时",
        "remain_min": "%d 分钟",
        "remain_min_plural": "%d 分钟",
        "expired": "已过期"
    }
}
</i18n>

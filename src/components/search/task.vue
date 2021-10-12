<template>
    <v-card
        class="mx-auto task-search-container mb-2"
        outlined
    >
        <v-list flat class="list" :key="updateListKey">
            <v-list-item-group
                v-model="ifTasks"
                multiple
                active-class="done"
            >
                <v-list-item v-for="(task, index) in tasks" :key="index">
                    <template v-slot:default="{ active }">
                        <v-list-item-action>
                            <v-checkbox :input-value="active"></v-checkbox>
                        </v-list-item-action>

                        <v-list-item-content>
                            <v-list-item-title><span v-if="task.deadline !== false && displayRemain(task.deadline, index) !== ''" class="d-inline-block time-remain" :class="checkExpired(task.deadline, index)"><v-icon :class="checkUrgent(task.deadline, index)" class="mr-1 urgent-icon" dense>mdi-clock-alert-outline</v-icon>{{ displayRemain(task.deadline, index) }}</span>{{ task.title }}</v-list-item-title>
                            <v-list-item-subtitle v-if="task.deadline !== false || task.subject !== false">
                                <span v-if="task.deadline !== false" class="mr-2">
                                    <v-icon
                                        v-if="task.deadline !== false"
                                        small
                                    >
                                        mdi-clock-outline
                                    </v-icon>
                                    {{ getDate(new Date(task.deadline)) }}
                                </span>
                                <span v-if="task.subject !== false">
                                    <span :class="subjectColor(task.subject)" class="subject-color-samll" v-if="task.subject !== false"></span>
                                    {{ subjectNameMap(task.subject) }}
                                </span>
                            </v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action class="delete">
                            <v-btn icon @click.stop="removeTask(task.rawIndex)">
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
import formatDateTime from '@/tools/formatDateTime';

export default {
    name: 'taskSearch',
    props: {
        tasks: Array,
    },
    data() {
        return {
            ifTasks: [],
            updateListKey: '',
            skipSyncBack: false,
        };
    },
    methods: {
        /**
         * Remove a task from the list by index in widget
         * @param {number} index task index
         */
        removeTask(index) {
            this.$store.commit('setSearchNotification', {
                target: 'task',
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
         * Calculate the remaining time of a task and format it as a string
         * @param {number} deadline deadline
         * @param {number} index task index of the list
         * @returns {string} formatted string or ''
         */
        displayRemain(deadline, index) {
            if (this.ifTasks.includes(index)) {
                return '';
            }

            const now = new Date().valueOf();
            const ddl = deadline;

            // More than 1 day
            if (ddl - now >= 86400000) {
                const day = Math.floor((ddl - now) / 86400000);
                return this.$tc('remain_day', day, [day]);
            }
            // More than 1 hour
            if (ddl - now < 86400000 && ddl - now > 3600000) {
                const hour = Math.round((ddl - now) / 3600000);
                return this.$tc('remain_hour', hour, [hour]);
            }
            // Less than 1 hour
            if (ddl - now < 3600000 && ddl - now > 0) {
                const mins = Math.round((ddl - now) / 60000);
                return this.$tc('remain_min', mins, [mins]);
            }
            // Expired
            if (ddl - now < 0) {
                return this.$t('expired');
            }
            return '';
        },
        /**
         * Check if the task is urgent and return color classes
         * @param {number} deadline deadline
         * @param {number} index task index of the list
         * @returns {string} color classes or ''
         */
        checkUrgent(deadline, index) {
            if (this.ifTasks.includes(index)) {
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
            // Task done
            return 'd-none';
        },
        /**
         * Check if the task is expired and return the classes for text
         * @param {number} deadline deadline
         * @param {number} index task index of the list
         * @returns {string} color classes or ''
         */
        checkExpired(deadline, index) {
            if (this.ifTasks.includes(index)) {
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
            return formatDateTime(dateObj, this.locale, window.uomaTimeFormatters, false);
        },
        /**
         * Update `ifTodos` based on prop
         */
        updateDone() {
            this.skipSyncBack = true;
            this.ifTasks = [];
            if (this.tasks) {
                for (let i = 0; i < this.tasks.length; i += 1) {
                    if (this.tasks[i].done) {
                        this.ifTasks.push(i);
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
        tasks() {
            this.updateDone();
        },
        ifTasks() {
            // Sync states back to widget
            if (!this.skipSyncBack) {
                if (this.tasks) {
                    const payload = [];
                    for (let i = 0; i < this.tasks.length; i += 1) {
                        payload.push({
                            rawIndex: this.tasks[i].rawIndex,
                            done: this.ifTasks.includes(i),
                        });
                    }
                    this.$store.commit('setSearchNotification', {
                        target: 'task',
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
.task-search-container {
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
            @media (hover: hover) {
                opacity: 0;
                transition: .2s;
            }
        }
        .v-list-item {
            background-color: transparent;
            transition: background-color .2s;
            @media (hover: hover) {
                &:hover, &:focus {
                    background-color: rgba(0, 0, 0, .04);
                    .delete {
                        opacity: 1;
                    }
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
#app.theme--dark .task-search-container {
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
        "remain_day": "{0} day | {0} days",
        "remain_hour": "{0} hour | {0} hours",
        "remain_min": "{0} min | {0} mins",
        "expired": "Overdue"
    },
    "zh": {
        "remain_day": "{0} 天 | {0} 天",
        "remain_hour": "{0} 小时 | {0} 小时",
        "remain_min": "{0} 分钟 | {0} 分钟",
        "expired": "已过期"
    },
    "es": {
        "remain_day": "{0} día | {0} días",
        "remain_hour": "{0} hora | {0} horas",
        "remain_min": "{0} minuto | {0} minutos",
        "expired": "Atrasado"
    },
    "ja": {
        "remain_day": "{0} 日 | {0} 日",
        "remain_hour": "{0} 時間 | {0} 時間",
        "remain_min": "{0} 分 | {0} 分",
        "expired": "期限切れた"
    }
}
</i18n>

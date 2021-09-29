<template>
    <v-card
        class="mx-auto rounded-lg task-container"
        outlined
    >
        <v-progress-circular
            indeterminate
            color="grey"
            :width="2"
            :size="18"
            class="loading"
            v-show="loading"
        ></v-progress-circular>
        <div class="task-outer">
            <h2 class="handle">
                {{ $t('task') }}
                <span class="num-badge" v-show="(tasks.length - ifTasks.length) > 0">{{ tasks.length - ifTasks.length }}</span>
            </h2>
            <v-text-field
                :label="$t('add_task')"
                outlined
                class="input"
                prepend-inner-icon="mdi-format-list-checks"
                clearable
                v-model.trim="addText"
            ></v-text-field>
            <div class="date-expend" :class="{ expended: addText && addText.length > 0 }">
                <v-menu
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    :nudge-top="25"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="date"
                            :label="$t('ddl_date')"
                            prepend-inner-icon="mdi-calendar"
                            class="date-input"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            outlined
                            clearable
                        ></v-text-field>
                    </template>
                    <v-date-picker
                        v-model="date"
                        color="primary"
                        @input="dateMenu = false"
                        :locale="selectLocale"
                        :key="`date-picker-${updateDatePickerKey}`"
                    ></v-date-picker>
                </v-menu>
                <v-menu
                    ref="timeMenu"
                    v-model="timeMenu"
                    :close-on-content-click="false"
                    :nudge-top="25"
                    :return-value.sync="time"
                    transition="scale-transition"
                    offset-y
                    max-width="290px"
                    min-width="290px"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="time"
                            :label="$t('ddl_time')"
                            prepend-inner-icon="mdi-clock-time-four-outline"
                            class="time-input"
                            readonly
                            v-bind="attrs"
                            v-on="on"
                            outlined
                            clearable
                        ></v-text-field>
                    </template>
                    <v-time-picker
                        v-if="timeMenu"
                        v-model="time"
                        format="24hr"
                        color="primary"
                        :scrollable="true"
                        @click:minute="$refs.timeMenu.save(time)"
                        @click:hour="time === null || time.length === 0 ? false: $refs.timeMenu.save(time)"
                    ></v-time-picker>
                </v-menu>
                <v-autocomplete
                    class="select-subject"
                    prepend-inner-icon="mdi-book"
                    v-model="addingSubject"
                    clearable
                    outlined
                    item-text="id"
                    item-value="id"
                    :items="allSubjects"
                    :label="$t('subject')"
                    :no-data-text="$t('no_subject')"
                    :menu-props="{
                        closeOnClick: false,
                        closeOnContentClick: false,
                        disableKeys: true,
                        openOnClick: false,
                        maxHeight: 304,
                        offsetY: true,
                        offsetOverflow: true,
                        transition: 'slide-y-transition'
                    }"
                >
                    <template v-slot:item="data">
                        <v-list-item-avatar :color="data.item.color" v-if="data.item.color" size="20">
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>{{ data.item.id }}</v-list-item-title>
                            <v-list-item-subtitle>{{ data.item.name }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </template>
                </v-autocomplete>
                <v-btn
                    depressed
                    color="primary"
                    class="add-submit"
                    @click="addOne"
                >
                    <v-icon dark>
                        mdi-check
                    </v-icon>
                </v-btn>
            </div>
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
                                <v-btn icon @click.stop="removeTask(index)">
                                    <v-icon color="grey">mdi-delete-outline</v-icon>
                                </v-btn>
                            </v-list-item-action>
                        </template>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <div class="empty" v-if="tasks.length === 0">
                <v-icon color="grey" x-large>mdi-check-all</v-icon>
            </div>
        </div>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import formatDateTime from '@/tools/formatDateTime';

export default {
    name: 'task',
    props: {
        searchid: Number,
    },
    data() {
        return {
            loading: false,
            tasks: [],
            ifTasks: [],
            addText: '',
            timeMenu: false,
            time: '',
            dateMenu: false,
            date: '',
            addingSubject: '',
            updateListKey: '',
            updateDatePickerKey: 0,
            timer: null,
        };
    },
    methods: {
        /**
         * Add a task to the list
         */
        addOne() {
            if (this.addText !== '') {
                // Make sure date and time is valid and construct string for Date object
                let deadline = false;
                if (this.date !== null && this.date.length > 0) {
                    if (this.time !== null && this.time.length > 0) {
                        deadline = new Date(`${this.date}T${this.time}`).valueOf();
                    } else {
                        // If time is missing, set to 00:00
                        deadline = new Date(`${this.date}T00:00`).valueOf();
                    }
                } else if (this.time !== null && this.time.length > 0) {
                    // If date is missing
                    const todayObj = new Date();
                    const nowHour = todayObj.getHours();
                    const nowMin = todayObj.getMinutes();
                    const timeSplit = this.time.split(':');

                    let nowDate = '';
                    if (parseInt(timeSplit[0], 10) < nowHour || (parseInt(timeSplit[0], 10) === nowHour && parseInt(timeSplit[1], 10) < nowMin)) {
                        // Time earlier than current time, set to tomorrow
                        nowDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate() + 1).padStart(2, '0')}`;
                    } else {
                        // Time later than current time, set to today
                        nowDate = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;
                    }
                    deadline = new Date(`${nowDate} ${this.time}`).valueOf();
                }
                this.tasks.push({
                    title: this.addText,
                    deadline,
                    subject: this.addingSubject === null || this.addingSubject.length === 0 ? false : this.addingSubject,
                });
                // Clear inputs
                this.addText = '';
                this.date = '';
                this.time = '';
                this.addingSubject = '';
                // Update layout
                this.$nextTick(() => {
                    this.packery.shiftLayout();
                });
            }
        },
        /**
         * Remove a task from the list by index
         * @param {number} index task index
         */
        removeTask(index) {
            // Create a copy to protect the original array
            const ifTasksCopy = [];
            for (let i = 0; i < this.ifTasks.length; i += 1) {
                ifTasksCopy.push(this.ifTasks[i]);
            }

            // Remove the index and update the remaining
            for (let i = 0; i < ifTasksCopy.length; i += 1) {
                if (ifTasksCopy[i] === index) {
                    ifTasksCopy.splice(i, 1);
                } else {
                    if (ifTasksCopy[i] > index) {
                        ifTasksCopy[i] -= 1;
                    }
                }
            }
            this.ifTasks = ifTasksCopy;

            // Update task list
            this.tasks.splice(index, 1);

            // Update layout
            this.$nextTick(() => {
                this.packery.shiftLayout();
            });
        },
        /**
         * Store changes to localstorage
         */
        store() {
            localStorage.setItem('tasks', JSON.stringify({
                tasks: this.tasks,
                ifTasks: this.ifTasks,
            }));
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
         * Map from subject ID to subject full name
         * @param {string} subject subject ID
         * @returns {string} subject full name or raw ID (if none matched)
         */
        subjectLongNameMap(subject) {
            if (!this.subjects) {
                return subject;
            }
            for (const item of this.subjects) {
                if (item.id === subject) {
                    return item.name;
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
         * Generate and broadcast task deadline tasks
         */
        storeTasks() {
            const taskList = [];
            for (const item of this.tasks) {
                if (!this.ifTasks.includes(this.tasks.indexOf(item)) && item.deadline !== false) {
                    const rawDdl = new Date(item.deadline);
                    const ddl = `${rawDdl.getFullYear()}-${`${rawDdl.getMonth() + 1}`.padStart(2, '0')}-${`${rawDdl.getDate()}`.padStart(2, '0')}T${`${rawDdl.getHours()}`.padStart(2, '0')}:${`${rawDdl.getMinutes()}`.padStart(2, '0')}:00`;
                    taskList.push({
                        name: item.title,
                        details: 'Coursework Deadline',
                        start: new Date(ddl),
                        end: new Date(ddl),
                        color: 'red darken-4',
                        titleColor: 'red darken-4',
                        timed: true,
                        rawTitle: item.title,
                        subjectName: `${item.subject ? this.subjectLongNameMap(item.subject) : ''}`,
                        subjectId: `${item.subject ? item.subject : ''}`,
                    });
                }
            }
            this.$store.commit('setTasks', taskList);
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
         * Build search index
         */
        buildSearchIndex() {
            const index = [];
            for (let i = 0; i < this.tasks.length; i += 1) {
                index.push({
                    title: this.tasks[i].title,
                    deadline: this.tasks[i].deadline,
                    subject: this.tasks[i].subject,
                    subjectName: this.tasks[i].subject === false ? [] : [this.subjectNameMap(this.tasks[i].subject), this.subjectLongNameMap(this.tasks[i].subject)],
                    id: `task-${i}`,
                    rawIndex: i,
                    done: this.ifTasks.includes(i),
                });
            }
            this.$store.commit('setSearchIndex', {
                id: this.searchid,
                payload: {
                    name: 'task',
                    key: 'id',
                    indexes: ['title', 'subject', 'subjectName'],
                    data: index,
                },
            });
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        tasks() {
            // Store data when task changed
            this.store();
            this.storeTasks();
            this.buildSearchIndex();
        },
        ifTasks() {
            // Store data when task state changed
            this.store();
            this.storeTasks();
            this.buildSearchIndex();
        },
        timerMin() {
            this.updateListKey = this.timerMin;
        },
        timerHour() {
            this.updateDatePickerKey = new Date().valueOf();
        },
        searchNotification() {
            // Handle search actions
            if (this.searchNotification.target === 'task') {
                if (this.searchNotification.payload.action === 'syncDone') {
                    // Sync states
                    for (const item of this.searchNotification.payload.payload) {
                        if (item.done) {
                            if (!this.ifTasks.includes(item.rawIndex)) {
                                this.ifTasks.push(item.rawIndex);
                            }
                        } else {
                            if (this.ifTasks.includes(item.rawIndex)) {
                                this.ifTasks.splice(this.ifTasks.indexOf(item.rawIndex), 1);
                            }
                        }
                    }
                } else if (this.searchNotification.payload.action === 'delete') {
                    // Delete one
                    this.removeTask(this.searchNotification.payload.index);
                }
            }
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            localeDetail: (state) => state.localeDetail,
            packery: (state) => state.packery,
            subjects: (state) => state.subjects,
            timerMin: (state) => state.timerMin,
            timerHour: (state) => state.timerHour,
            searchNotification: (state) => state.searchNotification,
        }),
        allSubjects() {
            if (!this.subjects) {
                return [];
            }
            return this.subjects.filter((subject) => !subject.hide);
        },
        selectLocale() {
            return this.localeDetail === null ? 'en' : this.localeDetail.iso;
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Get tasks from localstorage
        const storaged = localStorage.getItem('tasks');
        if (storaged) {
            const storagedTasks = JSON.parse(storaged);
            this.tasks = storagedTasks.tasks;
            this.ifTasks = storagedTasks.ifTasks;
        }

        this.buildSearchIndex();
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
};
</script>

<style lang="less">
.task-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
    .loading {
        position: absolute;
        top: 10px;
        right: 10px;
    }
    h2 {
        font-size: 18px;
        font-weight: normal;
        opacity: .87;
        margin-top: 18px;
        margin-left: 20px;
        .num-badge {
            display: inline-block;
            padding: 0 9px;
            min-width: 25px;
            border-radius: 10px;
            background-color: #EEEEEE;
            font-size: 13.5px;
            vertical-align: text-top;
            margin-left: 3px;
        }
    }
    .input {
        width: 92%;
        margin-left: 4%!important;
        margin-top: 15px!important;
        margin-bottom: -20px!important;
    }
    .date-expend {
        position: absolute;
        top: 127px;
        background-color: white;
        left: 0;
        z-index: 2;
        border-radius: 8px;
        transform: scaleY(0);
        transform-origin: top;
        overflow: visible;
        transition: all .3s .3s;
        .date-input {
            display: inline-block;
            width: calc(50% - 5px);
            margin-left: 4%!important;
            margin-top: 0!important;
            margin-bottom: -20px !important;
            opacity: 0;
            transition: opacity .3s;
        }
        .time-input {
            display: inline-block;
            width: calc(42% - 5px);
            margin-left: 10px!important;
            margin-top: 0!important;
            margin-bottom: -20px !important;
            opacity: 0;
            transition: opacity .3s;
        }
        .select-subject {
            display: inline-block;
            width: calc(92% - 65px);
            margin-left: 16px!important;
            margin-top: 0!important;
            margin-bottom: -15px !important;
            opacity: 0;
            transition: opacity .3s;
        }
        .add-submit {
            height: 56px;
            min-width: 56px;
            margin-top: -11px;
            margin-left: 10px;
            opacity: 0;
            transition: opacity .3s;
        }
        &.expended {
            box-shadow: -1px 18px 33px -9px rgba(0, 0, 0, 0.2);
            transform: scaleY(1);
            height: auto;
            transition: all .3s;
            .date-input, .time-input, .add-submit, .select-subject {
                opacity: 1;
                transition: opacity .3s .3s;
            }
        }
    }
    .list {
        padding-top: 0;
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
                margin-right: 2px;
            }
        }
        .v-list-item__content {
            padding: 8px 0;
        }
    }
    .empty {
        width: 100%;
        height: 120px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: .5;
        font-size: 15px;
    }
    .done {
        color: rgba(0, 0, 0, .4);
        .v-list-item__title {
            text-decoration: line-through;
        }
    }
    .task-outer {
        width: 100%;
        min-height: 260px;
    }
}
#app.theme--dark .task-container {
    h2 {
        .num-badge {
            background-color: #3E3E3E;
        }
    }
    .v-list-item {
        &:hover, &:focus {
            background-color: rgba(255, 255, 255, .04);
        }
    }
    .date-expend {
        background-color: #1E1E1E;
        &.expended {
            box-shadow: -1px 18px 33px -9px rgba(0, 0, 0, 0.4);
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
        "task": "Task",
        "add_task": "Add a task",
        "ddl_date": "Due Date",
        "ddl_time": "Time",
        "subject": "Course Unit",
        "no_subject": "No course found",
        "remain_day": "{0} day | {0} days",
        "remain_hour": "{0} hour | {0} hours",
        "remain_min": "{0} min | {0} mins",
        "expired": "Overdue"
    },
    "zh": {
        "task": "任务",
        "add_task": "添加一个任务",
        "ddl_date": "到期日期",
        "ddl_time": "到期时间",
        "subject": "科目",
        "no_subject": "找不到科目",
        "remain_day": "{0} 天 | {0} 天",
        "remain_hour": "{0} 小时 | {0} 小时",
        "remain_min": "{0} 分钟 | {0} 分钟",
        "expired": "已过期"
    },
    "es": {
        "task": "Tarea",
        "add_task": "Añadir tarea",
        "ddl_date": "Fecha límite",
        "ddl_time": "Hora límite",
        "subject": "Asignatura",
        "no_subject": "Asignatura no encontrada",
        "remain_day": "{0} día | {0} días",
        "remain_hour": "{0} hora | {0} horas",
        "remain_min": "{0} minuto | {0} minutos",
        "expired": "Retraso"
    },
    "ja": {
        "task": "任務",
        "add_task": "任務を追加する",
        "ddl_date": "締め切り日",
        "ddl_time": "締め切り時間",
        "subject": "科目",
        "no_subject": "科目が見つかりません",
        "remain_day": "{0} 日 | {0} 日",
        "remain_hour": "{0} 時間 | {0} 時間",
        "remain_min": "{0} 分 | {0} 分",
        "expired": "期限切れた"
    }
}
</i18n>

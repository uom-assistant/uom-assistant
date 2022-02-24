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
        <div class="task-outer" v-shortkey="['alt', 't']" @shortkey="focusInput">
            <h2 class="handle">
                {{ $t('task') }}
                <span class="num-badge" v-show="(tasks.length - ifTasks.length) > 0">{{ tasks.length - ifTasks.length }}</span>
                <v-btn icon small class="float-right mr-4" :title="$t('quick_add')" @click="openAhead">
                    <v-icon>mdi-playlist-plus</v-icon>
                </v-btn>
            </h2>
            <div class="input-container">
                <v-text-field
                    :label="$t('add_task')"
                    outlined
                    class="input"
                    prepend-inner-icon="mdi-format-list-checks"
                    clearable
                    v-model.trim="addText"
                    @keypress.enter="addOne"
                    ref="addInput"
                ></v-text-field>
            </div>
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
                            prepend-inner-icon="mdi-clock-outline"
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
                        <v-list-item-avatar :color="data.item.color" v-if="data.item.color" size="20"></v-list-item-avatar>
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
            <div class="list-conatiner-head" :class="{ shadow: headerShadow }"></div>
            <div class="list-conatiner" @scroll.passive="scrollHandler" ref="scrollTarget">
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
                                    <v-list-item-title :title="task.title"><span v-if="task.deadline !== false && displayRemain(task.deadline, index) !== ''" class="d-inline-block time-remain" :class="checkExpired(task.deadline, index)"><v-icon :class="checkUrgent(task.deadline, index)" class="mr-1 urgent-icon" dense>mdi-clock-alert-outline</v-icon>{{ displayRemain(task.deadline, index) }}</span>{{ task.title }}</v-list-item-title>
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
                                            <span :class="subjectColor(task.subject)" class="subject-color-samll" v-if="task.subject !== false && subjectColor(task.subject) !== ''"></span>
                                            {{ subjectNameMap(task.subject) }}
                                        </span>
                                    </v-list-item-subtitle>
                                </v-list-item-content>

                                <v-list-item-action class="delete" v-if="task.source !== 'auto' || ahead === -1 || checkExpiredBool(task.deadline)">
                                    <v-btn icon @click.stop="removeTask(index)">
                                        <v-icon color="grey">mdi-delete-outline</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </template>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </div>
            <div class="empty" v-if="tasks.length === 0">
                <v-icon color="grey" x-large>mdi-check-all</v-icon>
            </div>
        </div>
        <v-dialog
            v-model="courseworkList"
            max-width="600"
            :fullscreen="$vuetify.breakpoint.xs"
            :transition="$vuetify.breakpoint.xs ? 'slide-y-reverse-transition' : 'dialog-transition'"
        >
            <v-card class="auto-add-dialog" :class="$vuetify.breakpoint.xs ? 'rounded-0' : ''">
                <v-card-title class="headline">
                    {{ $t('coursework_list') }}
                </v-card-title>
                <v-card-text class="pb-2">
                    <p>{{ $t('auto_add_text') }}</p>
                    <v-select
                        v-model="editingAhead"
                        :items="aheadItems()"
                        :label="$t('add_ahead')"
                        hide-details
                        dense
                        outlined
                    ></v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="saveAhead"
                    >
                        {{ $t('save') }}
                    </v-btn>
                </v-card-actions>
                <v-card-text class="pb-1">
                    <v-divider class="mt-1 mb-4"></v-divider>
                    <p>{{ $t('man_add_text') }}</p>
                    <v-simple-table class="coursework-table rounded-0">
                        <template v-slot:default>
                            <thead>
                                <tr>
                                    <th class="text-left pl-0" scope="col">
                                        {{ $t('coursework') }}
                                    </th>
                                    <th class="text-left" scope="col">
                                        {{ $t('deadline') }}
                                    </th>
                                    <th class="text-right pr-0" scope="col">
                                        {{ $t('action') }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="(item, index) in upcomingCourseworks"
                                    :key="`${index}-cwk`"
                                >
                                    <td class="text-left pl-0">
                                        <v-icon class="mr-1 formative" dense :title="$t('formative')" v-if="!item.summative">mdi-bookmark-off-outline</v-icon>{{ item.name }}<br><span v-if="subjectColor(item.course) !== ''" :class="subjectColor(item.course)" class="subject-color-samll mr-2"></span><span class="subject-id">{{ subjectNameMap(item.course) }}</span><v-icon x-small class="ml-2 mr-1" v-if="item.tag">mdi-tag-outline</v-icon><span class="subject-id" v-if="item.tag">{{ item.tag }}</span>
                                    </td>
                                    <td>{{ item.ddlTime === -1 ? $t('na') : getDate(new Date(item.ddlTime)) }}</td>
                                    <td class="text-right pr-0">
                                        <v-btn icon :title="$t('add')" @click="addCoursework(item, index, 'manual')" :disabled="checkExist(item.name) || added.includes(index)">
                                            <v-icon>{{ (checkExist(item.name) || added.includes(index)) ? 'mdi-check' : 'mdi-plus' }}</v-icon>
                                        </v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </template>
                    </v-simple-table>
                    <div class="d-flex justify-center align-center no-coursework" v-if="upcomingCourseworks.length === 0">{{ $t('no_coursework') }}</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        @click="courseworkList = false"
                    >
                        {{ $t('close') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';

import scroll from '@/mixins/scroll';

import formatDateTime from '@/tools/formatDateTime';

export default {
    name: 'task',
    props: {
        searchid: Number,
    },
    mixins: [scroll],
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
            courseworkList: false,
            timer: null,
            editingAhead: -1,
            ahead: -1,
            added: [],
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
                    source: 'manual',
                    synced: false,
                    updated: new Date().valueOf(),
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
            for (const idx of this.ifTasks) {
                ifTasksCopy.push(idx);
            }

            // Update task status
            const indexPosition = ifTasksCopy.indexOf(index);
            if (indexPosition !== -1) {
                ifTasksCopy.splice(indexPosition, 1);
            }
            for (let i = 0; i < ifTasksCopy.length; i += 1) {
                if (ifTasksCopy[i] > index) {
                    ifTasksCopy[i] -= 1;
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
                ahead: this.ahead,
            }));
        },
        /**
         * Add a coursework to the task list
         * @param {Object} courswork coursework object
         * @param {number} index coursework index in the upcoming courseworks list
         * @param { 'manual' | 'auto' } source coursework source
         */
        addCoursework(courswork, index, source = 'manual') {
            this.tasks.push({
                title: courswork.name,
                deadline: courswork.ddlTime === -1 ? false : courswork.ddlTime,
                subject: courswork.course,
                source,
                synced: false,
                updated: new Date().valueOf(),
            });
            if (index !== -1) {
                this.added.push(index);
            }

            // Update layout
            this.$nextTick(() => {
                this.packery.shiftLayout();
            });
        },
        /**
         * Open the coursework list dialog
         */
        openAhead() {
            this.added = [];
            this.editingAhead = this.ahead;
            this.courseworkList = true;
        },
        /**
         * Save audo-add option and close the coursework list dialog
         */
        saveAhead() {
            this.ahead = this.editingAhead;
            this.store();
            this.courseworkList = false;
        },
        /**
         * Check whether a task exists by its name
         * @param {string} name task name
         * @returns {boolean} whether the task exists
         */
        checkExist(name) {
            for (const task of this.tasks) {
                if (task.title === name) {
                    return true;
                }
            }
            return false;
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
         * Check if the task is expired
         * @param {number} deadline deadline
         * @returns {boolean} if the task is expired
         */
        checkExpiredBool(deadline) {
            const now = new Date().valueOf();
            if (deadline - now < 0) {
                return true;
            }
            return false;
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
            return formatDateTime(dateObj, this.locale, window.uomaTimeFormatters, false);
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
        /**
         * Build options for auto-add
         * @returns {array} options list for auto-add
         */
        aheadItems() {
            return [-1, 3, 4, 5, 6, 7, 14, 21, 30].map((item) => ({
                text: item === -1 ? this.$t('dont_auto_add') : this.showDate(item),
                value: item === -1 ? -1 : item * 24 * 3600 * 1000,
            }));
        },
        /**
         * Format the number of days to a string
         * @param {number} days number of days
         * @returns {string} formatted string
         */
        showDate(days) {
            if (days < 7) {
                return this.$tc('n_days', days, [days]);
            }
            if (days < 30) {
                return this.$tc('n_weeks', days / 7, [days / 7]);
            }
            return this.$tc('n_months', 1, [1]);
        },
        /**
         * Automatically add courseworks to task list
         */
        autoAdd() {
            if (this.ahead !== -1) {
                for (const coursework of this.upcomingCourseworks) {
                    if (typeof coursework.ddlTime === 'number' && coursework.ddlTime > 0) {
                        const dlt = coursework.ddlTime - new Date().valueOf();
                        if (dlt >= 0 && dlt < (this.ahead + 24 * 3600 * 1000) && !this.checkExist(coursework.name)) {
                            this.addCoursework(coursework, -1, 'auto');
                        }
                    }
                }
            }
        },
        /**
         * Focus the input
         */
        focusInput() {
            this.$refs.addInput.focus();
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
        ifTasks(newVal, oldVal) {
            for (const item of newVal) {
                if (!oldVal.includes(item) && this.tasks[item]) {
                    this.tasks[item].updated = new Date().valueOf();
                }
            }
            for (const item of oldVal) {
                if (!newVal.includes(item) && this.tasks[item]) {
                    this.tasks[item].updated = new Date().valueOf();
                }
            }
            // Store data when task status changed
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
        upcomingCourseworks() {
            this.autoAdd();
        },
        ahead() {
            this.autoAdd();
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
            upcomingCourseworks: (state) => state.upcomingCourseworks,
            widgets: (state) => state.widgets,
        }),
        /**
         * Whether the widget is shown
         * @returns {boolean} whether the widget is shown
         */
        widgetShown() {
            return this.widgets ? this.widgets.includes(this.searchid) : true;
        },
        /**
         * Get all courses that not hidden
         * @returns {array} all courses that not hidden
         */
        allSubjects() {
            if (!this.subjects) {
                return [];
            }
            return this.subjects.filter((subject) => !subject.hide);
        },
        /**
         * Get ISO locale name
         * @returns {string} ISO locale name
         */
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
            this.ahead = storagedTasks.ahead;
            this.editingAhead = storagedTasks.ahead;
        }

        this.buildSearchIndex();
    },
    beforeDestroy() {
        if (this.timer !== null) {
            clearInterval(this.timer);
        }
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
    .input-container {
        position: relative;
        z-index: 3;
        background-color: white;
        height: 58px;
        .input {
            width: 92%;
            margin-left: 4%!important;
            margin-top: 15px!important;
            margin-bottom: -28px!important;
        }
    }
    .date-expend {
        position: absolute;
        top: 126px;
        background-color: white;
        left: 0;
        z-index: 4;
        border-radius: 0 0 8px 8px;
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
    .list-conatiner-head {
        width: 100%;
        height: 12px;
        position: relative;
        z-index: 2;
        transition: all .2s;
        &.shadow {
            box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 10%), 0px 4px 5px 0px rgba(0, 0, 0, 7%), 0px 1px 10px 0px rgba(0, 0, 0, 6%)!important;
        }
    }
    .list-conatiner {
        position: relative;
        z-index: 1;
        max-height: 430px;
        overflow-y: auto;
    }
    .list {
        padding-top: 0;
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
.auto-add-dialog {
    .subject-id {
        opacity: .5;
        font-size: 13px;
    }
    .subject-color-samll {
        width: 10px;
        height: 10px;
        display: inline-block;
        border-radius: 50%;
        margin: 0;
        margin-right: 2px;
    }
    .no-coursework {
        opacity: .5;
        font-size: 15px;
        height: 100px;
    }
    .formative {
        vertical-align: middle;
        font-size: 16px;
    }
    tr {
        background-color: transparent!important;
        &:hover {
            background-color: transparent!important;
        }
    }
}
#app.theme--dark .task-container {
    h2 {
        .num-badge {
            background-color: #3E3E3E;
        }
    }
    .input-container {
        background-color: #1E1E1E;
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
        "expired": "Overdue",
        "quick_add": "Coursework quick adding",
        "coursework_list": "Add coursework",
        "save": "Save",
        "auto_add_text": "UoM Assistant can automatically add courseworks to the task list at a specified time before their due time. Automatically added courseworks cannot be deleted manually until the coursework expires or auto-add is turned off.",
        "man_add_text": "You can also add courseworks manually. The list is synchronised from SPOT, please check the accuracy of the list yourself.",
        "add_ahead": "Auto-add … in advance",
        "dont_auto_add": "Don't auto-add",
        "n_days": "{0} day | {0} days",
        "n_weeks": "{0} week | {0} weeks",
        "n_months": "{0} month | {0} months",
        "coursework": "Coursework",
        "deadline": "Deadline",
        "action": "Action",
        "na": "N/A",
        "add": "Add to task list",
        "no_coursework": "No upcoming coursework",
        "formative": "Formative",
        "close": "Close"
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
        "expired": "已过期",
        "quick_add": "快速添加作业",
        "coursework_list": "添加作业",
        "save": "保存",
        "auto_add_text": "曼大助手可以在作业到期前指定时间时自动添加作业到任务列表。自动添加的作业无法被手动删除，直到作业到期或自动添加被关闭。",
        "man_add_text": "你也可以手动添加作业任务。作业列表同步自 SPOT，请自行确认信息准确性。",
        "add_ahead": "提前…自动添加",
        "dont_auto_add": "不要自动添加",
        "n_days": "{0} 天 | {0} 天",
        "n_weeks": "{0} 周 | {0} 周",
        "n_months": "{0} 个月 | {0} 个月",
        "coursework": "作业",
        "deadline": "截止时间",
        "action": "操作",
        "na": "未知",
        "add": "添加到任务列表",
        "no_coursework": "没有即将到来的作业",
        "formative": "不计分作业",
        "close": "关闭"
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
        "expired": "Atrasado",
        "quick_add": "Adición rápida de trabajo de asignatura",
        "coursework_list": "",
        "save": "Guardar",
        "auto_add_text": "",
        "man_add_text": "",
        "add_ahead": "",
        "dont_auto_add": "",
        "n_days": "",
        "n_weeks": "",
        "n_months": "",
        "coursework": "",
        "deadline": "",
        "action": "",
        "na": "",
        "add": "",
        "no_coursework": "",
        "formative": "",
        "close": "Cerrar"
    },
    "ja": {
        "task": "タスク",
        "add_task": "タスクを追加する",
        "ddl_date": "締め切り日",
        "ddl_time": "締め切り時間",
        "subject": "科目",
        "no_subject": "科目が見つかりません",
        "remain_day": "{0} 日 | {0} 日",
        "remain_hour": "{0} 時間 | {0} 時間",
        "remain_min": "{0} 分 | {0} 分",
        "expired": "期限切れた",
        "quick_add": "",
        "coursework_list": "",
        "save": "保存",
        "auto_add_text": "",
        "man_add_text": "",
        "add_ahead": "",
        "dont_auto_add": "",
        "n_days": "",
        "n_weeks": "",
        "n_months": "",
        "coursework": "",
        "deadline": "",
        "action": "",
        "na": "",
        "add": "",
        "no_coursework": "",
        "formative": "",
        "close": "閉じる"
    }
}
</i18n>

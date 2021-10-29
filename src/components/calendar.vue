<template>
    <v-card
        class="mx-auto rounded-lg calendar-container"
        outlined
    >
        <v-row class="fill-height">
            <v-col class="phb-11">
                <v-sheet class="handle">
                    <v-toolbar flat>
                        <v-btn
                            outlined
                            :class="$vuetify.breakpoint.xs ? 'mr-1' : 'mr-2'"
                            :color="$vuetify.theme.dark ? 'grey lighten-1' : 'grey darken-3'"
                            @click="focus = ''"
                        >
                            {{ $t('today') }}
                        </v-btn>
                        <v-btn
                            icon
                            max-width="36"
                            max-height="36"
                            class="mr-1"
                            @click="prev"
                        >
                            <v-icon>
                                mdi-chevron-left
                            </v-icon>
                        </v-btn>
                        <v-btn
                            icon
                            max-width="36"
                            max-height="36"
                            class="mr-1"
                            @click="next"
                        >
                            <v-icon>
                                mdi-chevron-right
                            </v-icon>
                        </v-btn>
                        <v-toolbar-title v-if="$refs.calendar" class="d-none d-sm-block ml-1">
                            {{ $refs.calendar.title }}
                        </v-toolbar-title>
                        <v-progress-circular
                            indeterminate
                            color="grey"
                            :width="2"
                            :size="18"
                            class="loading"
                            :class="{ 'd-none': $vuetify.breakpoint.xs}"
                            v-show="loading"
                        ></v-progress-circular>
                        <v-spacer></v-spacer>
                        <v-btn
                            icon
                            max-width="36"
                            max-height="36"
                            :class="$vuetify.breakpoint.xs ? 'mr-1' : 'mr-3'"
                            @click="setFirstDay"
                        >
                            <v-icon>
                                mdi-cog-outline
                            </v-icon>
                        </v-btn>
                        <v-menu
                            bottom
                            right
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    outlined
                                    :color="$vuetify.theme.dark ? 'grey lighten-1' : 'grey darken-3'"
                                    v-bind="attrs"
                                    v-on="on"
                                >
                                    <span>{{ $t(type) }}</span>
                                    <v-icon right>
                                        mdi-menu-down
                                    </v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item @click="type = 'day'">
                                    <v-list-item-title>{{ $t('day') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="type = 'week'">
                                    <v-list-item-title>{{ $t('week') }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="type = 'month'">
                                    <v-list-item-title>{{ $t('month') }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-toolbar>
                </v-sheet>
                <v-sheet height="680">
                    <v-calendar
                        ref="calendar"
                        v-model="focus"
                        color="primary"
                        :events="events"
                        :event-color="getEventColor"
                        :type="type"
                        :locale="calendarLocale"
                        :weekdays="weekDays"
                        :key="`calendar-${refreshId}`"
                        :interval-height="40"
                        @click:event="showEvent"
                        @click:more="viewDay"
                        @click:date="viewDay"
                        @change="updateRange"
                    >
                        <template v-slot:day-body="{ date, week }">
                            <div
                            class="v-current-time"
                            :class="{
                                first: (date === week[0].date && type === 'day') || (date === currentDate && type === 'week'),
                                week: date !== currentDate && type === 'week',
                            }"
                            :style="{ top: nowY }"
                            ></div>
                        </template>
                        <template v-slot:day-label="{ date, day, present }">
                            <v-btn
                                fab
                                small
                                depressed
                                :color="present ? 'primary' : 'transparent'"
                                @click="viewDay({ date })"
                            >
                                {{ dateText(date, day) }}
                            </v-btn>
                        </template>
                        <template v-slot:day-label-header="{ date, day, present }">
                            <v-btn
                                fab
                                :x-small="$vuetify.breakpoint.xs"
                                :small="!$vuetify.breakpoint.xs"
                                class="my-1"
                                depressed
                                :color="present ? 'primary' : 'transparent'"
                                @click="viewDay({ date })"
                            >
                                {{ dateText(date, day) }}
                            </v-btn>
                        </template>
                        <template v-slot:event="{ eventSummary, event, day }">
                            <div
                                class="pl-1 event-block"
                                :class="{ 'text--disabled': event.selfStudy }"
                                v-html="eventSummary()"
                            >
                            </div>
                            <div
                                class="event-block-overlay"
                                :style="{
                                    width: type === 'day' || type === 'week' ? '100%' : getEevntPercentage(event.start, event.end, day),
                                    height: type === 'month' ? '100%' : getEevntPercentage(event.start, event.end, day),
                                }"
                            ></div>
                        </template>
                    </v-calendar>
                    <v-menu
                        v-model="selectedOpen"
                        nudge-right="5"
                        offset-x
                        :content-class="`large-radius event-card-container${$vuetify.breakpoint.xs ? ' full-screen-menu' : ''}`"
                        :transition="$vuetify.breakpoint.xs ? 'slide-y-reverse-transition' : 'slide-x-transition'"
                        :close-on-content-click="false"
                        :activator="selectedElement"
                    >
                        <v-card
                            class="event-card"
                            min-width="350px"
                            flat
                        >
                            <v-toolbar
                                color="#ffffff"
                                height="64"
                                flat
                            >
                                <v-toolbar-title :class="selectedEvent.titleColor ? `${selectedEvent.titleColor.split(' ')[0] === 'uomtheme' ? 'primary' : selectedEvent.titleColor.split(' ')[0]}--text${selectedEvent.titleColor.split(' ').length > 1 ? ` text--${selectedEvent.titleColor.split(' ')[1]}` : ''}` : ''" class="calendar-selected-name">
                                    {{ selectedEvent.details === 'Coursework Deadline' ? selectedEvent.name : (selectedEvent.subjectName === '' ? selectedEvent.name.split('/')[0] : selectedEvent.subjectName) }}<br>
                                    <span class="text--disabled calendar-smaller-font">{{ selectedEvent.details === 'Coursework Deadline' ? (selectedEvent.subjectName === '' ? $t('coursework') : selectedEvent.subjectName) : selectedEvent.rawTitle }}{{ selectedEvent.selfStudy ? $t('self_study') : '' }}</span>
                                </v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-tooltip top v-if="selectedEvent.subjectId !== '' && subjectLinks(selectedEvent.subjectId).homeLink !== false">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            icon
                                            small
                                            class="mr-0 ml-2"
                                            target="_blank"
                                            :href="subjectLinks(selectedEvent.subjectId).homeLink"
                                            color="grey"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            <v-icon>mdi-home-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('subject_home') }}</span>
                                </v-tooltip>
                                <v-btn
                                    icon
                                    small
                                    class="ml-2 mr-0"
                                    :class="{ 'd-none': !$vuetify.breakpoint.xs }"
                                    color="grey"
                                    @click="selectedOpen = false"
                                >
                                    <v-icon>mdi-chevron-down</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-card-text>
                                <span v-if="selectedEvent.details !== 'Coursework Deadline'">
                                    {{ selectedEvent.start ? getDate(selectedEvent.start, false) : '' }}{{ selectedEvent.start && selectedEvent.end ? ' – ' : '' }}{{ selectedEvent.end ? getDate(selectedEvent.end, false) : '' }}<br>
                                </span>
                                <span v-else>
                                    {{ selectedEvent.start ? getDate(selectedEvent.start, false) : '' }}
                                </span>
                                <br>
                                <v-list flat class="list" v-if="selectedEvent.details !== 'Coursework Deadline' && selectedEvent.subjectId !== '' && subjectLinks(selectedEvent.subjectId).sessionLinks.length > 0">
                                    <v-list-item-group>
                                        <v-list-item
                                            v-for="(link, index) in subjectLinks(selectedEvent.subjectId).sessionLinks"
                                            :key="`subject-link-${index}`"
                                            :ripple="false"
                                        >
                                            <template>
                                                <v-list-item-content>
                                                    <v-list-item-title>
                                                        <v-btn x-small icon :href="meetingLink(link.link, link.passcode)" :title="ifZoomLink(link.link) ? $t('quick_zoom') : $t('quick_teams')" v-if="ifZoomLink(link.link) || ifTeamsLink(link.link)" class="mr-1 text-decoration-none"><v-icon small>{{ ifTeamsLink(link.link) ? 'mdi-microsoft-teams' : 'mdi-dock-window' }}</v-icon></v-btn><a :href="link.link" target="_blank" rel="noopener nofollow" :class="selectedEvent.titleColor ? `${selectedEvent.titleColor.split(' ')[0] === 'uomtheme' ? 'primary' : selectedEvent.titleColor.split(' ')[0]}--text${selectedEvent.titleColor.split(' ').length > 1 ? ` text--${selectedEvent.titleColor.split(' ')[1]}` : ''}` : ''">{{ link.name }}</a><a :href="link.link" target="_blank" rel="noopener nofollow" class="no-underline-link"><v-icon small :color="selectedEvent.titleColor ? (selectedEvent.titleColor === 'uomtheme' ? 'primary' : selectedEvent.titleColor) : ''">mdi-open-in-new</v-icon>
                                                        </a>
                                                    </v-list-item-title>
                                                </v-list-item-content>
                                                <v-list-item-action class="copy">
                                                    <v-btn
                                                        @click="copyingIndex = index"
                                                        v-if="link.passcode"
                                                        v-clipboard:copy="link.passcode"
                                                        v-clipboard:success="onCopy"
                                                        small
                                                        text
                                                        class="pr-2"
                                                        :color="(copySuccess && copyingIndex === index) ? 'green' : ''"
                                                        :class="(copySuccess && copyingIndex === index) ? 'copied' : ''"
                                                        :title="$t('copy_passcode')"
                                                    >
                                                        <div class="showing">
                                                            <v-icon
                                                                left
                                                                dark
                                                                small
                                                                :color="(copySuccess && copyingIndex === index) ? 'green' : 'gray'"
                                                                :class="(copySuccess && copyingIndex === index) ? 'mr-0' : ''"
                                                            >
                                                                {{ (copySuccess && copyingIndex === index) ? 'mdi-check' : 'mdi-content-copy' }}
                                                            </v-icon>
                                                            {{ (copySuccess && copyingIndex === index) ? '' : link.passcode }}
                                                        </div>
                                                        <v-icon
                                                            left
                                                            dark
                                                            small
                                                            color="transparent"
                                                        >
                                                            mdi-content-copy
                                                        </v-icon>
                                                        <span class="transparent--text">{{ link.passcode }}</span>
                                                    </v-btn>
                                                </v-list-item-action>
                                            </template>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                                <pre v-html="selectedEvent.details === 'Coursework Deadline' ? $t('course_ddl') : linkify(selectedEvent.details)"></pre>
                                <div v-html="selectedEvent.details ? showMap(selectedEvent.details) : ''" v-if="selectedEvent.details && selectedEvent.details !== 'Coursework Deadline'"></div>
                            </v-card-text>
                        </v-card>
                    </v-menu>
                </v-sheet>
            </v-col>
        </v-row>
        <v-dialog
            v-model="setttingsDialog"
            max-width="400"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('first_day_settings') }}
                </v-card-title>
                <v-card-text>
                    <v-select
                        v-model="editingFirstDay"
                        :items="weekDaysItems()"
                        hide-details
                        dense
                        outlined
                    ></v-select>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        @click="setttingsDialog = false"
                    >
                        {{ $t('cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        @click="saveFirstDay"
                    >
                        {{ $t('save') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import { parse } from 'ical.js';
import localForage from 'localforage';
import linkifyStr from 'linkify-string';

import checkResponse from '@/mixins/checkResponse';
import liveLinks from '@/mixins/liveLinks';
import clipboard from '@/mixins/clipboard';

import formatDateTime from '@/tools/formatDateTime';
import betterFetch from '@/tools/betterFetch';

export default {
    name: 'calendar',
    mixins: [checkResponse, liveLinks, clipboard],
    data() {
        return {
            loading: false,
            focus: '',
            type: 'month',
            nowY: '-10px',
            selectedEvent: {},
            selectedElement: null,
            selectedOpen: false,
            events: [],
            today: '',
            currentDate: '',
            currentWeekStart: '',
            currentTimeStamp: 0,
            refreshId: 0,
            classEvents: [],
            courseworkEvents: [],
            updateTimer: null,
            updatePointertimer: null,
            setttingsDialog: false,
            firstDay: 0,
            editingFirstDay: 0,
        };
    },
    methods: {
        /**
         * View a specific day
         * @param {object} option options
         * @param {string} option.date target date
         */
        viewDay({ date }) {
            this.focus = date;
            this.type = 'day';
        },
        /**
         * Get an event's color
         * @param {object} event event object
         * @returns {string} event color
         */
        getEventColor(event) {
            return event.color;
        },
        /**
         * Move the calendar a page back
         */
        prev() {
            this.$refs.calendar.prev();
        },
        /**
         * Move the calendar a page forward
         */
        next() {
            this.$refs.calendar.next();
        },
        /**
         * Show the detail card for an event
         * @param {object} events click event and the selected event
         * @param {Event} events.nativeEvent event object
         * @param {object} events.event event object
         * @returns {string} event color
         */
        showEvent({ nativeEvent, event }) {
            const open = () => {
                this.selectedEvent = event;
                this.selectedElement = nativeEvent.target;
                setTimeout(() => {
                    this.selectedOpen = true;
                }, 10);
            };

            if (this.selectedOpen) {
                this.selectedOpen = false;
                setTimeout(open, 10);
            } else {
                open();
            }

            nativeEvent.stopPropagation();
        },
        /**
         * Update view when range changed
         * @param {object} data event data
         */
        updateRange(data) {
            this.today = data.start.date;
            this.$nextTick(() => {
                if (this.type === 'day' || this.type === 'week') {
                    this.updateTime();
                    if (this.$refs.calendar) {
                        const todayObj = new Date();
                        if ((this.type === 'day' && this.today === this.currentDate) || (this.type === 'week' && this.today === this.currentWeekStart)) {
                            let hour = todayObj.getHours();
                            let minute = todayObj.getMinutes();
                            if (hour < 6) {
                                hour = 0;
                                minute = 0;
                            } else {
                                hour -= 6;
                            }
                            this.$refs.calendar.scrollToTime({
                                hour,
                                minute,
                            });
                        }
                    }
                } else {
                    this.nowY = '-10px';
                }
            });
        },
        /**
         * Update timing bar position in day view
         */
        updateTime() {
            if (this.$refs.calendar && this.$refs.calendar.updateTimes) {
                this.currentTimeStamp = new Date().valueOf();
                this.$refs.calendar.updateTimes();
            }
            if (this.type === 'day') {
                if (this.today === this.currentDate && this.$refs.calendar && this.$refs.calendar.timeToY) {
                    this.nowY = `${this.$refs.calendar.timeToY(this.$refs.calendar.times.now)}px`;
                } else {
                    this.nowY = '-10px';
                }
            } else if (this.type === 'week') {
                if (this.today === this.currentWeekStart && this.$refs.calendar && this.$refs.calendar.timeToY) {
                    this.nowY = `${this.$refs.calendar.timeToY(this.$refs.calendar.times.now)}px`;
                } else {
                    this.nowY = '-10px';
                }
            } else {
                this.nowY = '-10px';
            }
        },
        /**
         * Update current date
         * @param {Date} date current date object
         */
        updateCurrentDate(todayObj = new Date()) {
            const thisWeekStartFromObj = new Date(todayObj.valueOf() - (this.weekDays.indexOf(todayObj.getDay()) * 24 * 3600 * 1000));

            const dd = String(todayObj.getDate()).padStart(2, '0');
            const mm = String(todayObj.getMonth() + 1).padStart(2, '0');
            const yyyy = todayObj.getFullYear();
            const ddWeek = String(thisWeekStartFromObj.getDate()).padStart(2, '0');
            const mmWeek = String(thisWeekStartFromObj.getMonth() + 1).padStart(2, '0');
            const yyyyWeek = thisWeekStartFromObj.getFullYear();

            this.currentDate = `${yyyy}-${mm}-${dd}`;
            this.currentWeekStart = `${yyyyWeek}-${mmWeek}-${ddWeek}`;
        },
        /**
         * Get event percentage passed
         * @param {number} start event start time
         * @param {number} end event end time
         * @param {object} day day object
         * @returns {string} percentage as a atring
         */
        getEevntPercentage(start, end, day) {
            const dayStart = new Date(day.year, day.month - 1, day.day, 0, 0, 0);
            const dayEnd = new Date(dayStart.valueOf() + 24 * 3600 * 1000);

            let clampedStart = start;
            if (start < dayStart.valueOf()) {
                clampedStart = dayStart.valueOf();
            }

            let clampedEnd = end;
            if (end > dayEnd.valueOf()) {
                clampedEnd = dayEnd.valueOf();
            }

            if (clampedEnd <= this.currentTimeStamp) {
                return '100%';
            }
            if (clampedStart >= this.currentTimeStamp) {
                return '0%';
            }
            return `${((this.currentTimeStamp - clampedStart) / (clampedEnd - clampedStart)) * 100}%`;
        },
        /**
         * Linkify event details
         * @param {string} text event details text
         * @returns {string} event details with links
         */
        linkify(text) {
            return typeof text === 'string' ? linkifyStr(text, {
                rel: 'noopener nofollow',
                target: '_blank',
                format: (value, type) => {
                    if (type === 'url' && value.length > 100) {
                        return `${value.slice(0, 100)}…`;
                    }
                    return value;
                },
            }) : text;
        },
        /**
         * Update events from backend
         */
        async checkUpdate(tryCount = 1) {
            if (!this.backend.url || !this.account.calendar) {
                return;
            }
            this.loading = true;
            let requestFailed = false;
            // Send request
            const response = await betterFetch(`https://${this.backend.url}/calendar/`, {
                method: 'POST',
                body: JSON.stringify({
                    subid: this.account.calendar,
                    token: this.backend.token ? this.backend.token : '',
                }, true),
            }).catch(() => {
                if (tryCount < 2) {
                    // Retry
                    setTimeout(() => {
                        this.checkUpdate(tryCount + 1);
                    }, 8000);
                } else {
                    // Network error
                    this.$store.commit('addError', {
                        title: this.$t('network_error'),
                        content: this.$t('network_error_body'),
                        type: 'warning',
                    });
                    this.loading = false;
                    this.updateTime();
                    this.$refs.calendar.checkChange();
                    this.refreshId = new Date().valueOf();

                    this.updateTodayEvents();
                    this.updateNextDayFirstEvent();
                }
                requestFailed = true;
            });

            if (requestFailed) {
                return;
            }

            // Check response
            if (!this.checkResponse(response)) {
                this.loading = false;
                return;
            }

            // Construct maps
            const subjectMap = {};
            const subjectLongMap = {};
            const colorMap = {};
            const subjectIdList = [];
            for (const subject of JSON.parse(localStorage.getItem('subjects') ? localStorage.getItem('subjects') : '[]')) {
                subjectMap[subject.id] = subject.shortName;
                subjectLongMap[subject.id] = subject.name;
                colorMap[subject.id] = subject.color;
                subjectIdList.push(subject.id);
            }

            // Parse ical file
            let rawData = [[], [], []];
            try {
                rawData = parse(response.data);
                this.$store.commit('setBackendStatus', true);
            } catch (icalerr) {
                this.$store.commit('addError', {
                    title: this.$t('ical_error'),
                    content: this.$t('error_at', [`${icalerr.name}: ${icalerr.message}`, this.getDate(new Date())]),
                    type: 'error',
                });
            }

            this.events = [];
            this.classEvents = [];

            // Update events
            const nowDate = new Date().valueOf();
            for (const item of rawData[2]) {
                if (item[0] === 'vevent') {
                    const startTime = new Date(new Date(item[1][3][3]).toUTCString());
                    const timeDiff = (startTime.valueOf() - nowDate) / 1000;
                    // Events range: -1 month to +2 months
                    if (timeDiff < 5184000 && timeDiff > -2592000) {
                        // Get event title, adapted to events with locations
                        const title = typeof item[1][6][3] === 'number' ? item[1][7][3] : item[1][6][3];

                        // Get subject name (if exists)
                        const titleSplit = title.replace('_', '').split('/');
                        const titleName = titleSplit[0];
                        titleSplit.shift();
                        const titleRemain = `/${titleSplit.join('/')}`;

                        // Try to guess event name from event description
                        let guessedName = titleName;
                        if (!subjectMap[titleName]) {
                            const lines = item[1][0][3].split('\n').map((line) => line.trim().split(': ').map((part) => part.trim()));
                            const unitCode = lines.find((line) => line[0] === 'Unit Code');
                            if (unitCode !== undefined && unitCode[1] === titleName) {
                                const unitName = lines.find((line) => line[0] === 'Unit Description');
                                if (unitName !== undefined) {
                                    guessedName = unitName[1];
                                }
                            }
                        }

                        // Convert time
                        const rawEnd = new Date(new Date(item[1][1][3]).toUTCString());

                        const selfStudy = item[1][0][3].toUpperCase().includes('EVENT TYPE: INDEPENDENT STUDY');
                        let color = colorMap[titleName] ? colorMap[titleName] : 'uomtheme';
                        if (selfStudy) {
                            color = 'colordark';
                        }

                        const event = {
                            name: `${subjectMap[titleName] ? subjectMap[titleName] : guessedName}${titleRemain}`,
                            details: item[1][0][3],
                            start: startTime,
                            end: rawEnd,
                            color,
                            titleColor: colorMap[titleName] ? colorMap[titleName] : 'uomtheme',
                            timed: true,
                            rawTitle: title,
                            subjectName: `${subjectLongMap[titleName] ? subjectLongMap[titleName] : ''}`,
                            subjectId: subjectIdList.includes(titleName) ? titleName : '',
                            selfStudy,
                        };
                        this.classEvents.push(event);
                    }
                }
            }
            // Concat with cousework events
            this.events = this.classEvents.concat(this.courseworkEvents);
            await localForage.setItem('calendar', this.events);

            // Refresh calendar
            this.loading = false;
            this.updateTime();
            if (this.$refs.calendar) {
                this.$refs.calendar.checkChange();
            }
            this.refreshId = new Date().valueOf();

            // Broadcast latest events
            this.updateTodayEvents();
            this.updateNextDayFirstEvent();
        },
        /**
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @param {boolean} seconds whether to show seconds
         * @returns {string} formatted a date string
         */
        getDate(dateObj, seconds = true) {
            return formatDateTime(dateObj, this.locale, window.uomaTimeFormatters, seconds);
        },
        /**
         * Convert a Date object to a specified time zone
         * @param {Date | string} date Date object or date string
         * @param {string} tzString timezone name
         * @returns {Date} a new Date object that has converted to the specified time zone
         */
        convertTimeZone(date, tzString) {
            return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }));
        },
        /**
         * Update and broadcast today's events
         */
        updateTodayEvents() {
            const eventList = [];
            const nowTime = this.convertTimeZone(new Date(), 'Europe/London');
            for (const event of this.events) {
                if (event.details !== 'Coursework Deadline') {
                    const eventTime = this.convertTimeZone(event.start, 'Europe/London');
                    if (eventTime.getMonth() === nowTime.getMonth() && eventTime.getDate() === nowTime.getDate()) {
                        eventList.push(event);
                    }
                }
            }
            this.$store.commit('setTodayEvents', eventList);
        },
        /**
         * Update and broadcast next day's first event or `null`
         */
        updateNextDayFirstEvent() {
            const eventList = [];
            const nowTime = this.convertTimeZone(new Date(new Date().valueOf() + 86400000), 'Europe/London');
            for (const event of this.events) {
                if (event.details !== 'Coursework Deadline') {
                    const eventTime = this.convertTimeZone(event.start, 'Europe/London');
                    if (eventTime.getMonth() === nowTime.getMonth() && eventTime.getDate() === nowTime.getDate()) {
                        eventList.push(event);
                    }
                }
            }

            let firstEvent = null;
            for (const event of eventList) {
                if (firstEvent === null || firstEvent.start.valueOf() > event.start.valueOf()) {
                    firstEvent = event;
                }
            }
            this.$store.commit('setNextDayFirstEvent', firstEvent);
        },
        /**
         * Check if there is a location link in the details of an event and show the Google map if needed
         */
        showMap(details) {
            const lines = details.split('\n');
            for (const line of lines) {
                const linePart = line.split(': ').map((item) => item.trim());
                if (linePart[0] === 'Map Link' && linePart[1]) {
                    // Parse URL
                    let urlQuery;
                    try {
                        urlQuery = new URLSearchParams(new URL(linePart[1]).search);
                    } catch (e) { return ''; }
                    if (urlQuery.get('query_place_id') !== null) {
                        return `<iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAn46nX_pMvKfKcp5_Nqc4C3GCKj8CHJ7M&amp;q=place_id:${urlQuery.get('query_place_id')}" width="100%" height="300" frameborder="0" style="border:0;" allowfullscreen></iframe>`;
                    }
                    if (urlQuery.get('query') !== null) {
                        return `<iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAn46nX_pMvKfKcp5_Nqc4C3GCKj8CHJ7M&amp;q=${urlQuery.get('query')}" width="100%" height="300" frameborder="0" style="border:0;" allowfullscreen></iframe>`;
                    }
                }
            }
            return '';
        },
        /**
         * Map from subject ID to subject links
         * @param {string} subject subject ID
         * @returns {object} subject links, `object.homeLine`: string, `object.sessionLinks`: array
         */
        subjectLinks(id) {
            for (const subject of this.subjects) {
                if (subject.id === id) {
                    return {
                        homeLink: subject.homeLink,
                        sessionLinks: subject.sessionLinks,
                    };
                }
            }
            return {
                homeLink: false,
                sessionLinks: [],
            };
        },
        /**
         * Open the settings to set the first day of the week
         */
        setFirstDay() {
            this.setttingsDialog = true;
            this.editingFirstDay = this.firstDay;
        },
        /**
         * Save the first day of the week
         */
        saveFirstDay() {
            this.setttingsDialog = false;
            this.firstDay = this.editingFirstDay;
            this.store();
            this.updateCurrentDate();
        },
        dateText(date, day) {
            if (this.localeDetail) {
                return day === 1 ? window.uomaTimeFormatters.month.format(new Date(date)) : window.uomaTimeFormatters.day.format(new Date(date));
            }
            return day;
        },
        /**
         * Store settings
         */
        store() {
            localStorage.setItem('calendar', JSON.stringify({
                firstDay: this.firstDay,
                type: this.type,
            }));
        },
        /**
         * Generate week days list for selector
         * @returns {{ text: string, value: number }[]} week days list
         */
        weekDaysItems() {
            const base = new Date(1970, 0, 1).valueOf();
            return [0, 1, 2, 3, 4, 5, 6].map((item) => ({
                text: window.uomaTimeFormatters.date.formatToParts(new Date(base + 3600000 * 24 * (-4 + item))).find((part) => part.type === 'weekday').value,
                value: item,
            }));
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        subjects() {
            // Construct maps
            const subjectMap = {};
            const subjectLongMap = {};
            const colorMap = {};
            const subjectIdList = [];
            for (const subject of this.subjects) {
                subjectMap[subject.id] = subject.shortName;
                subjectLongMap[subject.id] = subject.name;
                colorMap[subject.id] = subject.color;
                subjectIdList.push(subject.id);
            }

            // Update subjects in courseworks' events
            for (const item of this.events) {
                if (item.details !== 'Coursework Deadline') {
                    const title = item.rawTitle;
                    const titleSplit = title.replace('_', '').split('/');
                    const titleName = titleSplit[0];
                    titleSplit.shift();
                    const titleRemain = `/${titleSplit.join('/')}`;
                    let color = colorMap[titleName] ? colorMap[titleName] : 'uomtheme';
                    if (item.selfStudy) {
                        color = 'colordark';
                    }

                    // Try to guess event name from event description
                    let guessedName = titleName;
                    if (!subjectMap[titleName]) {
                        const lines = item.details.split('\n').map((line) => line.trim().split(': ').map((part) => part.trim()));
                        const unitCode = lines.find((line) => line[0] === 'Unit Code');
                        if (unitCode !== undefined && unitCode[1] === titleName) {
                            const unitName = lines.find((line) => line[0] === 'Unit Description');
                            if (unitName !== undefined) {
                                guessedName = unitName[1];
                            }
                        }
                    }

                    item.name = `${subjectMap[titleName] ? subjectMap[titleName] : guessedName}${titleRemain}`;
                    item.color = color;
                    item.titleColor = colorMap[titleName] ? colorMap[titleName] : 'uomtheme';
                    item.subjectName = `${subjectLongMap[titleName] ? subjectLongMap[titleName] : ''}`;
                    item.subjectId = subjectIdList.includes(titleName) ? titleName : '';
                }
            }

            this.updateTodayEvents();
            this.updateNextDayFirstEvent();
        },
        timerMin() {
            // Check event change every minute
            this.$refs.calendar.updateTimes();
            this.$refs.calendar.checkChange();
        },
        timerHour() {
            // Update upcoming events every hour and refresh at 00:00
            this.updateTodayEvents();
            this.updateNextDayFirstEvent();

            if (this.timerHour.substr(0, 2) === '00') {
                this.refreshId = new Date().valueOf();
                this.updateCurrentDate();
                this.updateTime();
            }
        },
        courseworks() {
            // Update coursworks' events
            this.courseworkEvents = this.courseworks ? this.courseworks : [];
            this.events = this.classEvents.concat(this.courseworkEvents);
            this.$refs.calendar.checkChange();
            this.refreshId = new Date().valueOf();
        },
        type() {
            // Store changes
            this.store();
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            localeDetail: (state) => state.localeDetail,
            subjects: (state) => state.subjects,
            timerMin: (state) => state.timerMin,
            timerHour: (state) => state.timerHour,
            courseworks: (state) => state.tasks,
            backend: (state) => state.backend,
            backendStatus: (state) => state.backendStatus,
            account: (state) => state.account,
        }),
        /**
         * Get ISO locale for calendar
         * @returns {string} ISO locale string
         */
        calendarLocale() {
            return this.localeDetail === null ? 'en' : this.localeDetail.iso;
        },
        /**
         * Calculate week days
         * @returns {number[]} an array of week days
         */
        weekDays() {
            return [...Array(7)].map((item, index) => (index + this.firstDay) % 7);
        },
    },
    async mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Restore settings from localstorage
        const settings = JSON.parse(localStorage.getItem('calendar') || '{"firstDay":0,"type":"month"}');
        this.type = settings.type;
        this.firstDay = settings.firstDay;

        // Restore events from indexeddb
        const storaged = await localForage.getItem('calendar');
        if (storaged !== null) {
            this.events = storaged;
        }

        // Check if updating
        if ((localStorage.getItem('update_frontend') || 'false') !== 'true') {
            // Fetch events from backend
            this.$nextTick(() => {
                this.checkUpdate();
            });
        }

        // Update events every 6 hours
        this.updateTimer = setInterval(() => {
            this.checkUpdate();
        }, 21600000);

        this.updateCurrentDate();

        // Update timing pointer in day view every 20 seconds
        this.updatePointertimer = setInterval(() => {
            this.updateTime();
        }, 20000);

        this.updateTime();

        // Force refresh
        setTimeout(() => {
            this.refreshId = new Date().valueOf();
        }, 1000);
    },
    beforeDestroy() {
        clearInterval(this.updateTimer);
        clearInterval(this.updatePointertimer);
    },
};
</script>

<style lang="less">
.calendar-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
    contain: strict;
    .loading {
        margin-left: 10px;
    }
    .phb-11 {
        padding-left: 11px;
        padding-right: 11px;
        padding-bottom: 11px;
    }
    .event-block {
        pointer-events: none;
    }
    .event-block-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.6;
        background-color: white;
        pointer-events: none;
    }
    .v-calendar-weekly__week {
        button.v-btn.v-size--small {
            width: 35px;
            height: 35px;
            margin-bottom: 5px;
        }
    }
    .v-calendar-weekly__head {
        .v-calendar-weekly__head-weekday {
            padding-top: 5px;
        }
    }
    .theme--light.v-calendar-events .v-event-more {
        margin-left: 1px;
    }
    .v-calendar .v-event-timed-container {
        margin: 0;
    }
    .v-event.v-event-start.v-event-end {
        margin-left: 2.5%;
    }
    .v-current-time {
        height: 2px;
        background-color: #ea4335;
        position: absolute;
        left: -1px;
        right: 0;
        margin-top: -1px;
        pointer-events: none;
        &.first::before {
            content: '';
            position: absolute;
            background-color: #ea4335;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-top: -5px;
            margin-left: -6.5px;
        }
        &.week {
            opacity: .3;
        }
    }
    .v-calendar-daily__interval-text {
        top: -8px;
        padding-right: 2px;
    }
    .v-calendar-daily__interval {
        padding-right: 3px;
    }
    .v-calendar-daily__interval::after {
        width: 3px;
    }
    .v-btn.v-btn--has-bg.v-btn--round.v-size--default.primary {
        height: 50px;
        width: 50px;
        margin-top: 3px;
        margin-bottom: 3px;
    }
}
.event-card-container {
    overflow-x: auto;
    background-color: white;
    min-width: fit-content!important;
    .event-card {
        width: fit-content;
        max-width: fit-content;
        .calendar-selected-name {
            line-height: 17px;
            padding-top: 3px;
            .calendar-smaller-font {
                font-size: 0.875rem;
            }
        }
        .list {
            margin-bottom: 20px;
            background-color: #f3f3f3;
            border-radius: 6px;
            max-width: 800px;
            .v-list-item {
                cursor: default;
                min-height: 28px;
            }
            a {
                cursor: pointer;
                text-decoration: none;
                &:hover, &:focus {
                    text-decoration: underline;
                }
            }
            a.no-underline-link {
                text-decoration: none;
                padding-left: 5px;
            }
            .v-list-item__content {
                padding: 0;
            }
            .copy {
                margin: 0;
                margin-left: 8px!important;
                .v-btn {
                    font-family: 'Roboto Mono', Consolas, "Liberation Mono", Courier, "Courier New", Monaco, "Courier New SC", "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", monospace;
                    margin-right: -4px;
                    position: relative;
                    .v-icon--left {
                        margin-right: 4px;
                    }
                    .showing {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        flex: 1 0 auto;
                        justify-content: inherit;
                    }
                }
            }
        }
        .v-card__text {
            width: fit-content;
            min-width: 350px;
            pre {
                font-family: Roboto, -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
            }
        }
    }
}
.v-menu__content.full-screen-menu {
    position: fixed;
    top: 0!important;
    left: 0!important;
    max-width: 100vw;
    width: 100vw;
    height: 100%;
    border-radius: 0!important;
    .event-card {
        border-radius: 0;
        height: 100%;
        overflow: auto;
        overscroll-behavior: contain;
        .v-card__text {
            width: 100%;
            pre {
                white-space: pre-wrap;
                word-break: break-word;
            }
        }
        .v-toolbar {
            top: 0;
            left: 0;
            width: 100vw;
            z-index: 10;
        }
    }
}
#app.theme--dark .event-card-container {
    background-color: #1E1E1E;
    .event-card {
        .list {
            background-color: #2c2c2c;
        }
        .v-toolbar {
            background-color: #1E1E1E!important;
        }
    }
}
#app.theme--dark .v-calendar-events .v-event-more {
    margin-left: 1px;
}
#app.theme--dark .calendar-container {
    .event-block-overlay {
        background-color: #303030;
    }
    .theme--dark.v-toolbar.v-sheet {
        background-color: #1E1E1E;
    }
}
</style>

<i18n src="../locales/network.json"></i18n>
<i18n>
{
    "en": {
        "today": "Today",
        "day": "Day",
        "week": "Week",
        "month": "Month",
        "course_ddl": "Coursework Deadline",
        "coursework": "Coursework",
        "subject_home": "Course Unit Home Page",
        "network_error_body": "Cannot fetch latest events from calendar subscription URL",
        "quick_zoom": "Zoom meeting quick start",
        "quick_teams": "Teams meeting quick start",
        "copy_passcode": "Copy passcode",
        "self_study": " (Independent Study)",
        "ical_error": "Error when parsing the calendar file",
        "error_at": "{0} at {1}",
        "first_day_settings": "First day of weeks",
        "cancel": "Cancel",
        "save": "Save"
    },
    "zh": {
        "today": "今天",
        "day": "日视图",
        "week": "周视图",
        "month": "月视图",
        "course_ddl": "作业到期",
        "coursework": "作业",
        "subject_home": "科目主页",
        "network_error_body": "无法从日历订阅 URL 获取最新事件",
        "quick_zoom": "快速启动 Zoom 会议",
        "quick_teams": "快速启动 Teams 会议",
        "copy_passcode": "复制密码",
        "self_study": "（自学）",
        "ical_error": "解析日历文件时发生错误",
        "error_at": "{0} 于 {1}",
        "first_day_settings": "每周第一天",
        "cancel": "取消",
        "save": "保存"
    },
    "es": {
        "today": "Hoy",
        "day": "Día",
        "week": "Semana",
        "month": "Mes",
        "course_ddl": "Fecha límite para trabajo de asignatura",
        "coursework": "Trabajo de asignatura",
        "subject_home": "Página principal de asignatura",
        "network_error_body": "No ha sido posible obtener los últimos eventos desde la subscripción del calendario.",
        "quick_zoom": "Acceder a Zoom",
        "quick_teams": "Acceder a Teams",
        "copy_passcode": "Copiar contraseña",
        "self_study": " (Autoestudio)",
        "ical_error": "Error al analizar el archivo de calendario",
        "error_at": "{0} en {1}",
        "first_day_settings": "",
        "cancel": "",
        "save": ""
    },
    "ja": {
        "today": "今日",
        "day": "日",
        "week": "周",
        "month": "月",
        "course_ddl": "課題の締め切り",
        "coursework": "課題",
        "subject_home": "科目ホームページ",
        "network_error_body": "カレンダー購読のURLから最新予定表の情報を取得できません。",
        "quick_zoom": "Zoomミーティングを起動する",
        "quick_teams": "Teamsミーティングを起動する",
        "copy_passcode": "パスワードをコピーする",
        "self_study": "（独学）",
        "ical_error": "icalファイル解析不能",
        "error_at": "{1} に {0} 発生",
        "first_day_settings": "毎週の初日",
        "cancel": "キャンセル",
        "save": "保存"
    }
}
</i18n>

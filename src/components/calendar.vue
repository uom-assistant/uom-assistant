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
                            v-shortkey="['alt', 'home']"
                            @shortkey="$route.path === '/' ? (() => { focus = '' })() : null"
                        >
                            {{ $t('today') }}
                        </v-btn>
                        <v-btn
                            icon
                            max-width="36"
                            max-height="36"
                            class="mr-1"
                            @click="prev"
                            v-shortkey="['alt', 'pageup']"
                            @shortkey="$route.path === '/' ? prev() : null"
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
                            v-shortkey="['alt', 'pagedown']"
                            @shortkey="$route.path === '/' ? next() : null"
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
                                <v-list-item @click="type = 'custom-daily'">
                                    <v-list-item-title>{{ $t('custom-daily') }}</v-list-item-title>
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
                        :events="allEvents"
                        :event-color="getEventColor"
                        :type="type"
                        :locale="calendarLocale"
                        :weekdays="weekDays"
                        :key="`calendar-${refreshId}-${rerender}`"
                        :interval-height="40"
                        :interval-width="48"
                        :interval-format="intervalFormat"
                        :start="type === 'custom-daily' ? (customStart || undefined) : undefined"
                        :end="type === 'custom-daily' ? (customEnd || undefined) : undefined"
                        @click:event="showEvent"
                        @click:more="viewDay"
                        @click:date="viewDay"
                        @change="updateRange"
                    >
                        <template v-slot:day-body="{ date, week }">
                            <div
                                class="v-current-time"
                                :class="{
                                    first: (date === week[0].date && type === 'day') || (date === currentDate && (type === 'week' || type === 'custom-daily')),
                                    week: date !== currentDate && (type === 'week' || type === 'custom-daily'),
                                }"
                                :style="{ top: nowY }"
                            ></div>
                        </template>
                        <template v-slot:day-label="{ date, day, present }">
                            <v-badge
                                overlap
                                dot
                                bordered
                                offset-x="10"
                                offset-y="10"
                                v-if="new Date(date).getTimezoneOffset() != new Date(new Date(date).valueOf() + 24 * 3600000).getTimezoneOffset()"
                            >
                                <v-tooltip top max-width="200">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            fab
                                            small
                                            depressed
                                            :color="present ? 'primary' : 'transparent'"
                                            @click="viewDay({ date })"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                            {{ dateText(date, day) }}
                                        </v-btn>
                                    </template>
                                    <span>{{ $t((new Date(date).getTimezoneOffset() - new Date(new Date(date).valueOf() + 24 * 3600000).getTimezoneOffset() > 0 ? 'clock_change_pos' : 'clock_change_neg'), [Math.abs(new Date(date).getTimezoneOffset() - new Date(new Date(date).valueOf() + 24 * 3600000).getTimezoneOffset())]) }}</span>
                                </v-tooltip>
                            </v-badge>
                            <v-btn
                                fab
                                small
                                depressed
                                :color="present ? 'primary' : 'transparent'"
                                @click="viewDay({ date })"
                                v-else
                            >
                                {{ dateText(date, day) }}
                            </v-btn>
                        </template>
                        <template v-slot:day-label-header="{ date, day, present }">
                            <v-badge
                                overlap
                                dot
                                bordered
                                offset-x="12"
                                offset-y="12"
                                v-if="new Date(date).getTimezoneOffset() != new Date(new Date(date).valueOf() + 24 * 3600000).getTimezoneOffset()"
                            >
                                <v-tooltip top max-width="200">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            fab
                                            :x-small="$vuetify.breakpoint.xs"
                                            :small="!$vuetify.breakpoint.xs"
                                            class="my-1"
                                            depressed
                                            :color="present ? 'primary' : 'transparent'"
                                            @click="viewDay({ date })"
                                            v-on="on"
                                            v-bind="attrs"
                                        >
                                            {{ dateText(date, day) }}
                                        </v-btn>
                                    </template>
                                    <span>{{ $t((new Date(date).getTimezoneOffset() - new Date(new Date(date).valueOf() + 24 * 3600000).getTimezoneOffset() > 0 ? 'clock_change_pos' : 'clock_change_neg'), [Math.abs(new Date(date).getTimezoneOffset() - new Date(new Date(date).valueOf() + 24 * 3600000).getTimezoneOffset())]) }}</span>
                                </v-tooltip>
                            </v-badge>
                            <v-btn
                                fab
                                :x-small="$vuetify.breakpoint.xs"
                                :small="!$vuetify.breakpoint.xs"
                                class="my-1"
                                depressed
                                :color="present ? 'primary' : 'transparent'"
                                @click="viewDay({ date })"
                                v-else
                            >
                                {{ dateText(date, day) }}
                            </v-btn>
                        </template>
                        <template v-slot:event="{ timeSummary, event, day }">
                            <div
                                class="pl-1 event-block"
                                :class="{ 'text--disabled': event.selfStudy, holiday: event.holiday }"
                                v-html="getEventSummary(timeSummary(), event)"
                            >
                            </div>
                            <div
                                class="event-block-overlay"
                                v-if="!event.holiday"
                                :style="{
                                    width: type === 'day' || type === 'week' || type === 'custom-daily' ? '100%' : getEevntPercentage(event.start, event.end, day),
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
                            :class="$vuetify.breakpoint.xs ? 'd-flex flex-column' : ''"
                            min-width="350px"
                            flat
                        >
                            <v-toolbar
                                :class="$vuetify.breakpoint.xs ? 'flex-grow-0' : ''"
                                color="#ffffff"
                                height="64"
                                flat
                            >
                                <v-toolbar-title :class="selectedEvent.titleColor ? `${selectedEvent.titleColor.split(' ')[0] === 'uomtheme' ? 'primary' : selectedEvent.titleColor.split(' ')[0]}--text${selectedEvent.titleColor.split(' ').length > 1 ? ` text--${selectedEvent.titleColor.split(' ')[1]}` : ''}` : ''" class="calendar-selected-name">
                                    {{ selectedEvent.details === 'Coursework Deadline' ? selectedEvent.name : (selectedEvent.holiday ? selectedEvent.name : selectedEvent.subjectName === '' ? selectedEvent.name.split('/')[0] : selectedEvent.subjectName) }}<br>
                                    <span class="text--disabled calendar-smaller-font mt-1 d-inline-block"><span class="session-tag rounded" :class="selectedEvent.titleColor ? `${selectedEvent.titleColor.split(' ')[0] === 'uomtheme' ? 'primary' : selectedEvent.titleColor.split(' ')[0]}${selectedEvent.titleColor.split(' ').length > 1 ? ` ${selectedEvent.titleColor.split(' ')[1]}` : ''}` : ''" v-if="selectedEvent.selfStudy || selectedEvent.online || selectedEvent.lab || selectedEvent.team || selectedEvent.dropin"><v-icon x-small v-if="selectedEvent.online || selectedEvent.lab || selectedEvent.team || selectedEvent.dropin">mdi-{{ selectedEvent.online ? 'broadcast' : (selectedEvent.team ? 'account-multiple' : (selectedEvent.lab ? 'flask-empty-outline' : 'walk')) }}</v-icon>{{ selectedEvent.selfStudy ? $t('self_study') : (selectedEvent.online ? $t('online') : (selectedEvent.team ? $t('team_study') : (selectedEvent.lab ? 'Lab' : 'Drop-in'))) }}</span>{{ selectedEvent.details === 'Coursework Deadline' ? (selectedEvent.subjectName === '' ? $t('coursework') : selectedEvent.subjectName) : (selectedEvent.holiday ? $t('holiday') : selectedEvent.rawTitle) }}</span>
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
                                    <v-icon>mdi-close</v-icon>
                                </v-btn>
                            </v-toolbar>
                            <v-card-text :class="$vuetify.breakpoint.xs ? 'flex-grow-0' : ''">
                                <div class="detail-flex">
                                    <v-icon>mdi-clock-outline</v-icon>
                                    <span v-if="currentTimeZone === 'Europe/London'">
                                        <span v-if="selectedEvent.holiday">
                                            {{ selectedEvent.start ? getDateOnly(selectedEvent.start) : '' }}<span v-if="selectedEvent.start && selectedEvent.end && getDateOnly(selectedEvent.start) !== getDateOnly(selectedEvent.end)">-{{ getDateOnly(selectedEvent.end) }}</span><br>
                                        </span>
                                        <span v-else-if="selectedEvent.details !== 'Coursework Deadline'">
                                            {{ selectedEvent.start ? getDate(selectedEvent.start, false) : '' }}{{ selectedEvent.start && selectedEvent.end ? ' – ' : '' }}{{ selectedEvent.end ? getDate(selectedEvent.end, false) : '' }}<br>
                                        </span>
                                        <span v-else>
                                            {{ selectedEvent.start ? getDate(selectedEvent.start, false) : '' }}<br>
                                        </span>
                                    </span>
                                    <span v-else>
                                        <span v-if="selectedEvent.holiday">
                                            {{ selectedEvent.start ? getDateOnly(selectedEvent.start) : '' }}<span v-if="selectedEvent.start && selectedEvent.end && getDateOnly(selectedEvent.start) !== getDateOnly(selectedEvent.end)">-{{ getDateOnly(selectedEvent.end) }}</span>{{ $t('uk_time') }}<br>
                                        </span>
                                        <span v-else-if="selectedEvent.details !== 'Coursework Deadline'">
                                            {{ selectedEvent.start ? getDate(selectedEvent.start, false) : '' }}{{ selectedEvent.start && selectedEvent.end ? ' – ' : '' }}{{ selectedEvent.end ? getDate(selectedEvent.end, false) : '' }}{{ $t('local_time') }}<br>
                                            {{ selectedEvent.start ? getDate(convertTimeZone(selectedEvent.start), false) : '' }}{{ selectedEvent.start && selectedEvent.end ? ' – ' : '' }}{{ selectedEvent.end ? getDate(convertTimeZone(selectedEvent.end), false) : '' }}{{ $t('uk_time') }}<br>
                                        </span>
                                        <span v-else>
                                            {{ selectedEvent.start ? getDate(selectedEvent.start, false) : '' }}{{ $t('local_time') }}<br>
                                            {{ selectedEvent.start ? getDate(convertTimeZone(selectedEvent.start), false) : '' }}{{ $t('uk_time') }}<br>
                                        </span>
                                    </span>
                                </div>
                                <div class="detail-flex mt-1" v-if="checkDetail('location', selectedEvent.details)">
                                    <v-icon class="bigger">mdi-map-marker-outline</v-icon>
                                    <span>
                                        {{ showLocation(selectedEvent.details) }}
                                        <span v-if="checkDetail('directions', selectedEvent.details)">
                                            <br>{{ showDirections(selectedEvent.details) }}
                                        </span>
                                    </span>
                                </div>
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
                                <div class="detail-flex">
                                    <v-icon>mdi-calendar-text-outline</v-icon>
                                    <pre v-html="selectedEvent.details === 'Coursework Deadline' ? $t('course_ddl') : linkify(selectedEvent.details)"></pre>
                                </div>
                            </v-card-text>
                            <div v-html="showMap(selectedEvent.details)" v-if="(!selectedEvent.details || selectedEvent.details !== 'Coursework Deadline') && checkDetail('map link', selectedEvent.details)" class="map-container flex-shrink-0" :class="$vuetify.breakpoint.xs ? 'flex-grow-1' : ''"></div>
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
                    {{ $t('calendar_settings') }}
                </v-card-title>
                <v-card-text class="pb-0">
                    <v-select
                        v-model="editingFirstDay"
                        :items="weekDaysItems()"
                        :label="$t('first_day_settings')"
                        hide-details
                        dense
                        outlined
                        class="mt-3"
                    ></v-select>
                     <v-list flat multiple>
                        <v-list-item-group v-model="holidaySetting">
                            <v-list-item class="pa-0" :ripple="false">
                                <template v-slot:default="{ active }">
                                    <v-list-item-content>
                                        <v-list-item-title class="mt-1 d-flex align-center a11y-title">{{ $t('uk_holiday') }}</v-list-item-title>
                                    </v-list-item-content>
                                    <v-list-item-action>
                                        <v-switch :input-value="active"></v-switch>
                                    </v-list-item-action>
                                </template>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
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

import formatDate from '@/tools/formatDate';
import formatDateTime from '@/tools/formatDateTime';
import betterFetch from '@/tools/betterFetch';
import escapeHTML from '@/tools/escapeHTML';

const timezoneConverter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/London',
});

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
            nowDate: new Date().getDate(),
            currentTimeZone: 'Europe/London',
            holiday: [],
            holidaySetting: undefined,
            showHoliday: false,
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
            if (this.type === 'custom-daily') {
                this.focus = this.getISODate(new Date((this.focus ? new Date(this.focus) : new Date()).valueOf() - 24 * 3600 * 1000));
            } else {
                this.$refs.calendar.prev();
            }
        },
        /**
         * Move the calendar a page forward
         */
        next() {
            if (this.type === 'custom-daily') {
                this.focus = this.getISODate(new Date((this.focus ? new Date(this.focus) : new Date()).valueOf() + 24 * 3600 * 1000));
            } else {
                this.$refs.calendar.next();
            }
        },
        /**
         * Show the detail card for an event
         * @param {object} events click event and the selected event
         * @param {Event} events.nativeEvent event object
         * @param {object} events.event event object
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
                if (this.type === 'day' || this.type === 'week' || this.type === 'custom-daily') {
                    this.updateTime();
                    if (this.$refs.calendar) {
                        const todayObj = new Date();
                        if ((this.type === 'day' && this.today === this.currentDate) || (this.type === 'week' && this.today === this.currentWeekStart) || (this.type === 'custom-daily' && (this.today === this.getISODate(new Date(todayObj.valueOf() - 2 * 24 * 3600 * 1000)) || this.today === this.getISODate(todayObj) || this.today === this.getISODate(new Date(todayObj.valueOf() - 24 * 3600 * 1000))))) {
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
            } else if (this.type === 'custom-daily') {
                const todayObj = new Date();
                if ((this.today === this.getISODate(new Date(todayObj.valueOf() - 2 * 24 * 3600 * 1000)) || this.today === this.getISODate(todayObj) || this.today === this.getISODate(new Date(todayObj.valueOf() - 24 * 3600 * 1000))) && this.$refs.calendar && this.$refs.calendar.timeToY) {
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
            this.currentDate = this.getISODate(todayObj);
            this.currentWeekStart = this.getISODate(thisWeekStartFromObj);
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
            return typeof text === 'string' ? linkifyStr(text.trim(), {
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
                }),
            }, true).catch(() => {
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

            this.events.splice(0);
            this.classEvents.splice(0);

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
                                const unitName = lines.find((line) => line[0] === 'Description');
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
                            online: item[1][0][3].toUpperCase().includes('EVENT TYPE: ONLINE LECTURE'),
                            lab: item[1][0][3].toUpperCase().includes('EVENT TYPE: LABORATORY'),
                            team: item[1][0][3].toUpperCase().includes('EVENT TYPE: TEAM STUDY'),
                            dropin: item[1][0][3].toUpperCase().includes('EVENT TYPE: DROP-IN'),
                            holiday: false,
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

            this.checkHolidayUpdate();
        },
        /**
         * Update holiday from backend
         */
        async checkHolidayUpdate(tryCount = 1) {
            if (!this.backend.url || !this.account.calendar) {
                return;
            }
            this.loading = true;
            let requestFailed = false;
            // Send request
            const response = await betterFetch(`https://${this.backend.url}/calendar/holiday/`, {
                method: 'GET',
            }, true).catch(() => {
                if (tryCount < 2) {
                    // Retry
                    setTimeout(() => {
                        this.checkHolidayUpdate(tryCount + 1);
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

            this.holiday.splice(0);

            // Update events
            for (const item of rawData[2]) {
                if (item[0] === 'vevent') {
                    const startTime = new Date(`${item[1][0][3]}T00:00:00`);
                    // Get event title, adapted to events with locations
                    const title = item[1][10][3].replace(/\(England\)$/g, '').replace(/\(regional holiday\)$/g, '');

                    if (title !== 'Daylight Saving Time ends' && title !== 'Daylight Saving Time starts' && (!title.endsWith(')' || title.endsWith('(England)') || title.endsWith('(regional holiday)')))) {
                        const event = {
                            name: title,
                            details: item[1][6][3].startsWith('Observance') ? 'Public holiday' : item[1][6][3],
                            start: startTime,
                            end: new Date(new Date(`${item[1][1][3]}T00:00:00`).valueOf() - 1),
                            color: 'teal darken-2',
                            titleColor: 'teal darken-2',
                            timed: false,
                            rawTitle: title,
                            subjectName: false,
                            subjectId: false,
                            selfStudy: false,
                            online: false,
                            lab: false,
                            team: false,
                            holiday: true,
                        };
                        this.holiday.push(event);
                    }
                }
            }
            await localForage.setItem('calendar_holiday', this.holiday);

            // Refresh calendar
            this.loading = false;
            this.updateTime();
            if (this.$refs.calendar) {
                this.$refs.calendar.checkChange();
            }
            this.refreshId = new Date().valueOf();
        },
        /**
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @param {boolean} seconds whether to show seconds
         * @returns {string} formatted date string
         */
        getDate(dateObj, seconds = true) {
            return formatDateTime(dateObj, this.locale, window.uomaTimeFormatters, seconds);
        },
        /**
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @param {boolean} seconds whether to show seconds
         * @returns {string} formatted date string
         */
        getDateOnly(dateObj) {
            return formatDate(dateObj, this.locale, window.uomaTimeFormatters, false, 'auto');
        },
        /**
         * Format a date object to a ISO date string
         * @param {Date} dateObj Date object
         * @returns {string} formatted date string
         */
        getISODate(dateObj) {
            return `${dateObj.getFullYear()}-${`${dateObj.getMonth() + 1}`.padStart(2, '0')}-${`${dateObj.getDate()}`.padStart(2, '0')}`;
        },
        /**
         * Convert a Date object to a specified time zone
         * @param {Date} date Date object
         * @returns {Date} a new Date object that has converted to the specified time zone
         */
        convertTimeZone(date) {
            return new Date(timezoneConverter.format(date));
        },
        /**
         * Update and broadcast today's events
         */
        updateTodayEvents() {
            const eventList = [];
            const nowTime = this.convertTimeZone(new Date());
            for (const event of this.events) {
                if (event.details !== 'Coursework Deadline') {
                    const eventTime = this.convertTimeZone(event.start);
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
            const nowTime = this.convertTimeZone(new Date(new Date().valueOf() + 86400000));
            for (const event of this.events) {
                if (event.details !== 'Coursework Deadline') {
                    const eventTime = this.convertTimeZone(event.start);
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
         * @returns {string} map iframe string or empty string
         */
        showMap(details) {
            const lines = details.split('\n');
            for (const line of lines) {
                const linePart = line.split(': ').map((item) => item.trim());
                if (linePart[0].toLowerCase() === 'map link' && /^\[Google Maps\]\(/.test(linePart[1])) {
                    // Parse URL
                    let urlQuery;
                    try {
                        urlQuery = new URLSearchParams(new URL(linePart[1].slice(14, -1)).search);
                    } catch (e) { return ''; }
                    if (urlQuery.get('query_place_id') !== null) {
                        return `<iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAn46nX_pMvKfKcp5_Nqc4C3GCKj8CHJ7M&amp;q=place_id:${urlQuery.get('query_place_id')}" frameborder="0" style="border:0;" allowfullscreen></iframe>`;
                    }
                    if (urlQuery.get('query') !== null) {
                        return `<iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAn46nX_pMvKfKcp5_Nqc4C3GCKj8CHJ7M&amp;q=${urlQuery.get('query')}" frameborder="0" style="border:0;" allowfullscreen></iframe>`;
                    }
                }
            }
            return '';
        },
        /**
         * Check if there is a location string in the details of an event and show it
         * @returns {string} location string or empty string
         */
        showLocation(details) {
            const lines = details.split('\n');
            for (const line of lines) {
                const linePart = line.split(': ').map((item) => item.trim());
                if (linePart[0].toLowerCase() === 'location' && linePart[1]) {
                    let location = linePart[1];

                    if (linePart[1].includes('_')) {
                        const parts = linePart[1].split('_');
                        const building = parts.shift();
                        const room = parts.join('_');
                        location = `${room}, ${building}`;
                    }

                    return location;
                }
            }
            return '';
        },
        /**
         * Check if there is a direction string in the details of an event and show it
         * @returns {string} direction string or empty string
         */
        showDirections(details) {
            const lines = details.split('\n');
            for (const line of lines) {
                const linePart = line.split(': ').map((item) => item.trim());
                if (linePart[0].toLowerCase() === 'directions' && linePart[1]) {
                    if (linePart[1].indexOf('.') === linePart[1].length - 1 || linePart[1].indexOf(',') === -1 || linePart[1].indexOf(';') === -1) {
                        return linePart[1].slice(0, -1);
                    }
                    return linePart[1];
                }
            }
            return '';
        },
        /**
         * Check if there is a line of required attribute in the details of an event
         * @returns {boolean} true if there is a line of required attribute
         */
        checkDetail(attr, details) {
            if (typeof details !== 'string') {
                return false;
            }
            if (details === 'Coursework Deadline') {
                return false;
            }
            const lines = details.split('\n');
            for (const line of lines) {
                const linePart = line.split(': ').map((item) => item.trim());
                if (linePart[0].toLowerCase() === attr && linePart[1]) {
                    return true;
                }
            }
            return false;
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
         * Get the summary of an event
         * @param {string} time event time string
         * @param {object} event event object
         * @returns {string} HTML summary
         */
        getEventSummary(time, event) {
            const iconStr = `${event.online ? '<i class="v-icon notranslate mdi mdi-broadcast"></i>' : ''}${event.lab ? '<i class="v-icon notranslate mdi mdi-flask-empty-outline"></i>' : ''}${event.team ? '<i class="v-icon notranslate mdi mdi-account-multiple"></i>' : ''}${event.holiday ? '<i class="v-icon notranslate mdi mdi-palm-tree"></i>' : ''}${event.dropin ? '<i class="v-icon notranslate mdi mdi-walk"></i>' : ''}`;
            if (event.holiday) {
                return `<span class="v-event-summary">${iconStr}${escapeHTML(event.name)}</span>`;
            }
            if (this.type === 'month') {
                return `<span class="v-event-summary"><strong>${time.split('-')[0].trim()}</strong> ${iconStr}${escapeHTML(event.name)}</span>`;
            }
            if (event.end && event.end.valueOf() - event.start.valueOf() >= 3600 * 1000) {
                return `<span class="v-event-summary">${iconStr}<strong>${escapeHTML(event.name)}</strong><br>${time}</span>`;
            }
            return `<span class="v-event-summary">${iconStr}<strong>${escapeHTML(event.name)}</strong>, ${time}</span>`;
        },
        /**
         * Open the settings to set the first day of the week
         */
        setFirstDay() {
            this.setttingsDialog = true;
            this.editingFirstDay = this.firstDay;
            this.holidaySetting = this.showHoliday ? 0 : undefined;
        },
        /**
         * Save the first day of the week
         */
        saveFirstDay() {
            this.setttingsDialog = false;
            this.firstDay = this.editingFirstDay;
            this.showHoliday = this.holidaySetting === 0;
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
                holiday: this.showHoliday,
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
        /**
         * Format calendar interval
         * @returns {string} formatted interval
         */
        intervalFormat(interval) {
            return `${interval.hour > 12 ? interval.hour - 12 : interval.hour} ${interval.hour >= 12 ? 'PM' : 'AM'}`;
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
            if (this.timerMin !== '00') {
                requestIdleCallback(() => {
                    this.updateCurrentDate();
                    this.updateTime();
                    this.$refs.calendar.checkChange();
                }, { timeout: 3000 });
            }
        },
        timerHour() {
            // Update upcoming events every hour and refresh at 00:00
            this.updateTodayEvents();
            this.updateNextDayFirstEvent();

            if (this.timerHour.substr(0, 2) === '00' || new Date().getDate() !== this.nowDate) {
                this.nowDate = new Date().getDate();
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
            rerender: (state) => state.rerender,
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
        customStart() {
            return (this.focus ? new Date(this.focus).valueOf() : new Date().valueOf()) - 24 * 3600 * 1000;
        },
        customEnd() {
            return this.customStart + 2 * 24 * 3600 * 1000;
        },
        allEvents() {
            return this.showHoliday ? [...this.events, ...this.holiday] : this.events;
        },
    },
    async mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Restore settings from localstorage
        const settings = JSON.parse(localStorage.getItem('calendar') || '{"firstDay":0,"type":"month"}');
        this.type = settings.type;
        this.firstDay = settings.firstDay;
        if (settings.holiday !== false) {
            this.showHoliday = true;
            this.holidaySetting = 0;
        }

        // Restore events from indexeddb
        const storaged = await localForage.getItem('calendar');
        if (storaged !== null) {
            this.events = storaged;
        }
        const storagedHoliday = await localForage.getItem('calendar_holiday');
        if (storagedHoliday !== null) {
            this.holiday = storagedHoliday;
        }

        // Check if updating
        if ((localStorage.getItem('update_frontend') || 'false') !== 'true') {
            // Fetch events from backend
            this.$nextTick(() => {
                this.checkUpdate();
            });
        }

        // Check current timezone
        this.currentTimeZone = window.uomaTimeFormatters.date.resolvedOptions().timeZone;

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
    div[data-date]:not(.v-event):not(.v-event-more) {
        display: none;
    }
    .loading {
        margin-left: 10px;
    }
    .phb-11 {
        padding-left: 11px;
        padding-right: 11px;
        padding-bottom: 11px;
    }
    .v-calendar-daily_head-day .v-event {
        width: calc(100% - 2px)!important;
        margin-left: 1px!important;
    }
    .event-block {
        pointer-events: none;
        &.holiday {
            background-color: #FFFFFF;
            border: 1px solid #00897B;
            height: 100%;
            border-radius: 4px;
            color: #00897B;
            line-height: 19px;
            .v-event-summary .v-icon {
                margin: 2px 4px 0 2px;
            }
        }
    }
    .v-outside .event-block {
        &.holiday {
            background-color: #F7F7F7;
        }
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
    .v-event-summary {
        .v-icon {
            font-size: 14px;
            margin: 3px 4px 0 2px;
            float: right;
        }
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
        padding-right: 5px;
    }
    .v-calendar-daily__interval {
        padding-right: 3px;
    }
    .v-calendar-daily__interval::after {
        width: 4px;
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
        .session-tag {
            font-size: 12px;
            padding: 1px 5px;
            color: white;
            margin-right: 4px;
            margin-top: -1px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            .v-icon {
                font-size: 12px;
                margin-right: 3px;
                color: white;
            }
        }
        .list {
            margin-bottom: 20px;
            background-color: #f3f3f3;
            border-radius: 6px;
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
                    font-family: "Roboto Mono", Consolas, "Liberation Mono", Courier, "Courier New", Monaco, "Courier New SC", "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", monospace;
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
            max-width: 70vw;
            pre {
                font-family: Roboto, -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif;
                white-space: pre-wrap;
                width: max-content;
            }
        }
        .map-container {
            min-height: 300px;
            line-height: 0;
            margin-top: 3px;
            background-color: rgba(127, 127, 127, .2);
            position: relative;
            iframe {
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
            }
        }
        .detail-flex {
            display: flex;
            align-items: flex-start;
            i {
                margin-right: 8px;
                font-size: 19px;
                &.bigger {
                    margin-left: -1px;
                    margin-right: 7px;
                    font-size: 20px;
                }
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
            max-width: 100%;
            pre {
                white-space: pre-wrap;
                word-break: break-word;
                width: 100%;
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
        .map-container {
            filter: brightness(0.85);
        }
        .session-tag.primary {
            color: #1E1E1E;
            i {
                color: #1E1E1E;
            }
        }
    }
}
#app.theme--dark .v-calendar-events .v-event-more {
    margin-left: 1px;
}
#app.theme--dark .calendar-container {
    .event-block {
        &.holiday {
            background-color: #303030;
        }
    }
    .v-outside .event-block {
        &.holiday {
            background-color: #202020;
        }
    }
    .event-block-overlay {
        background-color: #303030;
    }
    .theme--dark.v-toolbar.v-sheet {
        background-color: #1E1E1E;
    }
    .v-badge__badge::after {
        border-color: #303030;
    }
}
</style>

<i18n src="../locales/network.json"></i18n>
<i18n>
{
    "en": {
        "today": "Today",
        "day": "Day",
        "custom-daily": "3 Days",
        "week": "Week",
        "month": "Month",
        "course_ddl": "Coursework Deadline",
        "coursework": "Coursework",
        "subject_home": "Course Unit Home Page",
        "network_error_body": "Cannot fetch latest events from calendar subscription URL",
        "quick_zoom": "Zoom meeting quick start",
        "quick_teams": "Teams meeting quick start",
        "copy_passcode": "Copy passcode",
        "self_study": "Indep. Study",
        "online": "Online",
        "team_study": "Team Study",
        "ical_error": "Error when parsing the calendar file",
        "error_at": "{0} at {1}",
        "calendar_settings": "Calendar settings",
        "first_day_settings": "First day of weeks",
        "cancel": "Cancel",
        "save": "Save",
        "clock_change_pos": "Clock changes on this day. Go forward {0} minutes.",
        "clock_change_neg": "Clock changes on this day. Go back {0} minutes.",
        "local_time": " (local)",
        "uk_time": " (UK)",
        "holiday": "Holiday",
        "uk_holiday": "Show England holidays"
    },
    "zh": {
        "today": "今天",
        "day": "日视图",
        "custom-daily": "三日视图",
        "week": "周视图",
        "month": "月视图",
        "course_ddl": "作业到期",
        "coursework": "作业",
        "subject_home": "科目主页",
        "network_error_body": "无法从日历订阅 URL 获取最新事件",
        "quick_zoom": "快速启动 Zoom 会议",
        "quick_teams": "快速启动 Teams 会议",
        "copy_passcode": "复制密码",
        "self_study": "自学",
        "online": "在线",
        "team_study": "团队学习",
        "ical_error": "解析日历文件时发生错误",
        "error_at": "{0} 于 {1}",
        "calendar_settings": "日历设置",
        "first_day_settings": "每周第一天",
        "cancel": "取消",
        "save": "保存",
        "clock_change_pos": "当日有时钟变更。前进 {0} 分钟。",
        "clock_change_neg": "当日有时钟变更。后退 {0} 分钟。",
        "local_time": "（本地）",
        "uk_time": "（英国）",
        "holiday": "假期",
        "uk_holiday": "显示英格兰假期"
    },
    "es": {
        "today": "Hoy",
        "day": "Día",
        "custom-daily": "",
        "week": "Semana",
        "month": "Mes",
        "course_ddl": "Fecha límite para trabajo de asignatura",
        "coursework": "Trabajo de asignatura",
        "subject_home": "Página principal de asignatura",
        "network_error_body": "No ha sido posible obtener los últimos eventos desde la subscripción del calendario.",
        "quick_zoom": "Acceder a Zoom",
        "quick_teams": "Acceder a Teams",
        "copy_passcode": "Copiar contraseña",
        "self_study": "Autoestudio",
        "online": "",
        "team_study": "",
        "ical_error": "Error al analizar el archivo de calendario",
        "error_at": "{0} en {1}",
        "calendar_settings": "",
        "first_day_settings": "Primer día de la semana",
        "cancel": "Cancelar",
        "save": "Guardar",
        "clock_change_pos": "Cambio de hora en este día. Avanza {0} minutos.",
        "clock_change_neg": "Cambio de hora en este día. Retrocede {0} minutos.",
        "local_time": " (local)",
        "uk_time": " (Reino Unido)",
        "holiday": "",
        "uk_holiday": ""
    },
    "ja": {
        "today": "今日",
        "day": "日",
        "custom-daily": "",
        "week": "周",
        "month": "月",
        "course_ddl": "課題の締め切り",
        "coursework": "課題",
        "subject_home": "科目ホームページ",
        "network_error_body": "カレンダー購読のURLから最新予定表の情報を取得できません。",
        "quick_zoom": "Zoomミーティングを起動する",
        "quick_teams": "Teamsミーティングを起動する",
        "copy_passcode": "パスワードをコピーする",
        "self_study": "独学",
        "online": "",
        "team_study": "",
        "ical_error": "icalファイル解析不能",
        "error_at": "{1} に {0} 発生",
        "calendar_settings": "",
        "first_day_settings": "毎週の初日",
        "cancel": "キャンセル",
        "save": "保存",
        "clock_change_pos": "",
        "clock_change_neg": "",
        "local_time": "",
        "uk_time": "",
        "holiday": "",
        "uk_holiday": ""
    }
}
</i18n>

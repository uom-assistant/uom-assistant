<template>
    <div class="home">
        <v-card
            class="mx-auto rounded-lg"
            outlined
        >
            <!-- Overview -->
            <div class="next-class float" v-if="!$vuetify.breakpoint.xs && !(nextEvent === null && current === null)">
                <span class="d-block text-truncate"><span class="text--secondary" v-show="nextEvent !== null">{{ $t('next') }}</span> <strong v-show="nextEvent !== null">{{ nextName }}</strong></span>
                <span class="text--secondary d-block" v-if="nextEvent === null">{{ $t('no_next') }}</span>
                <span class="text-h5 primary--text pt-1 d-inline-block">
                    <span v-show="nextEvent !== null">{{ (minAfter > 60 ? (hourAfter === 1 ? formatString($t('hour_after'), [hourAfter]) : formatString($t('hour_after_plural'), [hourAfter])) : (minAfter === 1 ? formatString($t('min_after'), [minAfter]) : formatString($t('min_after_plural'), [minAfter]))) }}</span>
                    <v-icon color="primary" large v-show="nextEvent === null">mdi-check-all</v-icon>
                </span><br>
                <span class="text--disabled pt-1 d-inline-block smaller-font">{{ current === null ? $t('no_current') : currentEnd > 20 ? `${$t('current_is')}${currentName}` : ((currentEnd > 1 ? formatString($t('current_plural'), [currentEnd]) : formatString($t('current'), [currentEnd]))) }}</span>
            </div>
            <v-list-item three-line>
                <v-list-item-content>
                    <div class="overline mb-2">
                        {{ $t('overview') }}
                    </div>
                    <v-list-item-title class="headline mb-1">
                        {{ nowDate }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="mb-2">
                        {{ formatString($t(classNum === 0 ? 'class_overview_none' : (classNum > 1 ? 'class_overview_plural' : 'class_overview')) + $t(classNum > 0 ? 'class_remian' : 'class_remian_none'), classNum > 0 ? [classNum, classRemain] : []) }}
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <div class="next-class normal" v-if="$vuetify.breakpoint.xs && !(nextEvent === null && current === null)">
                <span class="d-block text-truncate"><span class="text--secondary" v-show="nextEvent !== null">{{ $t('next') }}</span> <strong v-show="nextEvent !== null">{{ nextName }}</strong></span>
                <span class="text--secondary d-block" v-if="nextEvent === null">{{ $t('no_next') }}</span>
                <span class="text-h5 primary--text pt-1 d-inline-block">
                    <span v-show="nextEvent !== null">{{ (minAfter > 60 ? (hourAfter === 1 ? formatString($t('hour_after'), [hourAfter]) : formatString($t('hour_after_plural'), [hourAfter])) : (minAfter === 1 ? formatString($t('min_after'), [minAfter]) : formatString($t('min_after_plural'), [minAfter]))) }}</span>
                    <v-icon color="primary" large v-show="nextEvent === null">mdi-check-all</v-icon></span><br>
                <span class="text--disabled pt-1 d-inline-block smaller-font">{{ current === null ? $t('no_current') : currentEnd > 20 ? `${$t('current_is')}${currentName}` : ((currentEnd > 1 ? formatString($t('current_plural'), [currentEnd]) : formatString($t('current'), [currentEnd]))) }}</span>
            </div>
        </v-card>
        <div id="blocks">
            <!-- Main widgets -->
            <clock id="index-1" class="block size1x" v-show="widgets.includes(0)"></clock>
            <calendar id="index-2" class="block size2x" v-show="widgets.includes(6)"></calendar>
            <todo id="index-3" class="block size1x" v-show="widgets.includes(1)"></todo>
            <bblinks id="index-4" class="block size1x" v-show="widgets.includes(2)"></bblinks>
            <livelinks id="index-5" class="block size1x" v-show="widgets.includes(3)"></livelinks>
            <subjects id="index-6" class="block size1x" v-show="widgets.includes(4)"></subjects>
            <attendance id="index-7" class="block size1x" v-show="widgets.includes(5)"></attendance>
            <coursework id="index-8" class="block size1x" v-show="widgets.includes(7)"></coursework>
            <note id="index-9" class="block size1x" v-show="widgets.includes(8)"></note>
            <mail id="index-10" class="block size1x" v-show="widgets.includes(9)"></mail>
        </div>
    </div>
</template>

<script>
import clock from '@/components/clock.vue';
import todo from '@/components/todo.vue';
import bblinks from '@/components/bblinks.vue';
import livelinks from '@/components/livelinks.vue';
import subjects from '@/components/subjects.vue';
import attendance from '@/components/attendance.vue';
import calendar from '@/components/calendar.vue';
import coursework from '@/components/coursework.vue';
import note from '@/components/note.vue';
import mail from '@/components/mail.vue';

import { mapState } from 'vuex';
import Packery from 'packery';
import Draggabilly from 'draggabilly';
import { vsprintf } from 'sprintf-js';

import formatDate from '../tools/formatDate';

export default {
    name: 'Home',
    components: {
        clock,
        todo,
        bblinks,
        livelinks,
        subjects,
        attendance,
        calendar,
        coursework,
        note,
        mail,
    },
    data() {
        return {
            nowDate: '',
            classNum: 0,
            classRemain: 0,
            current: null,
            currentEnd: 0,
            nextName: '',
            minAfter: 0,
            hourAfter: 0,
            nextEvent: null,
            currentName: '',
        };
    },
    watch: {
        locale() {
            // Responding to language changes and update time format
            this.$i18n.locale = this.locale;
            this.nowDate = formatDate(new Date(), this.locale);
        },
        widgets() {
            // Update layout
            this.$nextTick(() => {
                this.packery.shiftLayout();
            });
        },
        timerMin() {
            this.updateEvents();
        },
        timerHour() {
            this.getDate();
        },
        todayEvents() {
            this.updateEvents();
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            packery: (state) => state.packery,
            widgets: (state) => state.widgets,
            timerMin: (state) => state.timerMin,
            timerHour: (state) => state.timerHour,
            todayEvents: (state) => state.todayEvents,
            nextDayFirstEvent: (state) => state.nextDayFirstEvent,
        }),
    },
    methods: {
        /**
         * Update date
         */
        getDate() {
            this.nowDate = formatDate(new Date(), this.locale);
        },
        /**
         * Format strings like `printf()`
         * @param {string} str string template
         * @param {array} args arguments
         * @returns {string} formated string
         */
        formatString(str, args) {
            return vsprintf(str, args);
        },
        /**
         * Update upcoming events
         */
        updateEvents() {
            this.classNum = this.todayEvents.length;

            const now = new Date().valueOf();
            let remain = 0;
            let current = null;
            let nextEvent = null;
            if (this.todayEvents.length > 0) {
                for (const event of this.todayEvents) {
                    // Check the number of today's events and get the current event
                    if (event.start.valueOf() > now) {
                        nextEvent = (nextEvent === null || nextEvent.start.valueOf() > event.start.valueOf()) ? event : nextEvent;
                        remain += 1;
                    } else if (event.start.valueOf() <= now && event.end.valueOf() > now) {
                        remain += 1;
                        current = event;
                    }
                }
            }

            // Get next events in 24 hours
            if (nextEvent === null) {
                if (this.nextDayFirstEvent !== null && this.nextDayFirstEvent.start.valueOf() - now <= 86400000) {
                    nextEvent = this.nextDayFirstEvent;
                }
            }

            this.classRemain = remain;
            this.current = current;
            if (this.current !== null) {
                // Check current event end time
                this.currentName = this.current.subjectName === '' ? this.current.name : this.current.subjectName;
                this.currentEnd = Math.round(((this.current.end.valueOf() - now) / 1000) / 60);
                this.currentEnd = this.currentEnd === 0 ? 1 : this.currentEnd;
            } else {
                // No current event
                this.currentName = this.$t('unknown');
                this.currentEnd = 0;
            }
            this.nextEvent = nextEvent;
            if (nextEvent !== null) {
                // Calculate next event start time
                this.nextName = nextEvent.subjectName === '' ? nextEvent.name.split('/')[0] : nextEvent.subjectName;
                this.minAfter = Math.round(((nextEvent.start.valueOf() - now) / 1000) / 60);
                this.hourAfter = Math.round(this.minAfter / 60);
                this.minAfter = this.minAfter === 0 ? 1 : this.minAfter;
                this.hourAfter = this.hourAfter === 0 ? 1 : this.hourAfter;
            } else {
                // No upcoming event in 24 hours
                this.nextName = this.$t('unknown');
                this.minAfter = 0;
                this.hourAfter = 0;
            }
        },
        /**
         * Store widgets' order
         */
        orderItems() {
            const indexes = [];
            this.packery.getItemElements().forEach((itemElem, i) => {
                indexes[i] = parseInt(itemElem.id.split('-')[1], 10);
            });
            localStorage.setItem('layout', JSON.stringify(indexes));
        },
    },
    mounted() {
        // Initialize language
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Restore widgets' order
        let indexes = localStorage.getItem('layout') || '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]';
        indexes = JSON.parse(indexes);
        document.getElementById(`index-${indexes.shift()}`).classList.add('layouted');
        const packery = new Packery(document.getElementById('blocks'), {
            itemSelector: '.layouted',
            gutter: 15,
            columnWidth: '.size1x',
            percentPosition: true,
        });
        for (const index of indexes) {
            document.getElementById(`index-${index}`).classList.add('layouted');
            packery.appended(document.getElementById(`index-${index}`));
        }
        packery.layout();
        packery.on('layoutComplete', this.orderItems);
        packery.on('dragItemPositioned', this.orderItems);

        // Make widgets draggable
        document.querySelectorAll('.block').forEach((ele) => {
            packery.bindDraggabillyEvents(new Draggabilly(ele, {
                handle: '.handle',
            }));
        });
        this.$store.commit('setPackery', packery);
        this.getDate();
    },
};
</script>

<style lang="less">
::-moz-selection {
    color: white;
    background-color: #660099;
}
::-webkit-selection {
    color: white;
    background-color: #660099;
}
::selection {
    color: white;
    background-color: #660099;
}
#app.theme--dark {
    ::-moz-selection {
        color: black;
        background-color: #D099E0;
    }
    ::-webkit-selection {
        color: black;
        background-color: #D099E0;
    }
    ::selection {
        color: black;
        background-color: #D099E0;
    }
}
.home {
    min-height: calc(100vh - 64px);
    background-color: #F5F5F5;
}
.theme--dark .home {
    background-color: #272727;
}
#blocks {
    width: 100%;
    padding: 15px 0;
    .block {
        z-index: 1;
        width: 100%;
    }
}
.packery-drop-placeholder {
  border: 2px dashed rgb(202, 202, 202);
  transition: transform 0.2s;
  z-index: 0;
  border-radius: 8px;
}
.next-class {
    overflow: hidden;
    .smaller-font {
        font-size: 0.875rem;
    }
    &.normal {
        padding: 16px;
        padding-top: 0;
        width: 100%;
    }
    &.float {
        padding: 20px;
        text-align: right;
        width: 350px;
        float: right;
    }
}

.size1x {
    min-width: 350px;
    @media (min-width: 400px) {
        max-width: calc(100% - 2px);
    }
    @media (min-width: 800px) {
        max-width: calc(100% / 2 - 8px);
    }
    @media (min-width: 1200px) {
        max-width: calc(100% / 3 - 10.5px);
    }
    @media (min-width: 1600px) {
        max-width: calc(100% / 4 - 11.5px);
    }
    @media (min-width: 2000px) {
        max-width: calc(100% / 5 - 12px);
    }
    @media (min-width: 2400px) {
        max-width: calc(100% / 6 - 12.5px);
    }
    @media (min-width: 2800px) {
        max-width: calc(100% / 7 - 13px);
    }
    @media (min-width: 3200px) {
        max-width: calc(100% / 8 - 13.2px);
    }
    @media (min-width: 3600px) {
        max-width: calc(100% / 9 - 13.4px);
    }
}
.size2x {
    min-width: 350px;
    @media (min-width: 800px) {
        max-width: calc(100% - 2px);
    }
    @media (min-width: 1200px) {
        max-width: calc(200% / 3 - 6px);
    }
    @media (min-width: 1600px) {
        max-width: calc(100% / 2 - 8px);
    }
    @media (min-width: 2000px) {
        max-width: calc(200% / 5 - 9px);
    }
    @media (min-width: 2400px) {
        max-width: calc(100% / 3 - 10px);
    }
    @media (min-width: 2800px) {
        max-width: calc(200% / 7 - 11px);
    }
    @media (min-width: 3200px) {
        max-width: calc(100% / 4 - 12.2px);
    }
    @media (min-width: 3600px) {
        max-width: calc(200% / 9 - 13px);
    }
}
</style>

<i18n>
{
    "en": {
        "overview": "OVERVIEW",
        "class_overview": "You have %d class today",
        "class_overview_none": "You have no class today",
        "class_overview_plural": "You have %d classes today",
        "class_remian": ", %d remaining.",
        "class_remian_none": ".",
        "next": "Coming up",
        "no_next": "No class in a day",
        "min_after_plural": "In %d mins",
        "hour_after_plural": "In %d hours",
        "min_after": "In %d min",
        "hour_after": "In %d hour",
        "current_is": "Current class is ",
        "current": "Current class will end in %d min",
        "current_plural": "Current class will end in %d mins",
        "no_current": "There is no class currently",
        "unknown": "Unknown"
    },
    "zh": {
        "overview": "总览",
        "class_overview": "你今天有 %d 节课",
        "class_overview_none": "你今天没有课",
        "class_overview_plural": "你今天有 %d 节课",
        "class_remian": "，还剩 %d 节。",
        "class_remian_none": "。",
        "next": "下一节",
        "no_next": "一天之内没有课程",
        "min_after_plural": "%d 分钟后",
        "hour_after_plural": "%d 小时后",
        "min_after": "%d 分钟后",
        "hour_after": "%d 小时后",
        "current_is": "正在上 ",
        "current": "当前课程会在 %d 分钟后结束",
        "current_plural": "当前课程会在 %d 分钟后结束",
        "no_current": "现在没有课程",
        "unknown": "未知"
    }
}
</i18n>

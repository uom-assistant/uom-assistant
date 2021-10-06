<template>
    <div class="home">
        <v-card
            class="mx-auto rounded-lg header-card"
            :class="{ higher: higherHeader }"
            outlined
        >
            <div class="header-bg rounded-lg" :style="{ backgroundImage: `url(${headerImage.image})`, backgroundPosition: `50% ${headerImage.position}%` }" :class="{ bw: headerBw }"></div>
            <!-- Overview -->
            <div class="next-class float" v-if="!$vuetify.breakpoint.xs && !(nextEvent === null && current === null)">
                <span class="d-block text-truncate"><i18n path="next" tag="span" class="text--secondary" v-show="nextEvent !== null">
                    <span class="text--primary"><span :class="subjectColor(nextEvent.subjectId)" class="subject-color-samll" v-show="subjectColor(nextEvent.subjectId) !== ''" v-if="nextEvent !== null"></span> <strong v-show="nextEvent !== null">{{ nextName }}</strong></span>
                </i18n></span>
                <span class="text--secondary d-block" v-if="nextEvent === null">{{ $t('no_next') }}</span>
                <span class="text-h5 primary--text pt-1 d-inline-block">
                    <span v-show="nextEvent !== null">{{ (minAfter > 60 ? $tc('hour_after', hourAfter, [hourAfter]) : $tc('min_after', minAfter, [minAfter])) }}</span>
                    <v-icon color="primary" large v-show="nextEvent === null">mdi-check-all</v-icon>
                </span><br>
                <span class="text--disabled pt-1 d-inline-block smaller-font">{{ current === null ? $t('no_current') : currentEnd > 20 ? $t('current_is', [currentName]) : $tc('current', currentEnd, [currentEnd]) }}</span>
            </div>
            <v-list-item three-line class="global-header">
                <v-list-item-content>
                    <div class="overline mb-2">
                        {{ $t('overview') }}
                        <v-btn icon x-small class="style-btn" :title="$t('personalise')" @click="togglePersonalise">
                            <v-icon x-small>mdi-palette</v-icon>
                        </v-btn>
                    </div>
                    <v-list-item-title class="headline mb-1 now-date">
                        {{ nowDate }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="mb-2">
                        <span v-if="classNum !== 0 && classRemain === 0">{{ tomorrowFirst !== '' ? $t('tomorrow_first', [tomorrowFirst]) : $t('tomorrow_first_none_rest') }}</span>
                        <span v-else>{{ $tc('class_overview', classNum, [classNum]) }}{{ $t(classNum > 0 ? 'class_remian' : 'class_remian_none', [classRemain]) }}</span>
                    </v-list-item-subtitle>
                </v-list-item-content>
            </v-list-item>
            <div class="next-class normal" v-if="$vuetify.breakpoint.xs && !(nextEvent === null && current === null)">
                <span class="d-block text-truncate"><i18n path="next" tag="span" class="text--secondary" v-show="nextEvent !== null">
                    <span class="text--primary"><span :class="subjectColor(nextEvent.subjectId)" class="subject-color-samll" v-show="subjectColor(nextEvent.subjectId) !== ''" v-if="nextEvent !== null"></span> <strong v-show="nextEvent !== null">{{ nextName }}</strong></span>
                </i18n></span>
                <span class="text--secondary d-block" v-if="nextEvent === null">{{ $t('no_next') }}</span>
                <span class="text-h5 primary--text pt-1 d-inline-block">
                    <span v-show="nextEvent !== null">{{ (minAfter > 60 ? $tc('hour_after', hourAfter, [hourAfter]) : $tc('min_after', minAfter, [minAfter])) }}</span>
                    <v-icon color="primary" large v-show="nextEvent === null">mdi-check-all</v-icon></span><br>
                <span class="text--disabled pt-1 d-inline-block smaller-font">{{ current === null ? $t('no_current') : currentEnd > 20 ? $t('current_is', [currentName]) : $tc('current', currentEnd, [currentEnd]) }}</span>
            </div>
            <v-expand-transition>
                <personalise class="personalise-panel" v-show="showPersonalise" @change="(img) => headerImage = img" @bw="(val) => headerBw = val" ref="personalise"></personalise>
            </v-expand-transition>
        </v-card>
        <div id="blocks">
            <div id="sizer" class="block size1x layouted"></div>
            <!-- Main widgets -->
            <clock id="index-1" class="block size1x" v-show="widgets.includes(0)" :searchid="0"></clock>
            <calendar id="index-2" class="block size2x" v-show="widgets.includes(6)" :searchid="6"></calendar>
            <plugins id="index-11" class="block" :class="pluginExpanded ? 'size2x' : 'size1x'" v-show="widgets.includes(10)" :searchid="10" @toggle-expanded="toggleExpanded"></plugins>
            <bblinks id="index-3" class="block size1x" v-show="widgets.includes(1)" :searchid="1"></bblinks>
            <livelinks id="index-4" class="block size1x" v-show="widgets.includes(2)" :searchid="2"></livelinks>
            <courses id="index-5" class="block size1x" v-show="widgets.includes(3)" :searchid="3"></courses>
            <attendance id="index-6" class="block size1x" v-show="widgets.includes(4)" :searchid="4"></attendance>
            <task id="index-7" class="block size1x" v-show="widgets.includes(5)" :searchid="5"></task>
            <note id="index-8" class="block size1x" v-show="widgets.includes(7)" :searchid="7"></note>
            <mail id="index-9" class="block size1x" v-show="widgets.includes(8)" :searchid="8"></mail>
            <grade id="index-10" class="block size1x" v-show="widgets.includes(9)" :searchid="9"></grade>
        </div>
        <v-dialog
            v-model="timezoneChanged"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('timezone_changed_title') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('timezone_changed_body') }}
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="timezoneChanged = false"
                >
                    {{ $t('ok') }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-overlay :z-index="6" :value="showPersonalise" @click="showPersonalise = false"></v-overlay>
        <audio class="d-none" ref="audio">
            <source src="@/assets/audios/ding.mp3" type="audio/mpeg">
            <source src="@/assets/audios/ding.ogg" type="audio/ogg">
        </audio>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Packery from 'packery';
import Draggabilly from 'draggabilly';

import clock from '@/components/clock.vue';
import bblinks from '@/components/bblinks.vue';
import livelinks from '@/components/livelinks.vue';
import courses from '@/components/courses.vue';
import attendance from '@/components/attendance.vue';
import calendar from '@/components/calendar.vue';
import task from '@/components/task.vue';
import note from '@/components/note.vue';
import mail from '@/components/mail.vue';
import grade from '@/components/grade.vue';
import plugins from '@/components/plugins.vue';

import personalise from '@/components/personalise.vue';

import formatDate from '@/tools/formatDate';

let personaliseTimer = null;

export default {
    name: 'Home',
    components: {
        clock,
        bblinks,
        livelinks,
        courses,
        attendance,
        calendar,
        task,
        note,
        mail,
        grade,
        plugins,
        personalise,
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
            timezoneChanged: false,
            tomorrowFirst: '',
            pluginExpanded: false,
            showPersonalise: false,
            higherHeader: false,
            headerImage: {
                image: '',
                position: 50,
            },
            headerBw: false,
            showCheckInNotice: false,
            hasCheckedIn: false,
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
                this.packery.layout();
            });
        },
        classBell() {
            // Update class bell
            if (this.classBell) {
                this.$refs.audio.currentTime = 0;
                this.$refs.audio.volume = 1;
                this.$refs.audio.play();
            }
        },
        timerMin() {
            this.updateEvents('min');
        },
        timerHour() {
            this.getDate();
        },
        todayEvents() {
            this.updateEvents('event');
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
            subjects: (state) => state.subjects,
            classBell: (state) => state.classBell,
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
         * Update upcoming events
         * @param {string} source update source, 'min' or 'event'
         */
        updateEvents(source) {
            this.classNum = this.todayEvents.length;

            const now = new Date().valueOf();
            let remain = 0;
            let current = null;
            let nextEvent = null;
            if (this.todayEvents.length > 0) {
                for (const eventItem of this.todayEvents) {
                    // Check the number of today's events and get the current event
                    if (eventItem.start.valueOf() > now) {
                        nextEvent = (nextEvent === null || nextEvent.start.valueOf() > eventItem.start.valueOf()) ? eventItem : nextEvent;
                        remain += 1;
                    } else if (eventItem.start.valueOf() <= now && eventItem.end.valueOf() > now) {
                        remain += 1;
                        current = eventItem;
                    }
                }
            }

            // Get next events in 24 hours
            if (nextEvent === null) {
                if (this.nextDayFirstEvent !== null && this.nextDayFirstEvent.start.valueOf() - now <= 86400000) {
                    nextEvent = this.nextDayFirstEvent;
                }
            }

            if (this.nextDayFirstEvent !== null) {
                this.tomorrowFirst = `${`${this.nextDayFirstEvent.start.getHours()}`.padStart(2, '0')}:${`${this.nextDayFirstEvent.start.getMinutes()}`.padStart(2, '0')}`;
            } else {
                this.tomorrowFirst = '';
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

                if (this.minAfter === 5 && source === 'min') {
                    this.hasCheckedIn = false;
                    if (!this.audioOff) {
                        this.$refs.audio.currentTime = 0;
                        this.$refs.audio.volume = 1;
                        this.$refs.audio.play();
                    }
                }
                if (this.minAfter <= 5 && !this.hasCheckedIn) {
                    this.showCheckInNotice = true;
                }
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
            let skipFlag = false;
            this.packery.getItemElements().forEach((itemElem, i) => {
                if (!skipFlag) {
                    if (itemElem.id.includes('index-')) {
                        indexes[i] = parseInt(itemElem.id.split('-')[1], 10);
                    } else {
                        skipFlag = true;
                    }
                } else {
                    indexes[i - 1] = parseInt(itemElem.id.split('-')[1], 10);
                }
            });
            localStorage.setItem('layout', JSON.stringify(indexes));
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
         * Toggle plugin widget width
         * @param {Object} expand event detail
         */
        toggleExpanded(expand) {
            this.pluginExpanded = expand.expanded;
            if (!expand.isResize) {
                this.$nextTick(() => {
                    this.packery.fit(document.getElementById('index-11'));
                });
            }
        },
        /**
         * Toggle personalise panel
         */
        togglePersonalise() {
            this.showPersonalise = !this.showPersonalise;

            if (this.showPersonalise) {
                this.higherHeader = true;
                this.$refs.personalise.loadImages();

                if (personaliseTimer !== null) {
                    clearInterval(personaliseTimer);
                }
            } else {
                personaliseTimer = setTimeout(() => {
                    this.higherHeader = false;
                    personaliseTimer = null;
                }, 300);
            }
        },
    },
    mounted() {
        // Initialize language
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Initialize plugin widget width
        this.pluginExpanded = (localStorage.getItem('plugin_expanded') || 'false') === 'true';

        // Check timezone
        let currentTimeZone = '';
        if (localStorage.getItem('current_timezone')) {
            currentTimeZone = localStorage.getItem('current_timezone');
        }

        const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (currentTimeZone !== clientTimeZone) {
            if (currentTimeZone !== '') {
                this.timezoneChanged = true;
            }
            localStorage.setItem('current_timezone', clientTimeZone);
        }

        // Restore widgets' order
        let indexes = localStorage.getItem('layout') || '[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]';
        indexes = JSON.parse(indexes);
        document.getElementById(`index-${indexes.shift()}`).classList.add('layouted');
        const packery = new Packery(document.getElementById('blocks'), {
            itemSelector: '.layouted',
            gutter: 15,
            columnWidth: '.size1x',
            percentPosition: true,
            transitionDuration: '0.3s',
        });
        for (const index of indexes) {
            document.getElementById(`index-${index}`).classList.add('layouted');
            packery.appended(document.getElementById(`index-${index}`));
        }
        for (const ele of document.querySelectorAll('#blocks .block:not(.layouted)')) {
            ele.classList.add('layouted');
            packery.appended(ele);
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
    .header-card {
        .global-header {
            .style-btn {
                margin-top: -1px;
                opacity: 0;
            }
            &:hover {
                .style-btn {
                    opacity: 0.7;
                }
            }
        }
        .personalise-panel {
            position: absolute;
            top: calc(100% + 10px);
            left: 0;
            width: 100%;
            z-index: 8;
            max-width: 100%;
        }
        .header-bg {
            background-size: cover;
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            opacity: .15;
            &.bw {
                filter: grayscale(1);
            }
        }
        &.higher {
            z-index: 8;
            .global-header {
                .style-btn {
                    opacity: 1;
                }
            }
        }
    }
}
.theme--dark .home {
    background-color: #272727;
}
.now-date::first-letter {
    text-transform: uppercase;
}
#blocks {
    width: 100%;
    padding: 15px 0;
    .block {
        z-index: 1;
        width: 100%;
        box-shadow: none;
        transition: box-shadow .25s;
        contain: paint layout;
        &.is-dragging, &.is-positioning-post-drag {
            z-index: 3;
            box-shadow: 0 7px 8px -4px rgba(0, 0, 0, .07), 0 12px 17px 2px rgba(0, 0, 0, .07), 0 5px 22px 4px rgba(0, 0, 0, .06);
        }
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
    position: relative;
    z-index: 1;
    .smaller-font {
        font-size: 0.875rem;
    }
    .subject-color-samll {
        width: 9px;
        height: 9px;
        display: inline-block;
        border-radius: 50%;
        margin: 1px;
        margin-left: 2px;
        margin-bottom: 1.5px;
    }
    &.normal {
        padding: 16px;
        padding-top: 0;
        width: 100%;
    }
    &.float {
        padding: 19px 20px;
        text-align: right;
        width: 290px;
        float: right;
        @media (min-width: 700px) {
            width: 385px;
        }
    }
}

#sizer {
    height: 0;
    pointer-events: none;
    margin-bottom: -15px;
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
        "class_overview": "You have no sessions today | You have {0} session today | You have {0} sessions today",
        "class_remian": ", {0} remaining.",
        "class_remian_none": ".",
        "tomorrow_first": " Tomorrow's first session will start at {0}.",
        "tomorrow_first_none": "You have no sessions tomorrow.",
        "tomorrow_first_none_rest": "You have no sessions tomorrow, have a rest!",
        "next": "Coming up {0}",
        "no_next": "No more sessions today",
        "min_after": "In {0} min | In {0} mins",
        "hour_after": "In {0} hour | In {0} hours",
        "current_is": "Current session is {0}",
        "current": "Current session will end in {0} min | Current session will end in {0} mins",
        "no_current": "There is no session currently",
        "personalise": "Personalise",
        "unknown": "Unknown",
        "timezone_changed_title": "Time zone change detected",
        "timezone_changed_body": "Don't worry, all time-related content will still be displayed correctly, times that need to be converted will be converted automatically as well. You can still trust everything on your dashboard.",
        "ok": "OK"
    },
    "zh": {
        "overview": "总览",
        "class_overview": "你今天没有课 | 你今天有 {0} 节课 | 你今天有 {0} 节课",
        "class_remian": "，还剩 {0} 节。",
        "class_remian_none": "。",
        "tomorrow_first": "明天的第一节课将于 {0} 开始。",
        "tomorrow_first_none": "你明天没有课。",
        "tomorrow_first_none_rest": "你明天没有课，休息一下吧。",
        "next": "下一节 {0}",
        "no_next": "一天之内没有课程",
        "min_after": "{0} 分钟后 | {0} 分钟后",
        "hour_after": "{0} 小时后 | {0} 小时后",
        "current_is": "正在上 {0}",
        "current": "当前课程会在 {0} 分钟后结束 | 当前课程会在 {0} 分钟后结束",
        "no_current": "现在没有课程",
        "personalise": "个性化",
        "unknown": "未知",
        "timezone_changed_title": "检测到时区更改",
        "timezone_changed_body": "别担心，所有时间相关的内容仍会正确显示，需要被转换的时间会被自动转换。你仍然可以信任曼大助手显示的所有内容。",
        "ok": "好"
    },
    "es": {
        "overview": "Información general",
        "class_overview": "No tiene clase hoy | Tiene {0} clase hoy | Tiene {0} clases hoy",
        "class_remian": ", quedan {0}.",
        "class_remian_none": ".",
        "tomorrow_first": "La primera clase de mañana empezará en {0}. ",
        "tomorrow_first_none": "No tiene clases mañana.",
        "tomorrow_first_none_rest": "No tiene clases mañana, tómese un descanso!",
        "next": "Siguiente {0}",
        "no_next": "No hay clases en un día",
        "min_after": "En {0} minuto | En {0} minutos",
        "hour_after": "En {0} hora | En {0} horas",
        "current_is": "La sesión actual es {0}",
        "current": "Esta sesión terminará en {0} minuto | Esta sesión terminará en {0} minutos",
        "no_current": "No hay clase ahora mismo",
        "personalise": "",
        "unknown": "Desconocido",
        "timezone_changed_title": "Se detecta cambio de zona horaria",
        "timezone_changed_body": "No se preocupe, todo el contenido relacionado con el tiempo se seguirá mostrando correctamente, las horas que deben convertirse también se convertirán automáticamente. Puede confiar en todo lo que hay en su tablero.",
        "ok": "OK"
    },
    "ja":
    {
        "overview": "今日の概要",
        "class_overview": "今日は授業がありません | 今日は {0} つの授業があります | 今日は {0} つの授業があります",
        "class_remian": "，まだ {0} つ残ってる",
        "class_remian_none": "。",
        "tomorrow_first": "明日の最初の授業は {0} に始まります。",
        "tomorrow_first_none": "明日は授業がありません。",
        "tomorrow_first_none_rest": "明日は授業がありません、ちょっと休みましょう",
        "next": "次の授業 {0}",
        "no_next": "これまで今日の授業が全部終わりました",
        "min_after": "{0} 分後 | {0} 分後",
        "hour_after": "{0} 時間後 | {0} 時間後",
        "current_is": "今の授業は {0}",
        "current": "今の授業は {0} 分後終わります | 今の授業は {0} 分後終わります",
        "no_current": "今は授業がありません",
        "personalise": "パーソナライズ",
        "unknown": "不明",
        "timezone_changed_title": "タイムゾーン変更を検出しました",
        "timezone_changed_body": "心配しないて、すべての時間を関する情報はまだ正しく表示されます、変換が必要な時間はすぐに変換されます。UoMアシスタントからの全部の情報をまだ信頼してもいいよ。",
        "ok": "はい",
        "checkin": "チェックイン",
        "go_checkin": "チェックインする",
        "checkin_dialog": "チェックイン通知",
        "checkin_dialog_body": " {0} にチェックインが必要かもしれません。",
        "no_course_checkin": "チェックインが必要な授業はありません。",
        "and": "と",
        "already_checkedin": "もしこの授業をもうチェックインしまったら、またはこの授業はチェックインの必要がなかったら、この通知を閉じてもいいです。",
        "dismiss": "この通知を閉じる",
        "please_check": "チェックインと出勤を、是非ご自身でご確認ください、UoMアシスタントはチェックインのエラーによる如何なる結果に対しても責任を負いません。"
    }
}
</i18n>

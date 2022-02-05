<template>
    <div class="search-grade-container">
        <v-card
            class="mx-auto rounded grade-item"
            outlined
            v-for="(subject, index) in gradeListFiltered"
            :key="`subject-${subject.subject}-${index}`"
        >
            <div class="subject-summary">
                <v-progress-circular
                    :rotate="-90"
                    :size="49"
                    :width="3"
                    :value="subject.summary.overall"
                    color="primary"
                    class="float-right ml-3"
                >
                    <span :class="{ 'text-body-2': `${parseFloat(parseFloat(subject.summary.overall).toFixed(1))}`.length > 3 }">{{ parseFloat(parseFloat(subject.summary.overall).toFixed(1)) }}</span><span class="text-caption">%</span>
                </v-progress-circular>
                <div class="text-truncate">{{ subjectLongNameMap(subject.subject) === subject.subject ? subject.name : subjectLongNameMap(subject.subject) }}</div>
                <span class="text--disabled text-body-2">
                    <span :class="subjectColor(subject.subject)" class="subject-color-samll" v-if="subjectLongNameMap(subject.subject) !== subject.subject"></span>
                    {{ subject.subject }} <span class="d-inline-block mx-1">•</span> {{ subject.year }} {{ $t(subject.indexName) }}
                </span>
            </div>
            <v-divider class="mb-2"></v-divider>
            <v-list flat class="list">
                <v-list-item v-for="(item, gradeIndex) in latestTwo(subject.detail)" :key="gradeIndex">
                    <v-list-item-content>
                        <v-list-item-title><v-icon class="mr-1" dense :title="$t('formative')" v-if="!item.summative">mdi-bookmark-off-outline</v-icon>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="mr-2">
                                <v-icon small>
                                    mdi-clock-outline
                                </v-icon>
                                {{ item.time > -1 ? getDate(new Date(item.time)) : $t('na') }}
                            </span>
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon
                                        x-small
                                        class="mr-2 copy-icon"
                                        v-if="item.tag"
                                        v-on="on"
                                        v-bind="attrs"
                                        @click="copyingIndex = `copy-1-${gradeIndex}`"
                                        v-clipboard:copy="item.tag"
                                        v-clipboard:success="onCopy"
                                        :color="copySuccess && copyingIndex === `copy-1-${gradeIndex}` ? 'success' : ''"
                                        :class="{ 'copy-success-icon': copySuccess && copyingIndex === `copy-1-${gradeIndex}` }"
                                    >
                                        mdi-{{ copySuccess && copyingIndex === `copy-1-${gradeIndex}` ? 'check' : 'tag-outline' }}
                                    </v-icon>
                                </template>
                                <span>Git Tag: {{ item.tag }}<br><span class="dark-text-secondary text-caption d-block text-center">{{ $t('copy') }}</span></span>
                            </v-tooltip>
                            <span class="orange--text" v-if="item.status === 'late' || item.status === 'penalty'">LATE</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="grade" v-if="item.grade !== '🤞' && item.grade !== '🔒' && item.status !== 'late'">
                        {{ item.grade }}<span class="text--disabled">/{{ item.gradeAll }}</span>
                        <v-progress-circular
                            :rotate="-90"
                            :size="17"
                            :width="2.3"
                            :value="item.gradeAll === '0' ? 0 : (parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100"
                            :color="getColorByGrade(item.gradeAll === '0' ? 0 : (parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100)"
                            :title="item.gradeAll === '0' ? 0 : `${parseFloat(((parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100).toFixed(2))}%`"
                            class="ml-2"
                        ></v-progress-circular>
                    </v-list-item-action>
                    <v-list-item-action class="grade" v-else>
                        <span class="text--disabled">{{ $t('waiting') }}</span>
                    </v-list-item-action>
                </v-list-item>
                <v-list-item class="more-info" @click="openSubject(subject.rawIndex, subject.tabIndex, subject.year, subject.subject)">
                    <v-list-item-content>
                        <v-list-item-title>{{ $t('more_info') }}</v-list-item-title>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-icon small>
                            mdi-arrow-right
                        </v-icon>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card>
        <v-card
            class="mx-auto rounded grade-item"
            outlined
            v-show="courseworkList.length > 0"
        >
            <v-list flat class="list single-item-list mt-1 mb-1">
                <v-list-item v-for="(item, index) in courseworkList" :key="`grade-${index}`">
                    <v-list-item-content>
                        <v-list-item-title><v-icon class="mr-1" dense :title="$t('formative')" v-if="!item.summative">mdi-bookmark-off-outline</v-icon>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                            <span class="mr-2">
                                <v-icon small>
                                    mdi-clock-outline
                                </v-icon>
                                {{ item.time > -1 ? getDate(new Date(item.time)) : $t('na') }}
                            </span>
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-icon
                                        x-small
                                        class="mr-2 copy-icon"
                                        v-if="item.tag"
                                        v-on="on"
                                        v-bind="attrs"
                                        @click="copyingIndex = `copy-1-${gradeIndex}`"
                                        v-clipboard:copy="item.tag"
                                        v-clipboard:success="onCopy"
                                        :color="copySuccess && copyingIndex === `copy-1-${gradeIndex}` ? 'success' : ''"
                                        :class="{ 'copy-success-icon': copySuccess && copyingIndex === `copy-1-${gradeIndex}` }"
                                    >
                                        mdi-{{ copySuccess && copyingIndex === `copy-1-${gradeIndex}` ? 'check' : 'tag-outline' }}
                                    </v-icon>
                                </template>
                                <span>Git Tag: {{ item.tag }}<br><span class="dark-text-secondary text-caption d-block text-center">{{ $t('copy') }}</span></span>
                            </v-tooltip>
                            <span class="mr-2">
                                <span :class="subjectColor(item.subject)" class="subject-color-samll" v-if="subjectNameMap(item.subject) !== item.subject"></span>
                                {{ subjectNameMap(item.subject) }} <span class="d-inline-block mx-1">•</span> {{ item.year }} {{ $t(item.indexName) }}
                            </span>
                            <span class="orange--text" v-if="item.status === 'late' || item.status === 'penalty'">LATE</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="grade" v-if="item.grade !== '🤞' && item.grade !== '🔒' && item.status !== 'late'">
                        {{ item.grade }}<span class="text--disabled">/{{ item.gradeAll }}</span>
                        <v-progress-circular
                            :rotate="-90"
                            :size="17"
                            :width="2.3"
                            :value="item.gradeAll === '0' ? 0 : (parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100"
                            :color="getColorByGrade(item.gradeAll === '0' ? 0 : (parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100)"
                            :title="item.gradeAll === '0' ? 0 : `${parseFloat(((parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100).toFixed(2))}%`"
                            class="ml-2"
                        ></v-progress-circular>
                    </v-list-item-action>
                    <v-list-item-action class="grade" v-else>
                        <span class="text--disabled">{{ $t('waiting') }}</span>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card>
    </div>
</template>

<script>
import { mapState } from 'vuex';

import clipboard from '@/mixins/clipboard';

import formatDate from '@/tools/formatDate';

export default {
    name: 'gradeSearch',
    props: {
        grades: Array,
    },
    mixins: [clipboard],
    methods: {
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
         * Map from subject ID to subject name
         * @param {string} subject subject ID
         * @returns {string} subject name or raw ID (if none matched)
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
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @returns {string} formatted a date string
         */
        getDate(dateObj) {
            return formatDate(dateObj, this.locale, window.uomaTimeFormatters, false);
        },
        /**
         * Get latest 2 grade items from a grade list
         * @param {array} grades grade list
         * @returns {array} a grade list that conatins latest 2 grade items
         */
        latestTwo(grades) {
            const sortedList = grades.flat().filter((grade) => grade.status === 'past' || grade.status === 'late' || grade.status === 'penalty').sort((a, b) => a.time - b.time).reverse();
            if (sortedList.length <= 2) {
                return sortedList;
            }
            return [sortedList[0], sortedList[1]];
        },
        /**
         * Fet grade color by grade
         * @param {number} grade grade (max 100)
         * @returns {string} color keyword
         */
        getColorByGrade(grade) {
            if (grade >= 80) {
                return 'green';
            }
            if (grade >= 40) {
                return 'orange';
            }
            return 'red';
        },
        /**
         * Open an subject in widget
         * @param {number} index subject index
         * @param {number} tab tab index
         * @param {string} subject subject ID
         */
        openSubject(index, tab, year, subject) {
            this.$store.commit('setSearchNotification', {
                target: 'grade',
                payload: {
                    index,
                    tab,
                    year,
                    subject,
                },
            });
            this.$parent.$parent.searchOpened = false;
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            subjects: (state) => state.subjects,
        }),
        gradeListFiltered() {
            // Filter out empty subjects
            return this.grades.filter((item) => item.searchType === 'subject');
        },
        courseworkList() {
            // Filter out subjects
            return this.grades.filter((item) => item.searchType === 'grade');
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';
    },
};
</script>

<style lang="less">
.search-grade-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
    border-color: #E0E0E0!important;
    contain: layout paint;
    .subject-summary {
        padding: 12px 12px 12px 15px;
        .subject-color-samll {
            width: 10px;
            height: 10px;
            display: inline-block;
            border-radius: 50%;
            margin: 0;
            margin-right: 3px;
        }
    }
    .grade-item {
        background-color: white;
        border-radius: 6px!important;
        overflow: hidden;
        margin-bottom: 10px;
    }
    .list {
        padding-top: 0;
        padding-bottom: 0;
        background-color: transparent!important;
        .copy-icon {
            transition: none;
        }
        .copy-success-icon {
            margin-left: 3px;
            margin-right: 5px!important;
            transform: translateX(-3px);
            transition: margin-left .2s, margin-right .2s;
        }
        .v-list-item__action {
            margin: 6px 16px 6px 0;
        }
        .grade {
            margin: 0 0 0 5px;
            justify-content: end;
            align-items: center;
            flex-direction: row;
        }
        .v-list-item {
            background-color: transparent;
            min-height: 20px;
            .v-list-item__title {
                font-size: .9rem;
                i.mr-1 {
                    vertical-align: middle;
                    font-size: 16px;
                }
            }
        }
        .v-list-item__subtitle {
            font-size: .75rem;
            & > span > i {
                transform-origin: left center;
                transform: scale(.8) translateY(-.1rem);
                vertical-align: text-top;
                margin-right: -3px;
            }
        }
        .v-list-item__content {
            padding: 4px 0;
        }
        .more-info {
            background-color: transparent;
            transition: background-color .2s;
            margin-top: -2px;
            &:hover, &:focus {
                background-color: rgba(0, 0, 0, .04);
            }
            .v-list-item__action {
                margin: 6px 0 6px 0;
                align-items: center;
                flex-direction: row-reverse;
            }
            .v-list-item__content {
                padding: 10px 0;
            }
        }
    }
    .single-item-list {
        .v-list-item__content {
            padding: 10px 0;
        }
        .subject-color-samll {
            width: 9px;
            height: 9px;
            display: inline-block;
            border-radius: 50%;
            margin: 0;
            margin-right: 3px;
        }
    }
}
#app.theme--dark .search-grade-container {
    border-color: #393939;
    .grade-item {
        background-color: #272727;
        .more-info {
            &:hover, &:focus {
                background-color: rgba(255, 255, 255, .04);
            }
        }
    }
}
</style>

<i18n>
{
    "en": {
        "more_info": "View course unit",
        "formative": "Formative",
        "Semester 1": "Semester 1",
        "Semester 2": "Semester 2",
        "All Year": "All Year",
        "waiting": "Marking",
        "na": "N/A",
        "copy": "Click to copy"
    },
    "zh": {
        "more_info": "查看科目",
        "formative": "不计分作业",
        "Semester 1": "第一学期",
        "Semester 2": "第二学期",
        "All Year": "全年",
        "waiting": "待评分",
        "na": "未知",
        "copy": "点按以复制"
    },
    "es": {
        "more_info": "Ver asignatura",
        "formative": "",
        "Semester 1": "Semestre 1",
        "Semester 2": "Semestre 2",
        "All Year": "Todo el año",
        "waiting": "En espera",
        "na": "N/A",
        "copy": "Clic para copiar"
    },
    "ja": {
        "more_info": "この科目を表示",
        "formative": "",
        "Semester 1": "",
        "Semester 2": "",
        "All Year": "",
        "waiting": "",
        "na": "",
        "copy": ""
    }
}
</i18n>

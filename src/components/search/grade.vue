<template>
    <div class="search-grade-container">
        <v-card
            class="mx-auto rounded grade-item"
            outlined
            v-for="(subject, index) in gradeListFiltered"
            :key="`subject-${index}`"
        >
            <div class="subject-summary">
                <v-progress-circular
                    :rotate="-90"
                    :size="49"
                    :width="3"
                    :value="subject.weightedGrade"
                    color="primary"
                    class="float-right ml-3"
                >
                    {{ subject.weightedGrade }}<span class="text-caption">%</span>
                </v-progress-circular>
                <div class="text-truncate">{{ subjectLongNameMap(subject.subject) === subject.subject ? subject.name : subjectLongNameMap(subject.subject) }}</div>
                <span class="text--disabled text-body-2">
                    <span :class="subjectColor(subject.subject)" class="subject-color-samll" v-if="subjectLongNameMap(subject.subject) !== subject.subject"></span>
                    {{ subject.subject }}
                </span>
            </div>
            <v-divider class="mb-2"></v-divider>
            <v-list flat class="list">
                <v-list-item v-for="(item, gradeIndex) in latestTwo(subject.detail)" :key="gradeIndex">
                    <v-list-item-content>
                        <v-list-item-title><v-icon class="mr-1" dense :title="$t('formative')" v-if="!item.summative">mdi-bookmark-off-outline</v-icon>{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle>
                            <span>
                                <v-icon small>
                                    mdi-clock-outline
                                </v-icon>
                                {{ getDate(new Date(item.time.replace(' ', 'T'))) }}
                            </span>
                            <span class="orange--text ml-2" v-if="item.late">LATE</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="grade">
                        {{ item.grade }}<span class="text--disabled">/{{ item.gradeAll }}</span>
                        <v-progress-circular
                            :rotate="-90"
                            :size="17"
                            :width="2.3"
                            :value="(parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100"
                            :color="getColorByGrade((parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100)"
                            :title="`${parseFloat(((parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100).toFixed(2))}%`"
                            class="ml-2"
                        ></v-progress-circular>
                    </v-list-item-action>
                </v-list-item>
                <v-list-item class="more-info" @click="openSubject(subject.rawIndex, subject.subject)">
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
                            <span>
                                <v-icon small>
                                    mdi-clock-outline
                                </v-icon>
                                {{ getDate(new Date(item.time.replace(' ', 'T'))) }}
                            </span>
                            <span>
                                <span :class="subjectColor(item.subject)" class="subject-color-samll ml-2" v-if="subjectNameMap(item.subject) !== item.subject"></span>
                                {{ subjectNameMap(item.subject) }}
                            </span>
                            <span class="orange--text ml-2" v-if="item.late">LATE</span>
                        </v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="grade">
                        {{ item.grade }}<span class="text--disabled">/{{ item.gradeAll }}</span>
                        <v-progress-circular
                            :rotate="-90"
                            :size="17"
                            :width="2.3"
                            :value="(parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100"
                            :color="getColorByGrade((parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100)"
                            :title="`${parseFloat(((parseFloat(item.grade) / parseFloat(item.gradeAll)) * 100).toFixed(2))}%`"
                            class="ml-2"
                        ></v-progress-circular>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-card>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { vsprintf } from 'sprintf-js';

import formatDate from '@/tools/formatDate';

export default {
    name: 'gradeSearch',
    props: {
        grades: Array,
    },
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
            return formatDate(dateObj, this.locale, false);
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
         * Get latest 2 grade items from a grade list
         * @param {array} grades grade list
         * @returns {array} a grade list that conatins latest 2 grade items
         */
        latestTwo(grades) {
            const sortedList = grades.flat().sort((a, b) => ((new Date(b.time.replace(' ', 'T')).valueOf() - new Date(a.time.replace(' ', 'T')).valueOf()) <= 0 ? -1 : 1));
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
         * @param {string} subject subject ID
         */
        openSubject(index, subject) {
            this.$store.commit('setSearchNotification', {
                target: 'grade',
                payload: { index, subject },
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
    background-color: #F8F8F8!important;
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
    background-color: #1E1E1E!important;
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
        "more_info": "View course",
        "formative": "Formative"
    },
    "zh": {
        "more_info": "查看科目",
        "formative": "不计入总分"
    }
}
</i18n>

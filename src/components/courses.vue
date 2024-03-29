<template>
    <v-card
        class="mx-auto rounded-lg courses-container"
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
        <div class="subjects-outer">
            <h2 class="mr-5 handle">
                {{ $t('courses') }}
                <v-btn icon @click.stop="addSubject" small class="float-right header-icon" :title="$t('add_subject')" v-shortkey="['alt', 'u']" @shortkey="addSubject">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn icon @click.stop="toggleFilter" small class="float-right header-icon mr-1" v-if="shownSubjects.length < subjects.length" :title="$t('filter_course')" v-shortkey="['alt', 'f']" @shortkey="toggleFilter">
                    <v-icon>{{ filter ? 'mdi-filter' : 'mdi-filter-outline' }}</v-icon>
                </v-btn>
            </h2>
            <v-simple-table v-if="shownSubjects.length > 0 || hiddenSubjects.length > 0" class="subject-table rounded-0">
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left" scope="col">
                                {{ $t('name') }}
                            </th>
                            <th class="text-left" scope="col">
                                {{ $t('actions') }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(item, index) in shownSubjects"
                            :key="`${index}${item.name}${item.id}`"
                            :class="{ hide: item.hide }"
                        >
                            <td>{{ item.name }}<br><span :class="item.color" class="subject-color-samll mr-2"></span><span class="subject-id">{{ item.id }}</span></td>
                            <td class="edit-icons">
                                <v-btn icon @click.stop="updateSubject(item)">
                                    <v-icon>mdi-pencil-outline</v-icon>
                                </v-btn>
                                <v-btn icon @click.stop="removeSubject(item)">
                                    <v-icon color="red">mdi-delete-outline</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                        <tr
                            v-for="(item, index) in hiddenSubjects"
                            :key="`${index}${item.name}${item.id}`"
                            :class="{ hide: item.hide }"
                        >
                            <td>{{ item.name }}<br><span class="subject-id"><span :class="item.color" class="subject-color-samll mr-2 subject-color-hidden"></span>{{ item.id }}</span></td>
                            <td class="edit-icons">
                                <v-btn icon @click.stop="updateSubject(item)">
                                    <v-icon>mdi-pencil-outline</v-icon>
                                </v-btn>
                                <v-btn icon @click.stop="removeSubject(item)">
                                    <v-icon color="red">mdi-delete-outline</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </template>
            </v-simple-table>
            <div class="empty" v-else>
                {{ $t('nothing') }}
            </div>
        </div>
        <v-dialog
            v-model="dialog"
            max-width="550px"
            :class="$vuetify.breakpoint.xs ? 'rounded-0' : 'rounded-lg'"
            :fullscreen="$vuetify.breakpoint.xs"
            :transition="$vuetify.breakpoint.xs ? 'slide-y-reverse-transition' : 'dialog-transition'"
        >
            <v-card :class="$vuetify.breakpoint.xs ? 'rounded-0' : 'rounded-lg'">
                <v-card-title>
                    <span class="headline mt-2">{{ $t(editingMode === 'add' ? 'add_subject' : 'edit_subject') }}</span>
                </v-card-title>
                <v-card-text>
                    <v-container>
                        <v-text-field
                            v-model.trim="editingName"
                            outlined
                            :label="$t('subject_name')"
                            :hint="$t('subject_name_hint')"
                            prepend-inner-icon="mdi-text-long"
                        ></v-text-field>
                        <v-text-field
                            v-model.trim="editingShortName"
                            outlined
                            :label="$t('short_name')"
                            :hint="$t('short_name_hint')"
                            prepend-inner-icon="mdi-text-short"
                        ></v-text-field>
                        <v-text-field
                            v-model.trim="editingId"
                            outlined
                            :label="$t('subject_number')"
                            :hint="$t('subject_number_hint')"
                            prepend-inner-icon="mdi-numeric"
                        ></v-text-field>
                        <v-text-field
                            v-model.trim="editingHomePage"
                            outlined
                            :label="$t('subject_home')"
                            prepend-inner-icon="mdi-home-outline"
                        ></v-text-field>
                        <div class="subject-color">
                            <span>{{ $t('subject_color') }}</span>
                            <v-btn
                                v-for="color in colors"
                                :key="color"
                                :color="color"
                                :dark="true"
                                :loading="editingColor === color"
                                @click="editingColor = color"
                                class="mr-1 mb-1"
                                fab
                                small
                                depressed
                            >
                                <template v-slot:loader>
                                    <v-icon>mdi-check</v-icon>
                                </template>
                            </v-btn>
                        </div>
                        <v-checkbox
                            v-model="editingHide"
                            :label="$t('hide_subject')"
                            class="checkbox d-inline-block"
                        ></v-checkbox>
                        <v-tooltip top max-width="400">
                            <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                    v-bind="attrs"
                                    v-on="on"
                                    class="d-inline-block inline-help-icon"
                                    small
                                >
                                    mdi-help-circle-outline
                                </v-icon>
                            </template>
                            <span>{{ $t('hide_help') }}</span>
                        </v-tooltip>
                        <div class="subject-links rounded-lg">
                            <h2 class="text-subtitle-2">{{ $t('live_links') }}</h2>
                            <div class="d-flex mt-2">
                                <v-text-field
                                    v-model.trim="editingSessionLink"
                                    label="URL"
                                    outlined
                                    hide-details
                                    clearable
                                    dense
                                    prepend-inner-icon="mdi-link-variant"
                                    class="link-url"
                                    v-on:keyup.enter="addLink"
                                ></v-text-field>
                                <v-text-field
                                    v-model.trim="editingSessionLinkCode"
                                    :label="$t('live_link_code')"
                                    outlined
                                    hide-details
                                    clearable
                                    dense
                                    prepend-inner-icon="mdi-lock-outline"
                                    class="ml-2 link-code"
                                ></v-text-field>
                            </div>
                            <div class="d-flex mt-2">
                                <v-text-field
                                    v-model.trim="editingSessionLinkName"
                                    :label="$t('link_name')"
                                    outlined
                                    hide-details
                                    clearable
                                    dense
                                    prepend-inner-icon="mdi-text-short"
                                ></v-text-field>
                                <v-btn
                                    depressed
                                    color="primary"
                                    class="add-submit"
                                    :disabled="!editingSessionLink"
                                    @click="addLink"
                                >
                                    <v-icon dark>
                                        mdi-plus
                                    </v-icon>
                                </v-btn>
                            </div>
                            <v-list flat class="list" v-if="editingSessionLinks.length > 0">
                                <v-list-item-group>
                                    <v-list-item
                                        v-for="(link, index) in editingSessionLinks"
                                        :key="index"
                                        :ripple="false"
                                    >
                                        <template>
                                            <v-list-item-content>
                                                <v-list-item-title>
                                                <v-btn x-small icon :href="meetingLink(link.link, link.passcode)" :title="ifZoomLink(link.link) ? $t('quick_zoom') : $t('quick_teams')" v-if="ifZoomLink(link.link) || ifTeamsLink(link.link)" class="mr-1 text-decoration-none"><v-icon small>{{ ifTeamsLink(link.link) ? 'mdi-microsoft-teams' : 'mdi-dock-window' }}</v-icon></v-btn>
                                                <a :href="link.link" target="_blank" rel="noopener nofollow">{{ link.name }}</a><a :href="link.link" target="_blank" rel="noopener nofollow" class="no-underline-link"><v-icon small color="primary">mdi-open-in-new</v-icon></a>
                                                </v-list-item-title>
                                            </v-list-item-content>

                                            <v-list-item-action class="delete">
                                                <code v-if="link.passcode" class="mr-1 pb-1">{{ link.passcode }}</code>
                                                <v-btn icon @click.stop="removeLink(index)">
                                                    <v-icon color="grey">mdi-delete-outline</v-icon>
                                                </v-btn>
                                            </v-list-item-action>
                                        </template>
                                    </v-list-item>
                                </v-list-item-group>
                            </v-list>
                        </div>
                    </v-container>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        @click="dialog = false"
                    >
                        {{ $t('cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        :disabled="editingName.length === 0 || editingShortName.length === 0 || editingId.length === 0 || this.editingHomePage.length === 0"
                        @click="confirmEdit"
                    >
                        {{ $t(editingMode === 'add' ? 'add' : 'save') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="deleteDialog"
            persistent
            max-width="400"
            v-if="editingIndex !== -1"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('delete_subject') }}
                </v-card-title>
                <v-card-text>
                    <i18n path="delete_subject_text" tag="span">
                        <strong>{{ subjects[editingIndex].name }}</strong>
                    </i18n>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        @click="deleteDialog = false"
                    >
                        {{ $t('cancel') }}
                    </v-btn>
                    <v-btn
                        color="red"
                        text
                        @click="confirmRemove"
                    >
                        {{ $t('delete') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="sameIdError"
            max-width="400"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('error') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('same_id') }}
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="sameIdError = false"
                >
                    {{ $t('ok') }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';

import liveLinks from '@/mixins/liveLinks';

export default {
    name: 'courses',
    mixins: [liveLinks],
    data() {
        return {
            subjects: [],
            loading: false,
            dialog: false,
            filter: false,
            editingMode: 'update',
            editingIndex: -1,
            editingName: '',
            editingShortName: '',
            editingId: '',
            editingHomePage: '',
            editingHide: false,
            editingColor: 'blue',
            editingSessionLink: '',
            editingSessionLinkCode: '',
            editingSessionLinkName: '',
            editingSessionLinks: [],
            deleteDialog: false,
            sameIdError: false,
            colors: ['blue darken-1', 'indigo lighten-1', 'deep-purple', 'green', 'orange', 'red', 'pink', 'teal', 'yellow darken-2', 'brown', 'blue-grey', 'grey darken-1', 'lime darken-2'],
            timer: null,
        };
    },
    methods: {
        /**
         * Add a link to the temporary list
         */
        addLink() {
            if (this.editingSessionLink !== '') {
                this.editingSessionLinks.push({
                    name: this.editingSessionLinkName || this.editingSessionLink,
                    // If link is not a valid link, add a default protocol (HTTP)
                    link: (this.editingSessionLink.indexOf('http://') === 0) || (this.editingSessionLink.indexOf('https://') === 0) || (this.editingSessionLink.indexOf('zoommtg://') === 0) || (this.editingSessionLink.indexOf('msteams://') === 0) ? this.editingSessionLink : `http://${this.editingSessionLink}`,
                    passcode: this.editingSessionLinkCode,
                });

                this.editingSessionLink = '';
                this.editingSessionLinkCode = '';
                this.editingSessionLinkName = '';
                this.packery.shiftLayout();
            }
        },
        /**
         * Remove a link from the temporary list by index
         * @param {number} index link index
         */
        removeLink(index) {
            this.editingSessionLinks.splice(index, 1);
            this.packery.shiftLayout();
        },
        /**
         * Open a dialog for editing a subject
         * @param {object} item target subject
         */
        updateSubject(item) {
            const index = this.subjects.indexOf(item);
            this.editingMode = 'update';
            this.editingIndex = index;
            this.editingName = this.subjects[index].name;
            this.editingShortName = this.subjects[index].shortName;
            this.editingId = this.subjects[index].id;
            this.editingHomePage = this.subjects[index].homeLink;
            this.editingHide = this.subjects[index].hide;
            this.editingColor = this.subjects[index].color;
            this.editingSessionLink = '';
            this.editingSessionLinkCode = '';
            this.editingSessionLinkName = '';
            // Add links one by one to avoid reference copy
            this.editingSessionLinks = [];
            for (let i = 0; i < this.subjects[index].sessionLinks.length; i += 1) {
                this.editingSessionLinks.push(this.subjects[index].sessionLinks[i]);
            }
            this.dialog = true;
        },
        /**
         * Open a dialog for adding a subject
         */
        addSubject() {
            if (this.$route.path !== '/' || this.dialog) {
                return;
            }
            this.editingMode = 'add';
            this.editingIndex = -1;
            this.editingName = '';
            this.editingShortName = '';
            this.editingId = '';
            this.editingHomePage = '';
            this.editingHide = false;
            this.editingColor = this.colors[0];
            this.editingSessionLink = '';
            this.editingSessionLinks = [];
            this.dialog = true;
        },
        /**
         * Open a dialog before deleting a subject
         * @param {object} item target subject
         */
        removeSubject(item) {
            const index = this.subjects.indexOf(item);
            this.editingIndex = index;
            this.deleteDialog = true;
        },
        /**
         * Update or add a subject
         */
        confirmEdit() {
            if (this.editingName.length > 0 && this.editingShortName.length > 0 && this.editingId.length > 0 && this.editingHomePage.length > 0) {
                // Check if the ID is unique
                for (let i = 0; i < this.subjects.length; i += 1) {
                    if (this.subjects[i].id === this.editingId.toUpperCase() && i !== this.editingIndex) {
                        // Showthe unique ID warning dialog
                        this.sameIdError = true;
                        return;
                    }
                }
                if (this.editingMode === 'add') {
                    // Add a subject
                    this.subjects.push({
                        name: this.editingName,
                        shortName: this.editingShortName,
                        id: this.editingId.toUpperCase(),
                        homeLink: (this.editingHomePage.indexOf('http://') === 0) || (this.editingHomePage.indexOf('https://') === 0) ? this.editingHomePage : `http://${this.editingHomePage}`,
                        hide: this.editingHide,
                        sessionLinks: this.editingSessionLinks,
                        color: this.editingColor,
                        synced: false,
                        updated: new Date().valueOf(),
                    });
                } else {
                    // Update a subject
                    const editedItem = {
                        name: this.editingName,
                        shortName: this.editingShortName,
                        id: this.editingId.toUpperCase(),
                        homeLink: (this.editingHomePage.indexOf('http://') === 0) || (this.editingHomePage.indexOf('https://') === 0) ? this.editingHomePage : `http://${this.editingHomePage}`,
                        hide: this.editingHide,
                        sessionLinks: this.editingSessionLinks,
                        color: this.editingColor,
                        synced: this.subjects[this.editingIndex].synced,
                        updated: new Date().valueOf(),
                    };
                    this.subjects.splice(this.editingIndex, 1, editedItem);
                }
                // Close dialog
                this.dialog = false;

                // Update layout
                this.$nextTick(() => {
                    this.packery.shiftLayout();
                });
            }
        },
        /**
         * Remove a subject
         */
        confirmRemove() {
            const tempIndex = this.editingIndex;
            this.editingIndex = -1;
            this.subjects.splice(tempIndex, 1);
            this.deleteDialog = false;
            this.$nextTick(() => {
                this.packery.shiftLayout();
            });
        },
        /**
         * Toggle filter
         */
        toggleFilter() {
            if (this.$route.path !== '/') {
                return;
            }
            this.filter = !this.filter;
            localStorage.setItem('course_filter', this.filter);
        },
        /**
         * Store subjects data into localstorage
         */
        store() {
            localStorage.setItem('subjects', JSON.stringify(this.subjects));
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        subjects() {
            // Store when subjects changed
            this.$store.commit('setSubjects', this.subjects);
            this.store();
        },
        filter() {
            this.$nextTick(() => this.packery.shiftLayout());
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            packery: (state) => state.packery,
            widgets: (state) => state.widgets,
        }),
        /**
         * Whether the widget is shown
         * @returns {boolean} whether the widget is shown
         */
        shownSubjects() {
            // Filter out hidden subjects
            return this.subjects.filter((subject) => !subject.hide);
        },
        hiddenSubjects() {
            // Filter out shown subjects
            return this.filter ? [] : this.subjects.filter((subject) => subject.hide);
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Restore subjects from localstorage
        this.subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        localStorage.setItem('subjects', JSON.stringify(this.subjects));
        this.$store.commit('setSubjects', this.subjects);

        this.filter = (localStorage.getItem('course_filter') || 'false') === 'true';
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
};
</script>

<style lang="less">
.courses-container {
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
        .header-icon {
            margin-right: -4px;
        }
    }
    .subject-id {
        opacity: .5;
    }
    .subject-table {
        .v-data-table__wrapper {
            min-width: 100%;
        }
        tbody tr, tbody tr td {
            height: 56px;
        }
        .hide td {
            color: #cccccc;
        }
        .hide button {
            opacity: .25;
        }
        .hide button:hover, .hide button:focus {
            opacity: 1;
        }
        .edit-icons {
            width: 96px;
            padding-right: 6px;
            padding-left: 12px;
        }
        .subject-color-samll {
            width: 10px;
            height: 10px;
            display: inline-block;
            border-radius: 50%;
            margin: 0;
            &.subject-color-hidden {
                opacity: .25;
            }
        }
    }
    .empty {
        width: 100%;
        height: 225px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: .5;
        font-size: 15px;
    }
    .subjects-outer {
        width: 100%;
        min-height: 260px;
    }
}
.container .checkbox {
    margin-top: -10px;
}
.container .inline-help-icon {
    vertical-align: baseline!important;
    margin-left: 5px;
    transform: translateY(-3px);
    font-size: 18px!important;
}
.subject-links {
    width: 100%;
    background-color: #F5F5F5;
    padding: 15px;
    box-sizing: border-box;
    max-height: 500px;
    overflow: auto;
    .link-url {
        width: 65%;
    }
    .link-code {
        width: calc(35% - 8px);
    }
    .add-submit {
        height: 40px!important;
        min-width: 56px!important;
        margin-left: 8px;
    }
    .list {
        background-color: transparent;
        padding-top: 15px;
        &.non-empty {
            min-height: 130px;
        }
        .v-list-item {
            cursor: default;
            min-height: 36px;
            padding: 0;
        }
        a {
            cursor: pointer;
        }
        a.no-underline-link {
            text-decoration: none;
            padding-left: 5px;
        }
        .v-list-item__content {
            padding: 0;
        }
        .v-list-item__action {
            margin-right: 16px;
        }
        .delete {
            margin: 0;
            margin-left: 8px!important;
            flex-direction: row;
            align-items: center;
        }
    }
}
.subject-color {
    margin-bottom: 30px;
    & > span {
        display: block;
        margin-bottom: 10px;
        color: rgba(0, 0, 0, 0.6);
        font-size: 16px;
    }
}
#app.theme--dark .subjects-container {
    .subject-table {
        .hide td {
            color: #555555;
        }
    }
}
#app.theme--dark .subject-links {
    background-color: #2c2c2c;
}
#app.theme--dark .subject-color {
    & > span {
        color: rgba(255, 255, 255, 0.7);
    }
}
</style>

<i18n>
{
    "en": {
        "courses": "Manage Course Units",
        "nothing": "No course units yet",
        "name": "Name",
        "actions": "Actions",
        "add_subject": "Add course unit",
        "edit_subject": "Edit course unit",
        "cancel": "Cancel",
        "save": "Save",
        "add": "Add",
        "delete": "Delete",
        "subject_name": "Course Unit Name *",
        "subject_name_hint": "E.g. Mathematical Techniques",
        "short_name": "Short Name *",
        "short_name_hint": "E.g. Maths",
        "subject_number": "Course Unit Code *",
        "subject_number_hint": "E.g. COMP11120",
        "subject_home": "Course Unit Home Page *",
        "subject_color": "Course Unit Colour",
        "hide_subject": "Hide this course unit",
        "hide_help": "Hide this course unit in the Quick Links and Online Session Links widgets, but keep recognizing this course unit in other widgets.",
        "live_links": "Online Session Links",
        "live_link_code": "Passcode",
        "link_name": "Link Name",
        "link_format": "URL[ name][ passcode]",
        "delete_subject": "Delete course unit",
        "delete_subject_text": "Do you want to delete the course unit {0}?",
        "filter_course": "Filter out hidden courses",
        "error": "Cannot Save",
        "same_id": "This code is already linked to another course unit. Changes not saved.",
        "ok": "OK",
        "quick_zoom": "Zoom meeting quick start",
        "quick_teams": "Teams meeting quick start"
    },
    "zh": {
        "courses": "科目管理",
        "nothing": "还没有科目",
        "name": "名称",
        "actions": "操作",
        "add_subject": "添加科目",
        "edit_subject": "编辑科目",
        "cancel": "取消",
        "save": "保存",
        "add": "添加",
        "delete": "删除",
        "subject_name": "科目名称 *",
        "subject_name_hint": "例如 Mathematical Techniques",
        "short_name": "简短名称 *",
        "short_name_hint": "例如 Math",
        "subject_number": "科目编号 *",
        "subject_number_hint": "例如 COMP11120",
        "subject_home": "科目主页 *",
        "subject_color": "科目颜色",
        "hide_subject": "隐藏这个科目",
        "hide_help": "在快速链接和在线课程链接中隐藏此科目，但在其他组件中保持对此科目的识别。",
        "live_links": "在线课程链接",
        "live_link_code": "密码",
        "link_name": "链接名称",
        "delete_subject": "删除科目",
        "delete_subject_text": "你确定要删除科目 {0} 吗？",
        "filter_course": "过滤隐藏的科目",
        "error": "无法保存",
        "same_id": "这个科目编号已经关联到其他科目。更改没有保存。",
        "ok": "好",
        "quick_zoom": "快速启动 Zoom 会议",
        "quick_teams": "快速启动 Teams 会议"
    },
    "es": {
        "courses": "Administrar asignaturas",
        "nothing": "No asignaturas todavía",
        "name": "Nombre",
        "actions": "Acción",
        "add_subject": "Añadir asignatura",
        "edit_subject": "Editar asignatura",
        "cancel": "Cancelar",
        "save": "Guardar",
        "add": "Añadir",
        "delete": "Eliminar",
        "subject_name": "Nombre de asignatura *",
        "subject_name_hint": "E.g. Mathematical Techniques",
        "short_name": "Nombre corto *",
        "short_name_hint": "E.g. Math",
        "subject_number": "Número de asginatura *",
        "subject_number_hint": "E.g. COMP11120",
        "subject_home": "Página principal de la asignatura *",
        "subject_color": "Color de asignatura",
        "hide_subject": "Esconder esta asignatura",
        "hide_help": "",
        "live_links": "Enlaces de clases online",
        "live_link_code": "",
        "link_name": "",
        "delete_subject": "Eliminar asignatura",
        "delete_subject_text": "Está seguro de eliminar la asignatura {0}?",
        "filter_course": "",
        "error": "No se ha podido guardar",
        "same_id": "Este número de asignatura ya está conectada a otra asignatura. Cambios no se ha guardado.",
        "ok": "OK",
        "quick_zoom": "Acceder a Zoom",
        "quick_teams": "Acceder a Teams"
    },
    "ja": {
        "courses": "科目管理",
        "nothing": "まだ科目がありません",
        "name": "科目名",
        "actions": "操作",
        "add_subject": "科目を追加する",
        "edit_subject": "科目を編集する",
        "cancel": "キャンセル",
        "save": "保存",
        "add": "追加",
        "delete": "削除",
        "subject_name": "科目名 *",
        "subject_name_hint": "例えば Mathematical Techniques",
        "short_name": "短縮名 *",
        "short_name_hint": "例えば Math",
        "subject_number": "科目番号 *",
        "subject_number_hint": "例えば COMP11120",
        "subject_home": "科目ホームページ *",
        "subject_color": "科目の色",
        "hide_subject": "この科目を隠す",
        "hide_help": "",
        "live_links": "オンライン授業リンク",
        "live_link_code": "",
        "link_name": "",
        "delete_subject": "科目を削除する",
        "delete_subject_text": "本当にこの科目 {0} を削除しますか？",
        "filter_course": "隠れた科目を除外する",
        "error": "保存できません",
        "same_id": "この科目番号はもう他の科目に関していますので、変更が保存されません。",
        "ok": "はい",
        "quick_zoom": "Zoomミーテイングを起動する",
        "quick_teams": "Teamsミーテイングを起動する"
    }
}
</i18n>

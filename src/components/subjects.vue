<template>
    <v-card
        class="mx-auto rounded-lg subjects-container"
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
                {{ $t('subjects') }}
                <v-btn icon @click.stop="addSubject" small class="float-right header-icon">
                    <v-icon>mdi-plus</v-icon>
                </v-btn>
            </h2>
            <v-simple-table v-if="subjects.length > 0" class="subject-table rounded-0">
                <template v-slot:default>
                    <thead>
                        <tr>
                            <th class="text-left">
                                {{ $t('name') }}
                            </th>
                            <th class="text-left">
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
                            <td><span :class="item.color" class="subject-color-samll mr-2"></span>{{ item.name }}<br><span class="subject-id">{{ item.id }}</span></td>
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
                            <td><span :class="item.color" class="subject-color-samll mr-2 subject-color-hidden"></span>{{ item.name }}<br><span class="subject-id">{{ item.id }}</span></td>
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
                            filled
                            :label="$t('subject_name')"
                            :hint="$t('subject_name_hint')"
                            prepend-inner-icon="mdi-text-subject"
                        ></v-text-field>
                        <v-text-field
                            v-model.trim="editingShortName"
                            filled
                            :label="$t('short_name')"
                            :hint="$t('short_name_hint')"
                            prepend-inner-icon="mdi-text-short"
                        ></v-text-field>
                        <v-text-field
                            v-model.trim="editingId"
                            filled
                            :label="$t('subject_number')"
                            :hint="$t('subject_number_hint')"
                            prepend-inner-icon="mdi-numeric"
                        ></v-text-field>
                        <v-text-field
                            v-model.trim="editingHomePage"
                            filled
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
                            class="checkbox"
                        ></v-checkbox>
                        <div class="subject-links rounded-lg">
                            <v-text-field
                                v-model.trim="editingSessionLink"
                                outlined
                                :label="$t('add_link')"
                                hide-details
                                clearable
                                prepend-inner-icon="mdi-link-variant"
                                v-on:keyup.enter="addLink"
                            ></v-text-field>
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
                                                <code v-if="link.passcode" class="mr-1">{{ link.passcode }}</code>
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
            max-width="315"
            v-if="editingIndex !== -1"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('delete_subject') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('delete_subject_text') }}<strong>{{ subjects[editingIndex].name }}</strong>{{ $t('delete_subject_mark') }}
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

export default {
    name: 'subjects',
    data() {
        return {
            subjects: [],
            loading: false,
            dialog: false,
            editingMode: 'update',
            editingIndex: -1,
            editingName: '',
            editingShortName: '',
            editingId: '',
            editingHomePage: '',
            editingHide: false,
            editingColor: 'blue',
            editingSessionLink: '',
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
                const input = this.editingSessionLink.split(' ');
                const link = input.shift();
                let name = link;
                let passcode = '';
                if (input.length !== 0) {
                    // Extract passcode if it exists
                    if (/^\d{4,6}$/i.test(input[input.length - 1])) {
                        passcode = input[input.length - 1];
                        input.pop();
                    }
                    name = input.join(' ');
                }
                this.editingSessionLinks.push({
                    name,
                    // If link is not a valid link, add a default protocol (HTTP)
                    link: (link.indexOf('http://') === 0) || (link.indexOf('https://') === 0) || (link.indexOf('zoommtg://') === 0) || (link.indexOf('msteams://') === 0) ? link : `http://${link}`,
                    passcode,
                });
                this.editingSessionLink = '';
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
            this.editingMode = 'add';
            this.editingIndex = -1;
            this.editingName = '';
            this.editingShortName = '';
            this.editingId = '';
            this.editingHomePage = '';
            this.editingHide = false;
            this.editingColor = 'blue';
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
         * Store subjects data into localstorage
         */
        store() {
            localStorage.setItem('subjects', JSON.stringify(this.subjects));
            this.sync();
        },
        /**
         * Sync data with backend
         */
        sync() {
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
            }, 1000);
        },
        /**
         * Get direct link to meeting apps, supports Zoom and Teams
         * @param {string} link original link
         * @param {string} passcode passcode for the meeting or ''
         * @returns {string} converted direct link or the original link
         */
        meetingLink(link, passcode) {
            if (this.ifZoomLink(link)) {
                const linkSplit = link.split('/j/');
                return `${this.zoomProtocol()}://zoom.us/join?action=join&confno=${linkSplit[linkSplit.length - 1].split('#')[0]}${passcode ? `&pwd=${passcode}` : ''}&zc=0`;
            }
            if (this.ifTeamsLink(link)) {
                const linkSplit = link.split('://');
                linkSplit.shift();
                return `msteams://${linkSplit.join('://')}`;
            }
            return link;
        },
        /**
         * Check if it's a Zoom link
         * @param {string} link original link
         * @returns {boolean} whether it's a Zoom link
         */
        ifZoomLink(link) {
            return (link.indexOf('https://zoom.us/j/') === 0 || link.indexOf('http://zoom.us/j/') === 0);
        },
        /**
         * Check if it's a Teams link
         * @param {string} link original link
         * @returns {boolean} whether it's a Teams link
         */
        ifTeamsLink(link) {
            return (link.indexOf('https://teams.microsoft.com/l/') === 0 || link.indexOf('http://teams.microsoft.com/l/') === 0);
        },
        /**
         * Get Zoom's direct link protocol based on device
         * @returns {string} protocol
         */
        zoomProtocol() {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/windows phone/i.test(userAgent) || /android/i.test(userAgent) || ([
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod',
            ].includes(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document))) {
                return 'zoomus';
            }
            return 'zoommtg';
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
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            packery: (state) => state.packery,
        }),
        shownSubjects() {
            // Filter out hidden subjects
            return this.subjects.filter((subject) => !subject.hide);
        },
        hiddenSubjects() {
            // Filter out shown subjects
            return this.subjects.filter((subject) => subject.hide);
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Restore subjects from localstorage
        this.subjects = JSON.parse(localStorage.getItem('subjects')) || [];
        localStorage.setItem('subjects', JSON.stringify(this.subjects));
        this.$store.commit('setSubjects', this.subjects);

        // Sync with backend every 3 hours
        this.timer = setInterval(() => {
            this.sync();
        }, 10800000);
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
};
</script>

<style lang="less">
.subjects-container {
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
        opacity: .4;
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
.subject-links {
    width: 100%;
    background-color: #F5F5F5;
    padding: 15px;
    box-sizing: border-box;
    max-height: 500px;
    overflow: auto;
    .list {
        padding-top: 0;
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
        "subjects": "Subject Manage",
        "nothing": "No subject yet",
        "name": "Name",
        "actions": "Actions",
        "add_subject": "Add Subject",
        "edit_subject": "Edit Subject",
        "cancel": "Cancel",
        "save": "Save",
        "add": "Add",
        "delete": "Delete",
        "subject_name": "Subject Name *",
        "subject_name_hint": "E.g. Mathematical Techniques",
        "short_name": "Short Name *",
        "short_name_hint": "E.g. Math",
        "subject_number": "Subject Number *",
        "subject_number_hint": "E.g. COMP11120",
        "subject_home": "Subject Home Page *",
        "subject_color": "Subject Color",
        "hide_subject": "Hide this subject",
        "add_link": "Add a live session link",
        "delete_subject": "Delete subject",
        "delete_subject_text": "Do you want to delete subject ",
        "delete_subject_mark": "?",
        "error": "Cannot Save",
        "same_id": "This subject ID is already linked to another subject. Changes not saved.",
        "ok": "OK",
        "quick_zoom": "Zoom meeting quick start",
        "quick_teams": "Teams meeting quick start"
    },
    "zh": {
        "subjects": "科目管理",
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
        "add_link": "添加在线课程链接",
        "delete_subject": "删除科目",
        "delete_subject_text": "你确定要删除科目 ",
        "delete_subject_mark": " 吗？",
        "error": "无法保存",
        "same_id": "这个科目编号已经关联到其他科目。更改没有保存。",
        "ok": "好",
        "quick_zoom": "快速启动 Zoom 会议",
        "quick_teams": "快速启动 Teams 会议"
    }
}
</i18n>

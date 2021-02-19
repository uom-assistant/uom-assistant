<template>
    <v-card
        class="mx-auto rounded-lg mail-container"
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
        <div class="mail-outer">
            <h2 class="handle">
                {{ $t('mail') }}
                <v-btn icon @click.stop="sendMail" small class="float-right mr-4" :title="$t('write')">
                    <v-icon>mdi-email-edit-outline</v-icon>
                </v-btn>
                <v-btn icon small class="float-right mr-2" :title="$t('select')">
                    <v-icon>mdi-checkbox-multiple-blank-outline</v-icon>
                </v-btn>
            </h2>
            <div class="scroll" v-if="mails.length !== 0">
                <v-list flat class="list">
                    <v-list-item v-for="(mail, index) in mails" :key="index" @click.stop="openMail(index)">
                        <v-list-item-icon>
                            <v-icon>mdi-file-document-edit-outline</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                            <v-list-item-title>{{ mail.title }}</v-list-item-title>
                            <v-list-item-subtitle>
                                <v-icon
                                    small
                                    class="time-icon"
                                >
                                    mdi-clock-outline
                                </v-icon>
                                {{ getDate(new Date(mail.update)) }}
                            </v-list-item-subtitle>
                        </v-list-item-content>

                        <v-list-item-action class="delete">
                            <v-btn icon @click.stop="removeMail(index)">
                                <v-icon color="grey">mdi-delete-outline</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list>
            </div>
            <div class="empty" v-else>
                {{ $t('nothing') }}
            </div>
        </div>
        <div class="editor-layer-mask" :class="{ opened: layerOpened }"></div>
        <div class="editor-layer" :class="{ opened: layerOpened }">
            <h2 class="handle">
                <span>{{ $t('new_mail') }}</span>
                <v-icon class="ml-1 md-icon" :title="$t('md_support')">
                    mdi-language-markdown
                </v-icon>
                <v-btn icon @click.stop="layerOpened = false" small class="float-right mr-4">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-btn icon @click.stop="mode = 'view'" v-show="mode === 'edit'" small class="float-right mr-2" :title="$t('view')">
                    <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn icon @click.stop="mode = 'edit'" v-show="mode === 'view'" small class="float-right mr-2" :title="$t('edit')">
                    <v-icon>mdi-pencil-outline</v-icon>
                </v-btn>
            </h2>
            <v-divider></v-divider>
            <codemirror v-model="code" :options="cmOption" class="md-editor" v-show="mode === 'edit'" :key="cmRefresh" ref="codemirror" @scroll="onScroll"></codemirror>
            <div class="render-result" v-show="mode === 'view'" @dblclick="mode = 'edit'" @scroll="onScrollView" ref="renderScroll"><div ref="render"></div></div>
        </div>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import { codemirror } from 'vue-codemirror';
import markdown from 'markdown-it';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';

import formatDateTime from '../tools/formatDateTime';

import 'codemirror/theme/xq-light.css';
import 'codemirror/lib/codemirror.css';

export default {
    name: 'mail',
    components: {
        codemirror,
    },
    data() {
        return {
            loading: false,
            mails: [],
            addText: '',
            layerOpened: false,
            mode: 'view',
            md: null,
            cmRefresh: `${new Date().valueOf()}`,
            editing: 0,
            code: '',
            scrollPercentage: 0,
            timer: null,
            cmOption: {
                tabSize: 4,
                indentUnit: 4,
                styleActiveLine: true,
                lineNumbers: false,
                lineWrapping: true,
                line: true,
                mode: 'text/x-markdown',
                theme: 'xq-light',
                autoCloseBrackets: true,
                showCursorWhenSelecting: true,
                matchBrackets: true,
                insertSoftTab: true,
                extraKeys: {
                    Tab: (cm) => {
                        if (cm.somethingSelected()) {
                            cm.indentSelection('add');
                        } else {
                            cm.replaceSelection('    ', 'end');
                        }
                    },
                    'Shift-Tab': (cm) => {
                        if (cm.somethingSelected()) {
                            cm.indentSelection('subtract');
                        } else {
                            cm.indentLine(cm.getCursor().line, 'subtract');
                        }
                    },
                },
            },
        };
    },
    methods: {
        sendMail() {
            this.mails.unshift({
                title: this.$t('new_mail'),
                content: '',
                update: new Date().valueOf(),
            });
            this.code = '';
            this.editing = 0;
            this.mode = 'edit';
            this.scrollPercentage = 0;
            this.$nextTick(() => {
                this.layerOpened = true;
                setTimeout(() => {
                    this.$refs.codemirror.codemirror.scrollTo(null, 0);
                    this.$refs.codemirror.codemirror.focus();
                }, 500);
            });
        },
        openMail(index) {
            this.editing = index;
            this.code = this.mails[index].content;
            if (this.code !== '') {
                this.mode = 'view';
                this.scrollPercentage = 0;
                this.$nextTick(() => {
                    this.layerOpened = true;
                });
            } else {
                this.mode = 'edit';
                this.scrollPercentage = 0;
                this.$nextTick(() => {
                    this.layerOpened = true;
                    setTimeout(() => {
                        this.$refs.codemirror.codemirror.scrollTo(null, 0);
                        this.$refs.codemirror.codemirror.focus();
                    }, 500);
                });
            }
        },
        removeMail(index) {
            this.editing = 0;
            this.scrollPercentage = 0;
            this.mails.splice(index, 1);
        },
        store() {
            // localStorage.setItem('mails', JSON.stringify(this.mails));
            // this.sync();
        },
        sync() {
            this.loading = true;
            setTimeout(() => {
                this.loading = false;
            }, 1000);
        },
        getDate(dateObj) {
            return formatDateTime(dateObj, this.locale);
        },
        onScroll(e) {
            const scroller = e.getScrollInfo();
            this.scrollPercentage = scroller.top / (scroller.height - 500);
        },
        onScrollView(e) {
            this.scrollPercentage = e.target.scrollTop / (this.$refs.render.clientHeight - 475);
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        code() {
            this.mails[this.editing].content = this.code;
        },
        mode() {
            if (this.mode === 'edit') {
                // Refresh editor otherwise it will not shown
                this.cmRefresh = `${new Date().valueOf()}`;
                this.$nextTick(() => {
                    // Sync scroll between to views
                    this.$refs.codemirror.codemirror.scrollTo(null, this.scrollPercentage * (this.$refs.codemirror.codemirror.getScrollInfo().height - 500));
                });
            } else {
                if (this.$refs.render) {
                    // Render Markdown
                    this.$refs.render.innerHTML = this.md.render(this.code).replace('<a href="', '<a target="_blank" rel="noreferrer noopener" href="');
                    this.$nextTick(() => {
                        this.$refs.renderScroll.scrollTo(null, this.scrollPercentage * (this.$refs.render.clientHeight - 475));
                    });
                }
            }
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Fetch mails every 10 minutes
        this.timer = setInterval(() => {
            this.sync();
        }, 600000);

        // Render note
        this.md = markdown({
            html: false,
            xhtmlOut: false,
            breaks: false,
            langPrefix: 'language-',
            linkify: true,
            typographer: false,
            highlight: '',
        });

        // Render mail
        if (this.$refs.render) {
            this.$refs.render.innerHTML = this.md.render(this.code).replace('<a href="', '<a target="_blank" rel="noreferrer noopener" href="');
        }
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
};
</script>

<style lang="less">
.mail-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
    .loading {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 99;
    }
    h2 {
        font-size: 18px;
        font-weight: normal;
        opacity: .87;
        margin-top: 18px;
        margin-bottom: 15px;
        margin-left: 20px;
        .md-icon {
            padding-bottom: 2px;
        }
    }
    .editor-layer-mask {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 3;
        width: 100%;
        height: 561px;
        background-color: black;
        opacity: 0;
        pointer-events: none;
        transition: opacity .4s cubic-bezier(0.23, 1, 0.32, 1);
        &.opened {
            opacity: .4;
        }
    }
    .editor-layer {
        position: absolute;
        top: 561px;
        left: 0;
        z-index: 3;
        width: 100%;
        height: 561px;
        background-color: white;
        border-radius: 5px;
        pointer-events: none;
        transition: top .4s cubic-bezier(0.23, 1, 0.32, 1);
        h2 {
            font-size: 18px;
            font-weight: normal;
            opacity: .87;
            margin-top: 18px;
            margin-bottom: 15px;
            margin-left: 20px;
            .title-input {
                -webkit-appearance: none;
                width: calc(100% - 120px);
                outline: transparent;
            }
        }
        &.opened {
            top: 0;
            pointer-events: auto;
        }
        .render-result {
            height: 500px;
            overflow: auto;
            overscroll-behavior: contain;
            padding: 10px 20px;
            h1 {
                border-bottom: 1px solid #eaecef;
            }
            h2 {
                display: block;
                font-size: 1.5em;
                margin-block-start: 0.83em;
                margin-block-end: 0.83em;
                margin-inline-start: 0px;
                margin-inline-end: 0px;
                margin: 0;
                font-weight: bold;
                border-bottom: 1px solid #eaecef;
            }
            h1, h2, h3, h4, h5, h6 {
                margin-bottom: 0.3em;
            }
            ul, ol, p {
                margin-bottom: 12px;
            }
            hr {
                display: block;
                flex: 1 1 0px;
                max-width: 100%;
                height: 0px;
                max-height: 0px;
                border: solid;
                border-width: thin 0 0 0;
                border-color: rgba(0, 0, 0, 0.2);
                margin-bottom: 12px;
            }
            .hljs {
                margin: 5px 0 12px 0;
                border-radius: 5px;
                font-size: 14px;
                padding: 10px 12px;
                background-color: #f8f8f8;
                .hljs-comment {
                    color: #888888;
                }
            }
            img {
                margin: 0 auto;
                max-width: 100%;
            }
            .accent {
                background-color: transparent!important;
                border: none!important;
                border-color: transparent!important;
            }
            blockquote {
                padding-left: 12px;
                border-left: 4px solid #EEEEEE;
                color: #999999;
            }
        }
        .md-editor {
            height: 500px;
            .CodeMirror {
                height: 500px;
                padding: 0;
                font-family: Consolas, "Courier New SC", "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", monospace;
                line-height: 20px;
                overscroll-behavior: contain;
                pre.CodeMirror-line, pre.CodeMirror-line-like {
                    padding: 0 10px;
                }
            }
            .cm-s-xq-light .CodeMirror-activeline-background {
                background-color: #f3f3f3;
            }
            .cm-s-xq-light .CodeMirror-matchingbracket {
                background-color: transparent;
            }
            .cm-s-xq-light span.cm-comment {
                color: #888888;
            }
            .cm-s-xq-light span.cm-def {
                text-decoration: none;
                color: #660099;
            }
            .cm-s-xq-light span.cm-header {
                text-decoration: none;
                color: #f89500;
            }
            .cm-s-xq-light span.cm-string {
                color: #2196F3;
            }
            .CodeMirror-focused .CodeMirror-selected {
                background: #cbe4ff;
            }
            .cm-s-xq-light span.cm-keyword {
                font-weight: normal;
            }
            .cm-s-xq-light span.cm-meta {
                color: #ec134a;
            }
            .cm-s-xq-light .cm-variable-2 {
                color: #877a9b;
            }
            .cm-s-xq-light .cm-variable {
                color: #7a9b98;
            }
            .cm-s-xq-light span.cm-type {
                color: #6da0c2;
            }
        }
    }
    .list {
        padding-top: 0;
        .v-list-item__action {
            margin: 0px 16px 0 0;
        }
        .v-list-item__icon {
            margin: 15px 16px 0 0;
        }
        .delete {
            margin: 0 0 0 8px;
            opacity: 0;
            transition: .2s;
        }
        .v-list-item {
            transition: background-color .2s;
            min-height: 30px;
            &:hover, &:focus {
                background-color: rgba(0, 0, 0, .04);
                .delete {
                    opacity: 1;
                }
            }
        }
        .v-list-item__content {
            padding: 8px 0;
        }
        .time-icon {
            vertical-align: text-top;
        }
        .multi.v-list-item--active {
            background-color: fade(#660099, 12%);
            .v-icon {
                color: rgba(0, 0, 0, 0.54);
            }
        }
    }
    .empty {
        width: 100%;
        height: 500px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: .5;
        font-size: 15px;
    }
    .mail-outer {
        width: 100%;
        height: 542px;
    }
    .scroll {
        height: 500px;
        overflow: auto;
    }
}
#app.theme--dark .mail-container {
    .editor-layer {
        background-color: #1E1E1E;
        h2 {
            .title-input {
                color: white;
            }
        }
        .render-result {
            color: rgba(255, 255, 255, .87);
            h1 {
                border-bottom: 1px solid #3A3A3A;
            }
            h2 {
                border-bottom: 1px solid #3A3A3A;
            }
            hr {
                border-color: rgba(255, 255, 255, 0.2);
            }
            .hljs {
                background-color: #cfcfcf;
                filter: invert(1) hue-rotate(180deg) brightness(1.1);
            }
            blockquote {
                border-left: 4px solid #3b3b3b;
                color: #999999;
            }
        }
        .md-editor {
            .CodeMirror-sizer, .CodeMirror-scroll {
                background-color: #1E1E1E;
                color: rgba(255, 255, 255, .87);
            }
            .cm-s-xq-light .CodeMirror-matchingbracket {
                color: white!important;
            }
            .cm-s-xq-light .CodeMirror-activeline-background {
                background-color: #444444;
            }
            .cm-s-xq-light span.cm-comment {
                color: #777777;
            }
            .cm-s-xq-light span.cm-def {
                text-decoration: none;
                color: #D099E0;
            }
            .cm-s-xq-light span.cm-keyword {
                color: #6a6baa;
            }
            .CodeMirror-focused .CodeMirror-selected {
                background: #343a41;
            }
            .cm-s-xq-light span.cm-meta {
                color: #e96888;
            }
            .cm-s-xq-light span.cm-number {
                color: #6DC2A0;
            }
            .CodeMirror-cursor {
                border-left: 1px solid white;
            }
        }
    }
    .list {
        .v-list-item {
            &:hover, &:focus {
                background-color: rgba(255, 255, 255, .04);
            }
        }
        .multi.v-list-item--active {
            background-color: fade(#D099E0, 12%);
            .v-icon {
                color: rgba(255, 255, 255, 0.7);
            }
        }
    }
}
</style>

<i18n>
{
    "en": {
        "mail": "Inbox",
        "nothing": "No mail",
        "new_mail": "New Mail",
        "md_support": "Markdown supported",
        "view": "View",
        "edit": "Edit",
        "write": "Write mail",
        "select": "Multiple select"
    },
    "zh": {
        "mail": "收件箱",
        "nothing": "没有邮件",
        "new_mail": "新邮件",
        "md_support": "支持 Markdown",
        "view": "查看",
        "edit": "编辑",
        "write": "写邮件",
        "select": "多选"
    }
}
</i18n>

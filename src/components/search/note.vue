<template>
    <v-card
        class="mx-auto note-search-container pl-0 pr-0 mb-2"
        outlined
    >
        <v-list flat class="list">
            <v-list-item v-for="(note, index) in notes" :key="index" @click.stop="openNote(note.rawIndex)">
                <v-list-item-icon>
                    <v-icon>mdi-file-document-edit-outline</v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                    <v-list-item-title>{{ note.rawTitle === '' ? '' : note.rawTitle }}<em v-if="note.rawTitle === ''">{{ $t('untitled') }}</em></v-list-item-title>
                    <v-list-item-subtitle>
                        <span :class="{ hide: note.content !== '' }">
                            <v-icon
                                small
                                class="time-icon"
                            >
                                mdi-clock-outline
                            </v-icon>
                            {{ getDate(new Date(note.update)) }}
                        </span>
                        <div class="text-truncate" v-if="note.content !== ''">{{ note.content }}</div>
                    </v-list-item-subtitle>
                </v-list-item-content>

                <v-list-item-action class="delete">
                    <div>
                        <v-btn icon @click.stop="downloadNote(note.rawIndex)" :title="$t('download')">
                            <v-icon color="grey">mdi-arrow-collapse-down</v-icon>
                        </v-btn>
                        <v-btn icon @click.stop="removeNote(note.rawIndex)" :title="$t('delete')">
                            <v-icon color="grey">mdi-delete-outline</v-icon>
                        </v-btn>
                    </div>
                </v-list-item-action>
            </v-list-item>
        </v-list>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import formatDateTime from '@/tools/formatDateTime';

export default {
    name: 'noteSearch',
    props: {
        notes: Array,
    },
    methods: {
        /**
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @returns {string} formatted a date string
         */
        getDate(dateObj) {
            return formatDateTime(dateObj, this.locale, window.uomaTimeFormatters);
        },
        /**
         * Open a note in widget
         * @param {number} index note index
         */
        openNote(index) {
            this.$store.commit('setSearchNotification', {
                target: 'note',
                payload: { action: 'openNote', index },
            });
            this.$parent.$parent.searchOpened = false;
        },
        /**
         * Remove a note from note list
         * @param {number} index note index
         */
        removeNote(index) {
            this.$store.commit('setSearchNotification', {
                target: 'note',
                payload: { action: 'removeNote', index },
            });
        },
        /**
         * Download a note
         * @param {number} index note index
         */
        downloadNote(index) {
            this.$store.commit('setSearchNotification', {
                target: 'note',
                payload: { action: 'downloadNote', index },
            });
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
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';
    },
};
</script>

<style lang="less">
.note-search-container {
    position: relative;
    overflow: hidden;
    border-radius: 6px!important;
    contain: layout paint;
    .list {
        background-color: transparent!important;
        .v-list-item__icon {
            margin: 15px 16px 0 0!important;
        }
        .v-list-item__subtitle {
            & > div {
                display: none;
                margin-top: 1px;
            }
        }
        .delete {
            margin: 0 0 0 8px;
            @media (hover: hover) {
                transition: .2s;
                opacity: 0;
            }
        }
        .v-list-item {
            transition: background-color .2s;
            min-height: 30px;
            @media (hover: hover) {
                &:hover, &:focus {
                    background-color: rgba(0, 0, 0, .04);
                    .delete {
                        opacity: 1;
                    }
                    .v-list-item__subtitle {
                        & > span.hide {
                            display: none;
                        }
                        & > div {
                            display: block;
                        }
                    }
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
}
#app.theme--dark .note-search-container {
    background-color: #272727;
    .list {
        .v-list-item {
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
        "no_content": "No content",
        "untitled": "Untitled",
        "download": "Download",
        "delete": "Delete"
    },
    "zh": {
        "no_content": "无内容",
        "untitled": "无标题",
        "download": "下载",
        "delete": "删除"
    },
    "es": {
        "no_content": "Sin contenido",
        "untitled": "Sin título",
        "download": "Descargar",
        "delete": "Eliminar"
    },
    "ja": {
        "no_content": "内容無し",
        "untitled": "タイトル無し",
        "download": "ダウンロード",
        "delete": "削除"
    }
}
</i18n>

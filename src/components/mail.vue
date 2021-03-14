<template>
    <v-card
        class="mx-auto rounded-lg mail-container"
        outlined
    >
        <div class="mail-outer">
            <h2 class="handle">
                {{ $t('mail') }}
                <span class="num-badge" v-show="mailUnseen.length > 0">{{ mailUnseen.length }}</span>
                <v-progress-circular
                    indeterminate
                    color="grey"
                    :width="2"
                    :size="18"
                    class="loading ml-3"
                    v-show="loading || loadingFlag.length > 0 || downloading !== ''"
                ></v-progress-circular>
                <v-menu
                    offset-y
                    bottom
                    left
                    transition="slide-y-transition"
                    nudge-bottom="5"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon small class="float-right mr-3" :title="$t('more')" v-on="on" v-bind="attrs">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list flat class="shown-list pt-0 pb-0">
                        <v-list-item class="pt-2 pb-2 mail-all-read" @click="markAllAsRead" :disabled="!init || loading || loadingFlag.length > 0 || downloading !== ''">
                            <v-list-item-icon>
                                <v-icon>mdi-email-open-multiple-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ $t('all_read') }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item-group
                            v-model="ifNotify"
                            multiple
                        >
                            <v-list-item class="pt-2 pb-2">
                                <template v-slot:default="{ active }">
                                    <v-list-item-action>
                                        <v-checkbox :input-value="active"></v-checkbox>
                                    </v-list-item-action>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ $t('sound_notification') }}</v-list-item-title>
                                    </v-list-item-content>
                                </template>
                            </v-list-item>
                        </v-list-item-group>
                    </v-list>
                </v-menu>
                <audio class="new-mail-audio" ref="audio">
                    <source src="@/assets/audios/new_mail.mp3" type="audio/mpeg">
                    <source src="@/assets/audios/new_mail.ogg" type="audio/ogg">
                </audio>
                <v-btn icon @click.stop="manualRefresh" small class="float-right mr-1" :title="$t('refresh')" :disabled="loading || loadingFlag.length > 0 || downloading !== ''" v-if="init" :loading="refreshLoding">
                    <v-icon>mdi-sync</v-icon>
                    <template v-slot:loader>
                        <span class="refresh-loading">
                            <v-icon light>mdi-sync</v-icon>
                        </span>
                    </template>
                </v-btn>
                <v-btn icon @click.stop="sendMail" small class="float-right mr-2" :title="$t('write')" v-if="init">
                    <v-icon>mdi-email-edit-outline</v-icon>
                </v-btn>
            </h2>
            <v-skeleton-loader
                class="mx-auto"
                type="list-item-avatar-three-line@4"
                v-if="!init && loading"
            ></v-skeleton-loader>
            <div class="scroll" v-if="mails.length > 0">
                <v-list flat class="list">
                    <v-list-item v-for="(mail, index) in mails" :key="mail.id" @click.stop="openMail(mail.id)" :class="{ flaged: mail.flagged, unseen: mail.unseen }" @contextmenu.prevent="(e) => showListMenu(e, mail.id)">
                        <v-list-item-avatar :color="(mail.flagged || mail.unseen) ? 'uomthemelight' : ($vuetify.theme.dark ? 'grey darken-1' : 'grey lighten-2')" v-if="getSubjectId(mail.subject, mail.from) === false" :class="{ 'black--text': ((mail.flagged || mail.unseen) && $vuetify.theme.dark) }">
                            <span v-if="getMailAvatar(mail.subject, mail.from, mail.fromAddress) === false">{{ getTwoLetterSenderName(mail.from ? mail.from : mail.fromAddress) }}</span>
                            <v-img v-else :src="require(`@/assets/img/mail-avatars/${getMailAvatar(mail.subject, mail.from, mail.fromAddress)}`)"></v-img>
                        </v-list-item-avatar>

                        <v-list-item-avatar :color="subjectColor(getSubjectId(mail.subject, mail.from))" v-else>
                            <v-icon color="white" v-if="getMailAvatar(mail.subject, mail.from, mail.fromAddress) === false">mdi-book-outline</v-icon><v-img v-else :src="require(`@/assets/img/mail-avatars/${getMailAvatar(mail.subject, mail.from, mail.fromAddress)}`)"></v-img>
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-title :class="{ 'primary--text': mail.unseen }"><span v-if="mail.subject" :title="mail.subject">{{ mail.subject }}</span><em v-else>{{ $t('no_subject') }}</em></v-list-item-title>
                            <v-list-item-subtitle>
                                <span class="d-block text-truncate from">
                                    <v-icon
                                        small
                                        class="person-icon mr-1"
                                    >
                                        mdi-account-arrow-right
                                    </v-icon>
                                    <span :title="mail.fromAddress">{{ mail.from ? getShortSenderName(mail.from) : mail.fromAddress }}</span>
                                </span>
                                <v-icon
                                    small
                                    class="time-icon mr-1"
                                >
                                    mdi-clock-outline
                                </v-icon>
                                <span :title="getDate(new Date(mail.date * 1000))" :key="timeUpdate(mail.date * 1000) ? `${keyMin}-${index}` : `mail-key-${index}`">{{ displayDate(new Date(mail.date * 1000)) }}</span>
                                <v-icon
                                    small
                                    color="primary"
                                    class="time-icon ml-2"
                                    :title="$t('flagged')"
                                    v-if="mail.flagged"
                                >
                                    mdi-flag
                                </v-icon>
                                <span v-if="getSubjectId(mail.subject, mail.from) !== false" class="ml-3">
                                    <span :class="subjectColor(getSubjectId(mail.subject, mail.from))" class="subject-color-samll"></span>
                                    {{ subjectNameMap(getSubjectId(mail.subject, mail.from)) }}
                                </span>
                            </v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
                <div class="more-mail px-4 pb-3 text-body-2 text--secondary" v-show="mails.length > 7">
                    {{ $t('more_mail') }} <a href="https://outlook.com/student.manchester.ac.uk" target="_blank" rel="noopener nofollow">Outlook</a><a href="https://outlook.com/student.manchester.ac.uk" target="_blank" rel="noopener nofollow" class="no-underline-link"><v-icon x-small color="primary">mdi-open-in-new</v-icon></a>
                </div>
            </div>
            <div class="empty" v-if="mails.length === 0 && init && !loading">
                {{ $t('nothing') }}
            </div>
            <div class="empty" v-if="!loading && !init">
                <span class="text-center pl-6 pr-6">{{ $t('cannot_fetch') }} <a href="https://github.com/yrccondor/uom-assistant/" target="_blank" rel="noreferrer noopener">{{ $t('learn_more') }}</a></span>
            </div>
        </div>
        <div class="viewer-layer-mask" :class="{ opened: viewerOpened }"></div>
        <div class="viewer-layer" :class="{ opened: viewerOpened }">
            <h2 class="handle">
                <v-avatar v-if="getSubjectId(viewer.subject, viewer.from) === false" :color="$vuetify.theme.dark ? 'grey darken-1' : 'grey lighten-2'" size="27" class="mr-3 layer-title-avatar">
                    <span v-if="getMailAvatar(viewer.subject, viewer.from, viewer.fromAddress) === false">{{ getTwoLetterSenderName(viewer.from ? viewer.from : viewer.fromAddress) }}</span>
                    <v-img v-else :src="require(`@/assets/img/mail-avatars/${getMailAvatar(viewer.subject, viewer.from, viewer.fromAddress)}`)"></v-img>
                </v-avatar>

                <v-avatar :color="subjectColor(getSubjectId(viewer.subject, viewer.from))" v-else size="27" class="mr-3 layer-title-avatar">
                    <v-icon color="white" v-if="getMailAvatar(viewer.subject, viewer.from, viewer.fromAddress) === false" small>mdi-book-outline</v-icon><v-img v-else :src="require(`@/assets/img/mail-avatars/${getMailAvatar(viewer.subject, viewer.from, viewer.fromAddress)}`)"></v-img>
                </v-avatar>
                <span class="layer-title">{{ $t('mail_view') }}</span>
                <v-btn icon @click.stop="closeMail" small class="float-right mr-4" :title="$t('close')">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-menu
                    offset-y
                    bottom
                    left
                    transition="slide-y-transition"
                    nudge-bottom="5"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon @click.stop="2" small class="float-right mr-1" :title="$t('more')" v-on="on" v-bind="attrs" v-show="!loadingBody">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list class="mail-menu-list">
                        <v-list-item @click="sendMail">
                            <v-list-item-icon>
                                <v-icon>mdi-share-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ $t('forward') }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="markAsJunk(viewing)" :disabled="loading || loadingFlag.length > 0 || downloading !== ''">
                            <v-list-item-icon>
                                <v-icon>mdi-cancel</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ $t('mark_junk') }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-list-item @click="deleteMail(viewing)" :disabled="loading || loadingFlag.length > 0 || downloading !== ''">
                            <v-list-item-icon>
                                <v-icon>mdi-delete-outline</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn icon @click.stop="flagMail(viewing)" small class="float-right mr-1" :title="viewer.flagged ? $t('unflag') : $t('flag')" v-show="!loadingBody" :loading="isLoadingFlag(viewing)" :disabled="isLoadingFlag(viewing)">
                    <v-icon :color="viewer.flagged ? 'primary' : ''">
                        {{ viewer.flagged ? 'mdi-flag' : 'mdi-flag-outline' }}
                    </v-icon>
                </v-btn>
                <v-btn icon @click.stop="sendMail" small class="float-right mr-2" :title="$t('reply')" v-show="!loadingBody">
                    <v-icon>mdi-reply-outline</v-icon>
                </v-btn>
            </h2>
            <v-divider></v-divider>
            <div class="viewer" ref="viewerDom">
                <h1 class="text-subtitle-1 px-5 py-3 mail-view-subject"><span v-if="viewer.subject !== false">{{ viewer.subject }}</span><em v-else>{{ $t('no_subject') }}</em></h1>
                <div v-show="viewer.courseId !== ''" class="subject-subtitle mx-5 text--disabled text-body-2 pb-3 text-truncate">
                    <v-menu
                        :close-on-content-click="false"
                        nudge-bottom="5"
                        transition="slide-y-transition"
                        content-class="large-radius"
                        offset-y
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <span v-on="on" v-bind="attrs">
                                <span :class="subjectColor(viewer.courseId)" class="subject-color-samll"></span>
                                {{ subjectLongNameMap(viewer.courseId) }}
                            </span>
                        </template>
                        <v-card
                            class="mail-course-card"
                            min-width="350px"
                            flat
                        >
                            <v-toolbar
                                color="#ffffff"
                                flat
                            >
                                <v-toolbar-title :class="subjectColor(viewer.courseId) ? `${subjectColor(viewer.courseId).split(' ')[0]}--text${subjectColor(viewer.courseId).split(' ').length > 1 ? ` text--${subjectColor(viewer.courseId).split(' ')[1]}` : ''}` : ''" class="course-name">
                                    {{ subjectLongNameMap(viewer.courseId) }}<br>
                                    <span class="text--disabled course-smaller-font">{{ viewer.courseId }}</span>
                                </v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-tooltip top v-if="viewer.courseId !== '' && subjectLinks(viewer.courseId).homeLink !== false">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            icon
                                            small
                                            class="mr-0 ml-2 course-home"
                                            target="_blank"
                                            :href="subjectLinks(viewer.courseId).homeLink"
                                            color="grey"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            <v-icon>mdi-home-outline</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('subject_home') }}</span>
                                </v-tooltip>
                            </v-toolbar>
                            <v-card-text :class="{ empty: subjectLinks(viewer.courseId).sessionLinks.length === 0 }">
                                <v-list flat class="list" v-if="viewer.courseId !== '' && subjectLinks(viewer.courseId).sessionLinks.length > 0">
                                    <v-list-item-group>
                                        <v-list-item
                                            v-for="(link, index) in subjectLinks(viewer.courseId).sessionLinks"
                                            :key="`subject-link-${index}`"
                                            :ripple="false"
                                        >
                                            <template>
                                                <v-list-item-content>
                                                    <v-list-item-title>
                                                        <v-btn x-small icon :href="meetingLink(link.link, link.passcode)" :title="ifZoomLink(link.link) ? $t('quick_zoom') : $t('quick_teams')" v-if="ifZoomLink(link.link) || ifTeamsLink(link.link)" class="mr-1 text-decoration-none"><v-icon small>{{ ifTeamsLink(link.link) ? 'mdi-microsoft-teams' : 'mdi-dock-window' }}</v-icon></v-btn><a :href="link.link" target="_blank" rel="noopener nofollow" :class="subjectColor(viewer.courseId) ? `${subjectColor(viewer.courseId).split(' ')[0]}--text${subjectColor(viewer.courseId).split(' ').length > 1 ? ` text--${subjectColor(viewer.courseId).split(' ')[1]}` : ''}` : ''">{{ link.name }}</a><a :href="link.link" target="_blank" rel="noopener nofollow" class="no-underline-link"><v-icon small :color="subjectColor(viewer.courseId) ? subjectColor(viewer.courseId) : ''">mdi-open-in-new</v-icon>
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
                                                    </v-btn>
                                                </v-list-item-action>
                                            </template>
                                        </v-list-item>
                                    </v-list-item-group>
                                </v-list>
                            </v-card-text>
                        </v-card>
                    </v-menu>
                </div>
                <div class="mail-detail mx-5 pa-3 pr-2">
                    <div class="mail-from-line">
                        <v-icon class="mr-1" :title="$t('from')">mdi-account-arrow-right</v-icon>
                        <v-tooltip top v-if="viewer.from && getShortSenderName(viewer.from) !== viewer.fromAddress" open-delay="400">
                            <template v-slot:activator="{ on, attrs }">
                                <v-chip close-icon="mdi-content-copy" close small v-on="on" v-bind="attrs" @click:close="doCopy(viewer.from ? `${viewer.from} <${viewer.fromAddress}>` : viewer.fromAddress)">{{ viewer.from ? getShortSenderName(viewer.from) : viewer.fromAddress }}</v-chip>
                            </template>
                            <span>{{ viewer.fromAddress }}</span>
                        </v-tooltip>
                        <v-chip close-icon="mdi-content-copy" close small v-else @click:close="doCopy(viewer.from ? `${viewer.from} <${viewer.fromAddress}>` : viewer.fromAddress)">{{ viewer.from ? getShortSenderName(viewer.from) : viewer.fromAddress }}</v-chip>
                        <v-btn icon @click.stop="viewDetailExpanded = !viewDetailExpanded" small class="float-right expand-btn" :title="$t('more')">
                            <v-icon :class="{ 'detail-expanded': viewDetailExpanded }">mdi-chevron-down</v-icon>
                        </v-btn>
                    </div>
                    <v-expand-transition>
                        <div class="expand" v-show="viewDetailExpanded">
                            <div class="mail-to-line mt-1">
                                <v-icon class="mt-2 mr-1" :title="$t('to')">mdi-account-arrow-left-outline</v-icon>
                                <span v-for="(item, index) in viewer.to" :key="`to-${index}`" v-show="viewer.to.length > 0">
                                    <v-tooltip top v-if="item.name && getShortSenderName(item.name) !== item.address" open-delay="400">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-chip close-icon="mdi-content-copy" close small v-on="on" v-bind="attrs" @click:close="doCopy(item.name ? `${item.name} <${item.address}>` : item.address)" class="mr-1 mt-2">{{ item.name ? getShortSenderName(item.name) : item.address }}</v-chip>
                                        </template>
                                        <span>{{ item.address }}</span>
                                    </v-tooltip>
                                    <v-chip close-icon="mdi-content-copy" close small v-else @click:close="doCopy(item.name ? `${item.name} <${item.address}>` : item.address)" class="mr-1 mt-2">{{ item.name ? getShortSenderName(item.name) : item.address }}</v-chip>
                                </span>
                                <v-tooltip top open-delay="400" v-if="!meInList(viewer.to) && !meInList(viewer.cc)">
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-chip small v-on="on" v-bind="attrs" class="mr-1 mt-2 to-me">{{ $t('me') }}</v-chip>
                                    </template>
                                    <span>{{ account.email }}</span>
                                </v-tooltip>
                            </div>
                            <div class="mail-to-line mt-1" v-show="viewer.cc.length > 0">
                                <v-icon class="mt-2 mr-1" :title="$t('cc')">mdi-closed-caption-outline</v-icon>
                                <span v-for="(item, index) in viewer.cc" :key="`to-${index}`">
                                    <v-tooltip top v-if="item.name && getShortSenderName(item.name) !== item.address" open-delay="400">
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-chip close-icon="mdi-content-copy" close small v-on="on" v-bind="attrs" @click:close="doCopy(item.name ? `${item.name} <${item.address}>` : item.address)" class="mr-1 mt-2">{{ item.name ? getShortSenderName(item.name) : item.address }}</v-chip>
                                        </template>
                                        <span>{{ item.address }}</span>
                                    </v-tooltip>
                                    <v-chip close-icon="mdi-content-copy" close small v-else @click:close="doCopy(item.name ? `${item.name} <${item.address}>` : item.address)" class="mr-1 mt-2">{{ item.name ? getShortSenderName(item.name) : item.address }}</v-chip>
                                </span>
                            </div>
                            <div class="mail-time-line mt-1">
                                <span class="text-body-2 mt-2">
                                    <v-icon class="mr-2" :title="$t('time')">mdi-clock-outline</v-icon>
                                    {{ getDate(new Date(viewer.date * 1000)) }}
                                </span>
                            </div>
                            <div class="mail-time-line" v-show="trustedSender(viewer.fromAddress)">
                                <span class="text-body-2 green--text mt-2">
                                    <v-icon class="mr-2" color="green">mdi-check</v-icon>
                                    {{ $t('trusted_sender') }}
                                </span>
                            </div>
                            <div class="mail-time-line" v-show="internalSender(viewer.fromAddress)">
                                <span class="text-body-2 mt-2">
                                    <v-icon class="mr-2">mdi-bank-outline</v-icon>
                                    {{ $t('internal_sender') }}
                                </span>
                            </div>
                        </div>
                    </v-expand-transition>
                </div>
                <div class="mail-detail mx-5 pa-3 pr-2 mt-2" v-show="viewer.attachments.length > 0">
                    <div class="mail-from-line">
                        <span class="text-body-2 mt-2">
                            <v-icon class="mr-1">mdi-paperclip</v-icon>
                            {{ formatString($t('attachment_num'), [viewer.attachments.length]) }}
                        </span>
                        <v-btn icon @click.stop="viewAttachmentExpanded = !viewAttachmentExpanded" small class="float-right expand-btn" :title="$t('expand')">
                            <v-icon :class="{ 'detail-expanded': viewAttachmentExpanded }">mdi-chevron-down</v-icon>
                        </v-btn>
                    </div>
                    <v-expand-transition>
                        <div class="expand attachment-list" v-show="viewAttachmentExpanded">
                            <div class="d-flex flex-wrap mt-1">
                                <div class="attachment-item d-flex justify-space-between align-center mt-2 mr-2" v-for="(file, index) in viewer.attachments" :key="`attachment-${file[0]}-${index}`" :class="{ 'full-width': viewer.attachments.length === 1 }">
                                    <v-icon class="ml-2 mr-1">{{ `mdi-${getFileIcon(file[0])}` }}</v-icon>
                                    <div class="text-body-2 file-name text-truncate" :title="file[0]">{{ file[0] }}<div class="text--disabled text-caption">{{ formatBytes(file[1]) }}</div></div>
                                    <v-btn icon @click="downloadFile(viewing, file[0], file[1])" small class="mr-1" :loading="downloading === `${viewing}-${file[0]}`" :disabled="downloading !== ''">
                                        <v-icon small>mdi-arrow-collapse-down</v-icon>
                                        <template v-slot:loader>
                                            <v-progress-circular
                                                indeterminate
                                                color="grey"
                                                :width="2"
                                                :size="20"
                                                v-show="downloadProgress < 5"
                                            ></v-progress-circular>
                                            <v-progress-circular
                                                color="primary"
                                                class="rotating"
                                                :rotate="-90"
                                                :width="2.3"
                                                :size="20"
                                                :value="downloadProgress"
                                                v-show="downloadProgress >= 5"
                                            ></v-progress-circular>
                                        </template>
                                    </v-btn>
                                </div>
                            </div>
                        </div>
                    </v-expand-transition>
                </div>
                <v-skeleton-loader
                    class="mx-auto"
                    type="list-item-three-line, list-item-two-line"
                    v-show="loadingBody || (!((!trustedSender(viewer.fromAddress) && !normalSender(viewer.fromAddress) && !internalSender(viewer.fromAddress)) && !viewer.allowHTML) && sandboxHeight < 10)"
                ></v-skeleton-loader>
                <v-alert
                    text
                    dense
                    color="red"
                    icon="mdi-shield-alert-outline"
                    class="mx-5 mt-2 mb-0"
                    v-show="!(loadingBody || (!((!trustedSender(viewer.fromAddress) && !normalSender(viewer.fromAddress) && !internalSender(viewer.fromAddress)) && !viewer.allowHTML) && sandboxHeight < 10)) && (viewer.untrust && !trustedSender(viewer.fromAddress))"
                >
                    {{ $t('untrusted_content') }}
                    <div class="d-flex flex-row-reverse flex-wrap-reverse mt-1">
                        <v-btn
                            outlined
                            small
                            color="red"
                            class="my-1 ml-2"
                            :disabled="loading || loadingFlag.length > 0 || downloading !== ''"
                            @click="markAsJunk(viewing)"
                        >
                            {{ $t('mark_junk') }}
                        </v-btn>
                        <v-btn
                            outlined
                            small
                            color="red"
                            class="my-1"
                            @click="viewer.untrust = false"
                        >
                            {{ $t('this_is_safe') }}
                        </v-btn>
                    </div>
                </v-alert>
                <div v-show="!loadingBody && (!trustedSender(viewer.fromAddress) && !normalSender(viewer.fromAddress) && !internalSender(viewer.fromAddress)) && !viewer.allowHTML">
                    <v-alert
                        text
                        dense
                        color="orange"
                        icon="mdi-shield-alert-outline"
                        class="mx-5 mt-2 mb-0"
                    >
                        {{ $t('unsafe_content') }}
                        <div class="d-flex flex-row-reverse mt-1">
                            <v-btn
                                outlined
                                small
                                color="orange"
                                class="my-1"
                                @click="viewer.allowHTML = true"
                            >
                                {{ $t('this_is_safe') }}
                            </v-btn>
                        </div>
                    </v-alert>
                    <div class="body-text ma-5 mb-5">{{ viewer.bodyText }}</div>
                </div>
                <iframe :title="$t('mail_body')" sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox" :srcdoc="((!trustedSender(viewer.fromAddress) && !normalSender(viewer.fromAddress) && !internalSender(viewer.fromAddress)) && !viewer.allowHTML) ? '' : viewer.bodyHTML" v-show="!loadingBody && !((!trustedSender(viewer.fromAddress) && !normalSender(viewer.fromAddress) && !internalSender(viewer.fromAddress)) && !viewer.allowHTML)" class="sandbox ma-5 mt-4" frameborder="0" ref="sandbox" allowtransparency="true" :height="`${sandboxHeight < 10 ? 0 : (sandboxHeight + 16)}px`"></iframe>
            </div>
        </div>
        <div class="editor-layer-mask" :class="{ opened: layerOpened }"></div>
        <div class="editor-layer" :class="{ opened: layerOpened }">
            <h2 class="handle">
                <span class="layer-title">{{ $t('new_mail') }}</span>
                <v-icon class="ml-1 md-icon" :title="$t('md_support')">
                    mdi-language-markdown
                </v-icon>
                <v-btn icon @click.stop="layerOpened = false" small class="float-right mr-4" :title="$t('close')">
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
        <v-menu
            v-model="listMenu"
            :position-x="listMenuX"
            :position-y="listMenuY"
            absolute
            offset-y
            close-on-click
            close-on-content-click
        >
            <v-list class="mail-menu-list">
                <v-list-item v-show="isUnseen(selectedId)" @click="markAsRead(selectedId)" :disabled="loading || loadingFlag.length > 0 || downloading !== ''">
                    <v-list-item-icon>
                        <v-icon>mdi-email-open-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{ $t('mark_seen') }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="flagMail(selectedId)" :disabled="loading || loadingFlag.length > 0 || downloading !== ''">
                    <v-list-item-icon>
                        <v-icon :color="isFlagged(selectedId) ? 'primary' : ''" v-show="!isLoadingFlag(selectedId)">
                            {{ isFlagged(selectedId) ? 'mdi-flag' : 'mdi-flag-outline' }}
                        </v-icon>
                        <v-progress-circular
                            indeterminate
                            color="grey"
                            :width="2"
                            :size="22"
                             v-show="isLoadingFlag(selectedId)"
                        ></v-progress-circular>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{ isFlagged(selectedId) ? $t('unflag') : $t('flag') }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="markAsJunk(selectedId)" :disabled="loading || loadingFlag.length > 0 || downloading !== ''">
                    <v-list-item-icon>
                        <v-icon>mdi-cancel</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{ $t('mark_junk') }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="deleteMail(selectedId)" :disabled="loading || loadingFlag.length > 0 || downloading !== ''">
                    <v-list-item-icon>
                        <v-icon>mdi-delete-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{ $t('delete') }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';
import { codemirror } from 'vue-codemirror';
import { vsprintf } from 'sprintf-js';
import { saveAs } from 'file-saver';
import localForage from 'localforage';
import markdown from 'markdown-it';

import mdSub from 'markdown-it-sub';
import mdSup from 'markdown-it-sup';
import mdSpan from 'markdown-it-bracketed-spans';
import mdAttrs from 'markdown-it-attrs';

import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/selection/active-line';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';

import checkBackendVersion from '../tools/checkBackendVersion';
import betterFetch from '../tools/betterFetch';
import fetchDownload from '../tools/fetchDownload';
import formatDateTime from '../tools/formatDateTime';

import 'codemirror/theme/xq-light.css';
import 'codemirror/lib/codemirror.css';

Vue.use(VueClipboard);

export default {
    name: 'mail',
    components: {
        codemirror,
    },
    data() {
        return {
            loading: false,
            loadingBody: false,
            loadingFlag: [],
            downloading: '',
            downloadProgress: 0,
            mails: [],
            ifNotify: [0],
            layerOpened: false,
            viewerOpened: false,
            mode: 'view',
            md: null,
            init: false,
            isSettingSound: false,
            cmRefresh: `${new Date().valueOf()}`,
            code: '',
            scrollPercentage: 0,
            timer: null,
            keyMin: '',
            refreshLoding: false,
            justUpdated: false,
            viewing: -1,
            viewDetailExpanded: false,
            viewAttachmentExpanded: false,
            sandboxHeight: 0,
            listMenu: false,
            listMenuX: 0,
            listMenuY: 0,
            selectedId: -1,
            copySuccess: false,
            copyingIndex: -1,
            cachedMails: [],
            fileIconMap: {
                pdf: 'file-pdf-outline',
                zip: 'zip-box-outline',
                rar: 'zip-box-outline',
                '7z': 'zip-box-outline',
                gz: 'zip-box-outline',
                tar: 'zip-box-outline',
                mp4: 'play-box-outline',
                webm: 'play-box-outline',
                flv: 'play-box-outline',
                mpeg: 'play-box-outline',
                avi: 'play-box-outline',
                mov: 'play-box-outline',
                mp3: 'music-note-outline',
                wav: 'music-note-outline',
                flac: 'music-note-outline',
                ape: 'music-note-outline',
                dsd: 'music-note-outline',
                ogg: 'music-note-outline',
                aac: 'music-note-outline',
                jpg: 'image',
                jpeg: 'image',
                png: 'image',
                bmp: 'image',
                gif: 'image',
                webp: 'image',
                nef: 'image',
                raw: 'image',
                ppt: 'microsoft-powerpoint',
                pptx: 'microsoft-powerpoint',
                pptm: 'microsoft-powerpoint',
                pps: 'microsoft-powerpoint',
                ppsx: 'microsoft-powerpoint',
                ppsm: 'microsoft-powerpoint',
                pot: 'microsoft-powerpoint',
                potx: 'microsoft-powerpoint',
                potm: 'microsoft-powerpoint',
                doc: 'microsoft-word',
                docx: 'microsoft-word',
                docm: 'microsoft-word',
                dot: 'microsoft-word',
                dotx: 'microsoft-word',
                dotm: 'microsoft-word',
                xls: 'microsoft-excel',
                xlsx: 'microsoft-excel',
                xlsm: 'microsoft-excel',
                xlsb: 'microsoft-excel',
                xlt: 'microsoft-excel',
                xltx: 'microsoft-excel',
                xltm: 'microsoft-excel',
                txt: 'file-document-outline',
                py: 'language-python',
                pyc: 'language-python',
                java: 'language-java',
                jar: 'language-java',
                class: 'language-java',
                js: 'language-javascript',
                mjs: 'language-javascript',
                ts: 'language-typescript',
                json: 'code-json',
                c: 'language-c',
                cpp: 'language-cpp',
                r: 'language-r',
                rs: 'language-rust',
                go: 'language-go',
                hs: 'language-haskell',
                lhs: 'language-haskell',
                sass: 'sass',
                scss: 'sass',
                lua: 'language-lua',
                rb: 'language-ruby',
                erb: 'language-ruby',
                gemfile: 'language-ruby',
                html: 'language-html5',
                htm: 'language-html5',
                md: 'language-markdown-outline',
                php: 'language-php',
                css: 'language-css3',
                vue: 'vuejs',
                dockerfile: 'docker',
            },
            viewer: {
                subject: '',
                from: false,
                fromAddress: '',
                to: [],
                cc: [],
                date: 0,
                flagged: false,
                bodyHTML: '',
                bodyRawHTML: '',
                bodyText: '',
                textContent: '',
                allowHTML: false,
                untrust: false,
                attachments: [],
                courseId: '',
            },
            trustedHosts: [
                'manchester.ac.uk',
                'cs.manchester.ac.uk',
                'emarketing.manchester.ac.uk',
                'blackboard.com',
            ],
            normalHosts: [
                'github.com',
                'gitlab.com',
                'email.teams.microsoft.com',
                'piazza.com',
            ],
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
            untrustedKeyWords: {
                tokenlized: [
                    [
                        [
                            'nootropics',
                            'turnitin',
                            'smartdrug',
                            'smart drug',
                            'cognitive enhancer',
                            'price',
                            'sale',
                            'discount',
                        ], 0.5,
                    ],
                    [
                        [
                            'qq',
                            'wechat',
                            'brain performance',
                            'bio-hackers',
                            'bio hackers',
                        ], 0.4,
                    ],
                    [
                        [
                            'exam',
                            'coursework',
                            'report',
                            'drug',
                            'dissertation',
                            'assignment',
                            'degree',
                        ], 0.3,
                    ],
                    [
                        [
                            'project',
                            'groupwork',
                            'assignment',
                            'writer',
                            'proofreading',
                            'service',
                        ], 0.2,
                    ],
                ],
                untokenlized: [
                    [
                        [
                            '代写',
                            '代考',
                            '导师',
                            '高分',
                            '润色',
                            '报价',
                            '写手',
                            '优惠',
                            '立减',
                            '企鹅',
                            '客服',
                            '订单',
                            '保分',
                            '申诉',
                            '答疑',
                            '辅导',
                            '服务',
                            '通过率',
                            '及格率',
                        ], 0.5,
                    ],
                    [
                        [
                            '补考',
                            '客户',
                            '微信',
                            '评分',
                            '助你',
                        ], 0.4,
                    ],
                    [
                        [
                            '分数',
                            '定制',
                            '审核',
                            '科目',
                            '免费',
                        ], 0.3,
                    ],
                    [
                        [
                            '考试',
                            '论文',
                            '批改',
                            '挂科',
                            '复习',
                            '学位',
                        ], 0.2,
                    ],
                    [
                        [
                            '作者',
                        ], 0.1,
                    ],
                ],
            },
            sandboxCss: `
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
                body {
                    margin: 0;
                    padding: 0;
                    overflow-x: auto;
                    overflow-y: hidden;
                    background: none transparent;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                a {
                    color: #660099;
                    word-break: break-word;
                }`,
            sandboxCssDark: `
                :root {
                    color-scheme: dark;
                    background-color: #1E1E1E;
                }
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
                body:not([bgcolor]) {
                    background-color: #1E1E1E;
                    color: white;
                }
                body:not([bgcolor]) img {
                    filter: brightness(.85);
                }
                body[bgcolor] {
                    filter: brightness(.85);
                    color: black;
                    background-color: #1E1E1E;
                }
                a {
                    color: #D099E0;
                }`,
        };
    },
    methods: {
        /**
         * Update mail list from backend
         * @param {boolean} update update or fetch
         */
        async updateMailList(update = false) {
            if (!this.backend.url || !this.account.username || !this.account.password || !this.account.email) {
                return;
            }

            // Just updated, skip
            this.loading = true;
            if (this.justUpdated) {
                setTimeout(() => {
                    this.loading = false;
                    this.refreshLoding = false;
                }, 3000);
                return;
            }

            let requestFailed = false;
            // Send request
            const response = await betterFetch(`https://${this.backend.url}/mail/list/`, {
                method: 'POST',
                body: JSON.stringify({
                    username: this.account.username,
                    password: this.account.password,
                    email: this.account.email,
                    token: this.backend.token ? this.backend.token : '',
                }),
            }).catch(() => {
                // Network error
                this.loading = false;
                this.$store.commit('addError', {
                    title: this.$t('network_error'),
                    content: this.$t('network_error_body'),
                    type: 'warning',
                });
                requestFailed = true;
            });

            if (requestFailed) {
                return;
            }

            if (Object.prototype.toString.call(response) !== '[object Object]' || !response.uomabVersion) {
                // Not a valid UoM Assistant backend
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('backend_error'),
                        content: this.$t('backend_error_body'),
                        type: 'error',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                this.loading = false;
                return;
            }

            if (!checkBackendVersion(response.uomabVersion)) {
                // Version error
                this.$store.commit('addError', {
                    title: this.$t('backend_error'),
                    content: this.$t('version_error'),
                    type: 'error',
                });
                this.loading = false;
                return;
            }

            if (!response.success) {
                // Request error
                this.$store.commit('addError', {
                    title: this.$t('request_error'),
                    content: response.reason,
                    type: 'error',
                });
                this.loading = false;
                return;
            }

            if (response.maintenance) {
                // Backend maintenance
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('backend_maintenance'),
                        content: this.$t('backend_maintenance_body'),
                        type: 'warning',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                this.loading = false;
                return;
            }

            if (response.data.tokenRequired) {
                // Wrong Token
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('token_error'),
                        content: this.$t('token_error_body'),
                        type: 'error',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                this.loading = false;
                return;
            }

            // Update data
            this.$store.commit('setBackendStatus', true);
            this.loading = false;
            this.justUpdated = true;
            // Do not load list again within 15 seconds
            setTimeout(() => {
                this.justUpdated = false;
            }, 15000);

            if (!update) {
                // Is not updating, skip checking new mails
                this.init = true;
                this.mails = response.data.sort((a, b) => (b.date - a.date));
            } else {
                // Check if there is any new mail
                let newMail = false;
                for (const mail of response.data) {
                    if (this.mails.findIndex((item) => item.id === mail.id) === -1 && mail.unseen) {
                        newMail = true;
                    }
                }
                // If sound is turned on, play sound
                if (newMail && this.ifNotify.length === 1) {
                    this.$refs.audio.currentTime = 0;
                    this.$refs.audio.volume = 0.3;
                    this.$refs.audio.play();
                }
                // Update list
                this.mails = response.data.sort((a, b) => (b.date - a.date));
                this.refreshLoding = false;
            }
            if (this.viewerOpened) {
                // If viewer layer is opened, update viewer
                const mailIndex = response.data.findIndex((item) => item.id === this.viewing);
                if (mailIndex !== -1) {
                    this.viewer.subject = response.data[mailIndex].subject;
                    this.viewer.from = response.data[mailIndex].from;
                    this.viewer.fromAddress = response.data[mailIndex].fromAddress;
                    this.viewer.to = response.data[mailIndex].to;
                    this.viewer.cc = response.data[mailIndex].cc;
                    this.viewer.date = response.data[mailIndex].date;
                    this.viewer.flagged = response.data[mailIndex].flagged;
                }
            }
        },
        /**
         * Do action for a mail
         * @param {number} mailId mail ID
         * @param {string} action action
         */
        async doAction(mailId, action) {
            if (!this.backend.url || !this.account.username || !this.account.password || !this.account.email) {
                return;
            }

            this.loading = true;
            let requestFailed = false;
            // Send request
            let url = '';
            if (action === 'body') {
                this.loadingBody = true;
                url = `https://${this.backend.url}/mail/body/`;
            } else {
                url = `https://${this.backend.url}/mail/action/`;
                if (action === 'flag' || action === 'unflag') {
                    this.loadingFlag.push(mailId);
                }
            }
            const response = await betterFetch(url, {
                method: 'POST',
                body: JSON.stringify({
                    username: this.account.username,
                    password: this.account.password,
                    email: this.account.email,
                    action,
                    mailId,
                    token: this.backend.token ? this.backend.token : '',
                }),
            }).catch(() => {
                // Network error
                this.loading = false;
                if (action === 'body' && mailId === this.viewing) {
                    this.loadingBody = false;
                } else if (action === 'flag' || action === 'unflag') {
                    if (this.loadingFlag.indexOf(mailId) !== -1) {
                        this.loadingFlag.splice(this.loadingFlag.indexOf(mailId), 1);
                    }
                }
                this.$store.commit('addError', {
                    title: this.$t('network_error'),
                    content: this.$t('network_error_body'),
                    type: 'warning',
                });
                requestFailed = true;
            });

            if (requestFailed) {
                return;
            }

            if (Object.prototype.toString.call(response) !== '[object Object]' || !response.uomabVersion) {
                // Not a valid UoM Assistant backend
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('backend_error'),
                        content: this.$t('backend_error_body'),
                        type: 'error',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                this.loading = false;
                if (action === 'body' && mailId === this.viewing) {
                    this.loadingBody = false;
                } else if (action === 'flag' || action === 'unflag') {
                    if (this.loadingFlag.indexOf(mailId) !== -1) {
                        this.loadingFlag.splice(this.loadingFlag.indexOf(mailId), 1);
                    }
                }
                return;
            }

            if (!checkBackendVersion(response.uomabVersion)) {
                // Version error
                this.$store.commit('addError', {
                    title: this.$t('backend_error'),
                    content: this.$t('version_error'),
                    type: 'error',
                });
                this.loading = false;
                if (action === 'body' && mailId === this.viewing) {
                    this.loadingBody = false;
                } else if (action === 'flag' || action === 'unflag') {
                    if (this.loadingFlag.indexOf(mailId) !== -1) {
                        this.loadingFlag.splice(this.loadingFlag.indexOf(mailId), 1);
                    }
                }
                return;
            }

            if (!response.success) {
                // Request error
                this.$store.commit('addError', {
                    title: this.$t('request_error'),
                    content: response.reason,
                    type: 'error',
                });
                this.loading = false;
                if (action === 'body' && mailId === this.viewing) {
                    this.loadingBody = false;
                } else if (action === 'flag' || action === 'unflag') {
                    if (this.loadingFlag.indexOf(mailId) !== -1) {
                        this.loadingFlag.splice(this.loadingFlag.indexOf(mailId), 1);
                    }
                }
                return;
            }

            if (response.maintenance) {
                // Backend maintenance
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('backend_maintenance'),
                        content: this.$t('backend_maintenance_body'),
                        type: 'warning',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                this.loading = false;
                if (action === 'body' && mailId === this.viewing) {
                    this.loadingBody = false;
                } else if (action === 'flag' || action === 'unflag') {
                    if (this.loadingFlag.indexOf(mailId) !== -1) {
                        this.loadingFlag.splice(this.loadingFlag.indexOf(mailId), 1);
                    }
                }
                return;
            }

            if (response.data.tokenRequired) {
                // Wrong Token
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('token_error'),
                        content: this.$t('token_error_body'),
                        type: 'error',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                this.loading = false;
                if (action === 'body' && mailId === this.viewing) {
                    this.loadingBody = false;
                } else if (action === 'flag' || action === 'unflag') {
                    if (this.loadingFlag.indexOf(mailId) !== -1) {
                        this.loadingFlag.splice(this.loadingFlag.indexOf(mailId), 1);
                    }
                }
                return;
            }

            // Update data
            this.$store.commit('setBackendStatus', true);
            this.loading = false;
            if (action === 'body' && mailId === this.viewing) {
                // Get body
                this.loadingBody = false;

                this.viewer.bodyHTML = `<base target="_blank"><style>${this.sandboxCss}${this.$vuetify.theme.dark ? this.sandboxCssDark : ''}</style>${response.data.content}`;
                this.viewer.bodyRawHTML = `${response.data.content}`;
                this.viewer.textContent = this.getInnerText(new DOMParser().parseFromString(response.data.content, 'text/html').body);
                this.viewer.bodyText = response.data.plainContent === '' ? this.viewer.textContent : response.data.plainContent;
                this.viewer.attachments = response.data.attachments;

                // Check if the content is untrusted
                this.viewer.untrust = this.checkUntrust(this.viewer.textContent);

                // Cache mail body
                if (this.cachedMails.findIndex((item) => item.id === response.data.id) === -1) {
                    response.data.textContent = this.viewer.textContent;
                    if (this.cachedMails.length === 20) {
                        this.cachedMails.shift();
                    }
                    this.cachedMails.push(response.data);
                    const cacheList = await localForage.getItem('mail_cache') || [];
                    if (cacheList.length === 10) {
                        cacheList.shift();
                    }
                    cacheList.push(response.data);
                    await localForage.setItem('mail_cache', cacheList);
                }
            } else if (action === 'flag' || action === 'unflag') {
                // Set flag state
                if (this.loadingFlag.indexOf(mailId) !== -1) {
                    this.loadingFlag.splice(this.loadingFlag.indexOf(mailId), 1);
                }
                const targetMail = this.mails.findIndex((item) => item.id === mailId);
                if (targetMail === -1) {
                    return;
                }
                this.mails[targetMail].flagged = !this.mails[targetMail].flagged;
                if (mailId === this.viewing) {
                    this.viewer.flagged = this.mails[targetMail].flagged;
                }
            }
        },
        /**
         * Download an attachment by mail ID and file name
         * @param {number} mailId mail ID
         * @param {string} fileName file name
         * @param {number} totalSize file size
         */
        async downloadFile(mailId, fileName, totalSize) {
            if (!this.backend.url || !this.account.username || !this.account.password || !this.account.email) {
                return;
            }

            this.loading = true;
            this.downloading = `${mailId}-${fileName}`;
            this.downloadProgress = 0;
            let requestFailed = false;
            // Send request
            const response = await fetchDownload(`https://${this.backend.url}/mail/attachment/`, {
                method: 'POST',
                body: JSON.stringify({
                    username: this.account.username,
                    password: this.account.password,
                    email: this.account.email,
                    fileName,
                    mailId,
                    token: this.backend.token ? this.backend.token : '',
                }),
            }, (size) => {
                let percentage = (size / totalSize) * 100;
                if (percentage > 100) {
                    percentage = 100;
                }
                if (percentage < 0) {
                    percentage = 0;
                }
                this.downloadProgress = percentage;
            }).catch(() => {
                // Network error
                this.loading = false;
                this.downloading = '';
                this.$store.commit('addError', {
                    title: this.$t('network_error'),
                    content: this.$t('cannot_download'),
                    type: 'warning',
                });
                requestFailed = true;
            });

            if (requestFailed) {
                return;
            }

            // Downloaded
            saveAs(response, fileName);
            setTimeout(() => {
                this.loading = false;
                this.downloading = '';
            }, 500);
        },
        /**
         * Manually refresh the mail list
         */
        manualRefresh() {
            this.refreshLoding = true;
            this.updateMailList(true);
        },
        /**
         * Show context menu in mail list
         * @param {Event} e context menu event
         * @param {number} mailId selected mail ID
         */
        showListMenu(e, mailId) {
            this.selectedId = mailId;
            this.listMenu = false;
            this.listMenuX = e.clientX;
            this.listMenuY = e.clientY;
            this.$nextTick(() => {
                this.listMenu = true;
            });
        },
        /**
         * Get inner text from a mail content element
         * @param {Element} ele mail content element
         * @returns {string} inner text of the element
         */
        getInnerText(ele) {
            for (const dom of ele.querySelectorAll('img, style, script, meta, title, link, head')) {
                dom.parentNode.removeChild(dom);
            }
            return ele.innerText.trim();
        },
        /**
         * Copy text
         * @param {string} text text to be copied
         */
        doCopy(text) {
            this.$copyText(text);
        },
        /**
         * Check if my email address is in a list
         * @param {array} personList list
         * @returns {boolean} if my email address is in the given list
         */
        meInList(personList) {
            return personList.findIndex((item) => item.address === this.account.email) !== -1;
        },
        /**
         * Open mail edit layer
         */
        sendMail() {
            this.code = '';
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
        /**
         * Open viewer layer and show the mail by ID
         * @param {number} id mail ID
         */
        async openMail(id) {
            // Mail not found
            const mail = this.mails.find((item) => item.id === id);
            if (!mail) {
                return;
            }
            // Reset viewer
            this.viewing = id;
            this.viewDetailExpanded = false;
            this.viewAttachmentExpanded = false;
            this.viewer.subject = mail.subject;
            this.viewer.from = mail.from;
            this.viewer.fromAddress = mail.fromAddress;
            this.viewer.to = mail.to;
            this.viewer.cc = mail.cc;
            this.viewer.date = mail.date;
            this.viewer.flagged = mail.flagged;
            this.viewer.attachments = [];
            this.viewer.bodyHTML = '';
            this.viewer.bodyRawHTML = '';
            this.viewer.bodyText = '';
            this.viewer.textContent = '';
            this.viewer.allowHTML = false;
            this.viewer.untrust = false;
            this.$refs.viewerDom.scrollTop = 0;
            this.viewer.courseId = this.getSubjectId(mail.subject, mail.from) || '';
            this.$nextTick(() => {
                this.viewerOpened = true;
            });

            // Check if the mail is cached
            const cachedMail = this.cachedMails.find((item) => item.id === id);
            if (!cachedMail) {
                // Not cached, load from backend
                const targetMail = this.mails.findIndex((item) => item.id === id);
                if (targetMail === -1) {
                    return;
                }
                this.mails[targetMail].unseen = false;
                this.doAction(id, 'body');
            } else {
                // Cached, recover from cache
                this.viewer.bodyHTML = '';
                this.viewer.bodyRawHTML = '';
                this.viewer.bodyText = '';
                this.viewer.textContent = '';
                this.sandboxHeight = 0;
                if (mail.unseen) {
                    this.doAction(id, 'seen');
                }
                const targetMail = this.mails.findIndex((item) => item.id === id);
                if (targetMail === -1) {
                    return;
                }
                this.mails[targetMail].unseen = false;
                this.$nextTick(() => {
                    // Set mail body
                    this.viewer.bodyHTML = `<base target="_blank"><style>${this.sandboxCss}${this.$vuetify.theme.dark ? this.sandboxCssDark : ''}</style>${cachedMail.content}`;
                    this.viewer.bodyRawHTML = `${cachedMail.content}`;
                    this.viewer.textContent = cachedMail.textContent;
                    this.viewer.bodyText = cachedMail.plainContent === '' ? this.viewer.textContent : cachedMail.plainContent;
                    this.viewer.untrust = this.checkUntrust(this.viewer.textContent);
                    this.viewer.attachments = cachedMail.attachments;
                });
            }
        },
        /**
         * Close viewer layer
         */
        closeMail() {
            this.viewing = -1;
            this.viewerOpened = false;
        },
        /**
         * Mark a mail as flagged
         * @param {number} id mail ID
         */
        flagMail(id) {
            const mail = this.mails.findIndex((item) => item.id === id);
            if (mail === -1) {
                return;
            }
            this.doAction(id, this.mails[mail].flagged ? 'unflag' : 'flag');
        },
        /**
         * Check if it's send flagging requests by mail ID
         * @param {number} id mail ID
         * @returns {boolean} if it's send flagging requests by mail ID
         */
        isLoadingFlag(id) {
            return this.loadingFlag.includes(id);
        },
        /**
         * Check if a mail is unseen
         * @param {number} id mail ID
         * @returns {boolean} if the given mail is unseen
         */
        isUnseen(id) {
            const mail = this.mails.find((item) => item.id === id);
            if (!mail) {
                return false;
            }
            return mail.unseen;
        },
        /**
         * Check if a mail is flagged
         * @param {number} id mail ID
         * @returns {boolean} if the given mail is flagged
         */
        isFlagged(id) {
            const mail = this.mails.find((item) => item.id === id);
            if (!mail) {
                return false;
            }
            return mail.flagged;
        },
        /**
         * Mark all mail as read
         */
        markAllAsRead() {
            this.doAction(-1, 'allread');
            for (let i = 0; i < this.mails.length; i += 1) {
                this.mails[i].unseen = false;
            }
        },
        /**
         * Mark a mail as read by mail ID
         * @param {number} id mail ID
         */
        markAsRead(id) {
            const mail = this.mails.findIndex((item) => item.id === id);
            if (mail === -1) {
                return;
            }
            this.mails[mail].unseen = false;
            this.doAction(id, 'seen');
        },
        /**
         * Mark a mail as junk
         * @param {number} id mail ID
         */
        markAsJunk(id) {
            this.closeMail();
            const mail = this.mails.findIndex((item) => item.id === id);
            if (mail === -1) {
                return;
            }
            this.mails.splice(mail, 1);
            this.doAction(id, 'junk');
        },
        /**
         * Delete a mail by mail ID
         * @param {number} id mail ID
         */
        deleteMail(id) {
            this.closeMail();
            const mail = this.mails.findIndex((item) => item.id === id);
            if (mail === -1) {
                return;
            }
            this.mails.splice(mail, 1);
            this.doAction(id, 'delete');
        },
        /**
         * Update the height of the sandbox
         */
        updateSandboxHeight() {
            if (this.$refs.sandbox) {
                this.sandboxHeight = this.$refs.sandbox.contentWindow.document.body.scrollHeight + 0.5;
                setTimeout(() => {
                    this.sandboxHeight = this.$refs.sandbox.contentWindow.document.body.scrollHeight + 0.5;
                }, 1000);
            }
        },
        /**
         * Check if the time label needs to update
         * @param {number} date date timestamp
         * @returns {boolean} if the time label needs to update
         */
        timeUpdate(date) {
            return !(new Date().valueOf() - date >= 864000000);
        },
        /**
         * Check if the mail content is untrust
         * @param {string} content mail content
         * @returns {boolean} if the mail content is untrust
         */
        checkUntrust(content) {
            let weight = 0;

            // Check untokenlized keywords, remove all spaces in the content
            const noSpaceConetnt = content.replace(/ /g, '').replace(/\n/g, '').replace(/\t/g, '').replace(/\r/g, '');
            for (const keyword of this.untrustedKeyWords.untokenlized) {
                weight += (noSpaceConetnt.match(new RegExp(`(${keyword[0].join('|')})`, 'g')) || []).length * keyword[1];
            }

            // Check tokenlized keywords, turn the content into lower case
            const lowerConetnt = content.toLowerCase();
            for (const keyword of this.untrustedKeyWords.tokenlized) {
                weight += (lowerConetnt.match(new RegExp(`(${keyword[0].join('|')})`, 'g')) || []).length * keyword[1];
            }

            // Calculate the weight with the keyword density
            return weight * (2000 / noSpaceConetnt.length) > 10;
        },
        /**
         * Get short name from an UoM account name
         * @param {string} name mail from name
         * @returns {string} short name
         */
        getShortSenderName(name) {
            const nameSplit = name.split(' - ').filter((val) => val !== '');
            if (nameSplit.length === 2 && /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-z])+\.)*manchester\.ac\.uk$/i.test(nameSplit[1])) {
                return nameSplit[0];
            }
            return name;
        },
        /**
         * Get two-letter name for mail avatar by mail from name
         * @param {string} name mail from name
         * @returns {string} two-letter name
         */
        getTwoLetterSenderName(name) {
            // If it's an UoM address
            const nameSplit = name.split(' - ').filter((val) => val !== '');
            if (nameSplit.length === 2 && /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-z])+\.)*manchester\.ac\.uk$/i.test(nameSplit[1])) {
                const realNameSplit = nameSplit[0].split(' ').filter((val) => val !== '');
                if (realNameSplit.length >= 2) {
                    return `${realNameSplit[0][0]}${realNameSplit[realNameSplit.length - 1][0]}`.toUpperCase();
                }
                return `${nameSplit[0][0]}${nameSplit[1].split('@')[1][0]}`.toUpperCase();
            }

            // If it's an email address
            if (/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(name)) {
                const realNameSplit = name.split('@')[0].split(/-|\.| /).filter((val) => val !== '');
                if (realNameSplit.length >= 2) {
                    return `${realNameSplit[0][0]}${realNameSplit[realNameSplit.length - 1][0]}`.toUpperCase();
                }
                return `${name[0]}${name.split('@')[1][0]}`.toUpperCase();
            }

            // If it's a normal name
            const nameSplited = name.split(' ').filter((val) => val !== '');
            if (nameSplited.length >= 2) {
                return `${nameSplited[0][0]}${nameSplited[nameSplited.length - 1][0]}`.toUpperCase();
            }
            return `${name[0]}${name[1]}`.toUpperCase();
        },
        /**
         * Get mail avatar by mail subject, from name and from address
         * @param {string} subject mail subject
         * @param {string} from mail from name
         * @param {string} fromAddr mail from address
         * @returns {string} mail avatar file name
         */
        getMailAvatar(subject, from, fromAddr) {
            if (subject === false) {
                return false;
            }
            if (subject.includes('[CompSci]') && fromAddr.split('@')[1].substr(-16) === 'manchester.ac.uk') {
                return 'kilburn.jpg';
            }
            if (fromAddr.includes('.su@manchester.ac.uk')) {
                return 'su.gif';
            }
            if (from !== false && (from.includes('My Manchester ') || from === 'The University of Manchester' || from === 'University of Manchester') && fromAddr.split('@')[1].substr(-16) === 'manchester.ac.uk') {
                return 'man.gif';
            }
            if (from !== false && from === 'University of Manchester Student Services' && fromAddr.split('@')[1].substr(-20) === 'ssc@manchester.ac.uk') {
                return 'man.gif';
            }
            if (from === false && fromAddr.includes('@blackboard.com')) {
                return 'bb.gif';
            }
            if (fromAddr.includes('@email.teams.microsoft.com')) {
                return 'teams.gif';
            }
            if (fromAddr.includes('@github.com')) {
                return 'github.gif';
            }
            if (from === 'GitLab' && (fromAddr === 'support@cs.manchester.ac.uk' || fromAddr.split('@')[1].substr(-10) === 'gitlab.com')) {
                return 'gitlab.gif';
            }
            if (fromAddr.includes('@piazza.com')) {
                return 'piazza.gif';
            }
            if (fromAddr.includes('@trello.com')) {
                return 'trello.gif';
            }
            return false;
        },
        /**
         * Match course ID from mail subject or from
         * @param {string} subject mail subject
         * @param {string} from mail from address
         * @returns {string} matched course ID or false
         */
        getSubjectId(subject, from) {
            if (subject !== false) {
                const match = subject.toUpperCase().match(/[A-Z]{3,4}( |-|_){0,1}\d{5}/);
                if (match !== null) {
                    const id = match[0].replace(/( |-|_)/, '');
                    if (this.subjects.findIndex((item) => item.id === id)) {
                        return id;
                    }
                }
            }
            if (from !== false) {
                const fromMatch = from.toUpperCase().match(/[A-Z]{3,4}( |-|_){0,1}\d{5}/);
                if (fromMatch !== null) {
                    const fromId = fromMatch[0].replace(/( |-|_)/, '');
                    if (this.subjects.findIndex((item) => item.id === fromId)) {
                        return fromId;
                    }
                }
            }
            return false;
        },
        /**
         * Check if the sender is an UoM internal sender
         * @param {string} address sender address
         * @returns {boolean} if the sender is an UoM internal sender
         */
        internalSender(address) {
            return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([a-z])+\.)*manchester\.ac\.uk$/i.test(address);
        },
        /**
         * Check if the sender is a trusted sender
         * @param {string} address sender address
         * @returns {boolean} if the sender is a trusted sender
         */
        trustedSender(address) {
            return this.trustedHosts.includes(address.split('@')[1]);
        },
        /**
         * Check if the sender is a normal sender
         * @param {string} address sender address
         * @returns {boolean} if the sender is a normal sender
         */
        normalSender(address) {
            return this.normalHosts.includes(address.split('@')[1]);
        },
        /**
         * Get file icon name by file name
         * @param {string} name file name
         * @returns {string} icon name
         */
        getFileIcon(name) {
            const fileName = name.split('.');
            return this.fileIconMap[fileName[fileName.length - 1].toLowerCase()] || 'file-outline';
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
         * Format bytes to file size unit
         * @param {number} bytes file byte length
         * @param {number?} decimals file size decimal number
         * @returns {string} formated string
         */
        formatBytes(bytes, decimals = 2) {
            if (bytes === 0) {
                return '0 Bytes';
            }

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
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
         * Show an animation on the copy button if copy succeeded
         */
        onCopy() {
            this.copySuccess = true;
            setTimeout(() => {
                this.copySuccess = false;
            }, 500);
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
        /**
         * Calculate the time of a mail and format it as a string
         * @param {number} date time of the mail
         * @returns {string} formatted string
         */
        displayDate(date) {
            const now = new Date().valueOf();
            const mail = date.valueOf();

            // More than 10 days
            if (now - mail >= 864000000) {
                return this.getDate(date);
            }
            // More than 1 week
            if (now - mail < 864000000 && now - mail >= 604800000) {
                return vsprintf(this.$t('remain_week'), [1]);
            }
            // More than 1 day
            if (now - mail >= 86400000) {
                const day = Math.floor((now - mail) / 86400000);
                return vsprintf(day === 1 ? this.$t('remain_day') : this.$t('remain_day_plural'), [day]);
            }
            // More than 1 hour
            if (now - mail < 86400000 && now - mail > 3600000) {
                const hour = Math.round((now - mail) / 3600000);
                return vsprintf(hour === 1 ? this.$t('remain_hour') : this.$t('remain_hour_plural'), [hour]);
            }
            // Less than 1 hour
            if (now - mail < 3600000 && now - mail > 120000) {
                const mins = Math.round((now - mail) / 60000);
                return vsprintf(mins === 1 ? this.$t('remain_min') : this.$t('remain_min_plural'), [mins]);
            }
            // Less than 2 mins
            if (now - mail < 120000 && now - mail > 0) {
                return this.$t('just_now');
            }
            return this.getDate(date);
        },
        /**
         * Format a date object to a string based on locale
         * @param {Date} dateObj Date object
         * @returns {string} formatted a date string
         */
        getDate(dateObj) {
            return formatDateTime(dateObj, this.locale, false);
        },
        /**
         * Update scroll percentage when editor scrolls
         * @param {Event} e scroll event
         */
        onScroll(e) {
            const scroller = e.getScrollInfo();
            this.scrollPercentage = scroller.top / (scroller.height - 500);
        },
        /**
         * Update scroll percentage when viewer scrolls
         * @param {Event} e scroll event
         */
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
        ifNotify() {
            // Toggle sound
            if (!this.isSettingSound) {
                if (this.ifNotify.length === 1) {
                    this.$refs.audio.currentTime = 0;
                    this.$refs.audio.volume = 0.3;
                    this.$refs.audio.play();
                    localStorage.setItem('new_mail_sound', 'true');
                } else {
                    localStorage.setItem('new_mail_sound', 'false');
                }
            } else {
                this.isSettingSound = false;
            }
        },
        timerMin() {
            this.keyMin = `key-min-${new Date().valueOf()}`;
        },
        darkMode() {
            // Update styles in sandbox when dark mode is on/off
            if (this.viewerOpened) {
                this.viewer.bodyHTML = `<base target="_blank"><style>${this.sandboxCss}${this.$vuetify.theme.dark ? this.sandboxCssDark : ''}</style>${this.viewer.bodyRawHTML}`;
            }
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            backend: (state) => state.backend,
            backendStatus: (state) => state.backendStatus,
            account: (state) => state.account,
            subjects: (state) => state.subjects,
            timerMin: (state) => state.timerMin,
            darkMode: (state) => state.darkMode,
        }),
        mailUnseen() {
            // Filter out unread mails
            return this.mails.filter((item) => (item.unseen));
        },
    },
    async mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

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
        this.md.use(mdSub);
        this.md.use(mdSup);
        this.md.use(mdSpan);
        this.md.use(mdAttrs, {
            allowedAttributes: ['red', 'orange', 'yellow', 'green', 'teal', 'blue', 'purple', 'grey', 'bg-red', 'bg-orange', 'bg-yellow', 'bg-green', 'bg-teal', 'bg-blue', 'bg-purple', 'bg-grey', 'big', 'small', 'style'],
        });

        // Restore settings
        this.isSettingSound = true;
        if (localStorage.getItem('new_mail_sound') === 'true') {
            this.ifNotify = [0];
        }

        // Check if updating
        if ((localStorage.getItem('update_frontend') || 'false') !== 'true') {
            // Fetch mail list
            this.$nextTick(() => {
                this.updateMailList();
            });
        } else {
            this.loading = true;
        }

        // Update mail list every 10 minutes
        this.timer = setInterval(() => {
            this.updateMailList(true);
        }, 600000);

        this.$refs.sandbox.addEventListener('load', this.updateSandboxHeight);

        // Restore cache
        this.cachedMails = await localForage.getItem('mail_cache') || [];
    },
    beforeDestroy() {
        clearInterval(this.timer);
        this.$refs.sandbox.removeEventListener('load', this.updateSandboxHeight);
    },
};
</script>

<style lang="less">
@keyframes refresh {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(-360deg);
    }
}
.mail-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
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
        .num-badge {
            display: inline-block;
            padding: 0 9px;
            min-width: 25px;
            border-radius: 10px;
            background-color: #EEEEEE;
            font-size: 13.5px;
            margin-left: 3px;
        }
        .refresh-loading {
            animation: refresh 1.5s infinite linear;
            display: flex;
        }
    }
    .v-skeleton-loader .v-skeleton-loader__list-item-avatar-three-line {
        height: 79px;
    }
    .new-mail-audio {
        display: none;
    }
    .viewer-layer-mask, .editor-layer-mask {
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
    }.editor-layer-mask {
        z-index: 5;
    }
    .viewer-layer, .editor-layer {
        position: absolute;
        top: 561px;
        left: 0;
        z-index: 4;
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
            .layer-title {
                vertical-align: middle;
            }
            .layer-title-avatar{
                & > span {
                    font-size: 12px;
                    margin-top: 1px;
                }
                & > i {
                    margin-left: 1px;
                }
            }
        }
        &.opened {
            top: 0;
            pointer-events: auto;
        }
    }
    .viewer-layer {
        .viewer {
            max-height: 503px;
            overflow: auto;
        }
        .subject-subtitle {
            user-select: none;
            margin-top: -5px;
            & > span {
                cursor: pointer;
            }
            .subject-color-samll {
                width: 8px;
                height: 8px;
                display: inline-block;
                border-radius: 50%;
                margin: 0;
                margin-right: 3px;
                margin-bottom: 1px;
            }
        }
        .mail-view-subject {
            font-size: 1.2rem !important;
            line-height: 1.7rem;
            opacity: .9;
        }
        .mail-detail{
            background-color: #F3F3F3;
            border-radius: 8px;
            .mail-from-line {
                position: relative;
                white-space: nowrap;
                .expand-btn {
                    position: absolute;
                    top: -1px;
                    right: 0;
                    i {
                        transition: all .3s;
                        &.detail-expanded {
                            transform: rotate(180deg);
                        }
                    }
                }
                .v-chip {
                    width: fit-content;
                    max-width: calc(100% - 60px);
                    position: relative;
                    .v-chip__content {
                        overflow: hidden;
                        text-overflow: ellipsis;
                        margin-right: 18px;
                        display: inline-block;
                        line-height: 24px;
                        button {
                            position: absolute;
                            right: 12px;
                            top: 3px;
                        }
                    }
                }
            }
            .expand {
                .mail-to-line {
                    .v-chip:not(.to-me) {
                        width: fit-content;
                        max-width: calc(100% - 35px);
                        position: relative;
                        .v-chip__content {
                            overflow: hidden;
                            text-overflow: ellipsis;
                            margin-right: 18px;
                            display: inline-block;
                            line-height: 24px;
                            button {
                                position: absolute;
                                right: 12px;
                                top: 3px;
                            }
                        }
                    }
                }
                .mail-time-line {
                    & > span {
                        display: inline-flex;
                        height: 24px;
                        align-items: center;
                        vertical-align: sub;
                        & > i {
                            margin-top: -1px;
                        }
                    }
                }
            }
            .attachment-list {
                .attachment-item {
                    width: calc(50% - 6px);
                    height: 55px;
                    border-radius: 6px;
                    border: 1px solid #E0E0E0;
                    transition: background-color .2s;
                    &:nth-of-type(2n) {
                        margin-right: 0!important;
                    }
                    .file-name {
                        width: calc(100% - 72px);
                        margin-top: 3px;
                        .text-caption {
                            margin-top: -4px;
                        }
                    }
                    button {
                        .rotating {
                            animation: progress-circular-rotate 1.4s linear infinite;
                            .v-progress-circular__underlay {
                                stroke: transparent;
                            }
                        }
                    }
                    &.full-width {
                        width: calc(100% - 4px);
                        margin-right: 0!important;
                    }
                    &:hover {
                        background-color: rgba(0, 0, 0, .03);
                    }
                }
            }
        }
        .v-skeleton-loader {
            & > div {
                padding: 0 20px;
            }
            .v-skeleton-loader__list-item-two-line {
                margin-top: -5px;
                height: 50px;
            }
        }
        .v-alert {
            border-radius: 8px;
            .v-alert__wrapper {
                margin-top: 4px!important;
                .v-alert__icon {
                    margin-top: 3px;
                    margin-right: 12px;
                }
            }
        }
        .body-text {
            white-space: pre-wrap;
        }
        .sandbox {
            border: none;
            width: calc(100% - 40px);
            overflow: visible;
            margin-bottom: 10px!important;
        }
    }
    .editor-layer {
        z-index: 6;
        .render-result {
            height: 500px;
            overflow: auto;
            overscroll-behavior: contain;
            padding: 10px 20px;
            .accent {
                background-color: transparent!important;
                border: none!important;
                border-color: transparent!important;
            }
            @import (less) "../../backend/css/md.css";
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
        .v-list-item {
            transition: background-color .2s;
            min-height: 30px;
            &:hover, &:focus {
                background-color: rgba(0, 0, 0, .04);
            }
            &.flaged, &.unseen {
                background-color: fade(#660099, 12%);
                &:hover, &:focus {
                    background-color: fade(#660099, 20%);
                }
            }
            &.unseen {
                border-left: 4px solid #660099;
                padding-left: 12px;
                .v-list-item__title {
                    font-weight: bold;
                }
            }
        }
        .v-list-item__content {
            padding: 10px 0;
            .from {
                margin-bottom: 3px;
            }
        }
        .time-icon {
            vertical-align: text-top;
        }
        .person-icon {
            vertical-align: text-top;
        }
        .subject-color-samll {
            width: 10px;
            height: 10px;
            display: inline-block;
            border-radius: 50%;
            margin: 0;
            margin-right: 3px;
        }
    }
    .more-mail {
        margin-top: -8px;
        padding-top: 14px;
        font-family: Roboto, -apple-system, "Noto Sans", "Helvetica Neue", Helvetica, "Nimbus Sans L", Arial,"Liberation Sans", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Source Han Sans SC", "Source Han Sans CN", "Microsoft YaHei", "Wenquanyi Micro Hei", "WenQuanYi Zen Hei", "ST Heiti", SimHei, "WenQuanYi Zen Hei Sharp", sans-serif!important;
        background-color: rgba(0, 0, 0, .02);
        a {
            cursor: pointer;
            text-decoration: none;
        }
        a.no-underline-link {
            padding-left: 3px;
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
.mail-all-read {
    .v-list-item__icon {
        margin: 12px 16px 0 0!important;
    }
}
.mail-menu-list {
    .v-list-item__icon {
        margin: 10px 16px 0 0!important;
    }
    .v-list-item__content {
        padding: 12px 0;
    }
    .v-list-item {
        min-height: 30px;
    }
}
.mail-course-card {
    .course-name {
        line-height: 17px;
        margin-top: 10px;
        .course-smaller-font {
            font-size: 0.875rem;
        }
    }
    .course-home {
        margin-top: 10px;
    }
    .v-card__text {
        padding-top: 5px;
        &.empty {
            padding: 4.5px;
        }
    }
    .list {
        margin-bottom: 0;
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
                font-family: monospace;
                width: 90px;
                margin-right: -4px;
                .v-icon--left {
                    margin-right: 4px;
                }
            }
        }
    }
}
#app.theme--dark .mail-container {
    h2 {
        .num-badge {
            background-color: #3E3E3E;
        }
    }
    .viewer-layer {
        .mail-detail{
            background-color: #2C2C2C;
        }
        .attachment-list {
            .attachment-item {
                border: 1px solid #414141;
                &:hover {
                    background-color: rgba(255, 255, 255, .03);
                }
            }
        }
    }
    .viewer-layer, .editor-layer {
        background-color: #1E1E1E;
        h2 {
            .title-input {
                color: white;
            }
        }
        .render-result {
            color: rgba(255, 255, 255, .87);
            blockquote {
                border-left: 4px solid #3b3b3b;
                color: #999999;
            }
            [purple] {
                color: #D099E0;
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
                background-color: #303030;
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
            &.flaged, &.unseen {
                background-color: fade(#D099E0, 12%);
                &:hover, &:focus {
                    background-color: fade(#D099E0, 20%);
                }
            }
            &.unseen {
                border-left: 4px solid #D099E0;
            }
        }
    }
    .more-mail {
        background-color: rgba(255, 255, 255, .025);
    }
}
#app.theme--dark .mail-course-card {
    .v-toolbar {
        background-color: #1E1E1E!important;
    }
    .list {
        background-color: #2c2c2c;
    }
}
</style>

<i18n src="../locales/network.json"></i18n>
<i18n>
{
    "en": {
        "mail": "Inbox",
        "nothing": "No mail",
        "cannot_fetch": "Unable to fetch mail list, probably you are not properly configured backend information or the backend does not allow this.",
        "network_error_body": "Cannot fetch related mail data from backend",
        "cannot_download": "Unable to download attachment from the backend",
        "learn_more": "Learn more",
        "new_mail": "New Mail",
        "md_support": "Markdown supported",
        "view": "View",
        "edit": "Edit",
        "write": "Write mail",
        "refresh": "Refresh",
        "more": "More",
        "all_read": "Mark all as read",
        "mark_seen": "Mark as read",
        "sound_notification": "New mail sound notification",
        "no_subject": "No Subject",
        "mail_view": "Mail",
        "remain_week": "%d week ago",
        "remain_day": "%d day ago",
        "remain_day_plural": "%d days ago",
        "remain_hour": "%d hour ago",
        "remain_hour_plural": "%d hours ago",
        "remain_min": "%d min ago",
        "remain_min_plural": "%d mins ago",
        "just_now": "Just now",
        "flagged": "Flagged",
        "flag": "Flag",
        "unflag": "Unflag",
        "reply": "Reply",
        "close": "Close",
        "forward": "Forward",
        "mark_junk": "Mark as junk",
        "delete": "Delete mail",
        "more_mail": "Showing emails from the last 2 weeks. To check out more emails please go to",
        "me": "Me",
        "from": "From",
        "to": "To",
        "cc": "CC",
        "time": "Time",
        "trusted_sender": "Trusted mail sender",
        "internal_sender": "From a UoM internal address",
        "unsafe_content": "This email is from a untrusted sender external to UoM, displaying in plain text mode",
        "untrusted_content": "This email may not be credible",
        "this_is_safe": "This email is safe",
        "expand": "Expand",
        "attachment_num": "%d attachments",
        "subject_home": "Course Home Page",
        "quick_zoom": "Zoom meeting quick start",
        "quick_teams": "Teams meeting quick start",
        "copy_passcode": "Copy passcode",
        "mail_body": "Mail body"
    },
    "zh": {
        "mail": "收件箱",
        "nothing": "没有邮件",
        "cannot_fetch": "无法获取邮件，可能是没有正确配置后端信息或后端不允许。",
        "network_error_body": "无法从后端获取相关邮件信息。",
        "cannot_download": "无法从后端下载附件",
        "learn_more": "了解更多",
        "new_mail": "新邮件",
        "md_support": "支持 Markdown",
        "view": "查看",
        "edit": "编辑",
        "write": "写邮件",
        "refresh": "刷新",
        "more": "更多",
        "all_read": "全部标记已读",
        "mark_seen": "标记为已读",
        "sound_notification": "新邮件声音通知",
        "no_subject": "无主题",
        "mail_view": "邮件",
        "remain_week": "%d 周前",
        "remain_day_plural": "%d 天前",
        "remain_day": "%d 天前",
        "remain_day_plural": "%d 天前",
        "remain_hour": "%d 小时前",
        "remain_hour_plural": "%d 小时前",
        "remain_min": "%d 分钟前",
        "remain_min_plural": "%d 分钟前",
        "just_now": "刚刚",
        "flagged": "已旗标",
        "flag": "旗标",
        "unflag": "取消旗标",
        "reply": "回复",
        "close": "关闭",
        "forward": "转发",
        "mark_junk": "标记为垃圾邮件",
        "delete": "删除邮件",
        "more_mail": "只显示近两周的邮件。要查看更多邮件请前往",
        "me": "我",
        "from": "发件人",
        "to": "收件人",
        "cc": "抄送",
        "time": "时间",
        "trusted_sender": "可信发件人",
        "internal_sender": "来自曼大内部邮箱",
        "unsafe_content": "此邮件来自曼大外部的非可信发件人，正在以纯文本模式显示",
        "untrusted_content": "此邮件内容可能不可信",
        "this_is_safe": "此内容安全",
        "expand": "展开",
        "attachment_num": "%d 个附件",
        "subject_home": "科目主页",
        "quick_zoom": "快速启动 Zoom 会议",
        "quick_teams": "快速启动 Teams 会议",
        "copy_passcode": "复制密码",
        "mail_body": "邮件正文"
    }
}
</i18n>

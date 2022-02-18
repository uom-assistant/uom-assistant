<template>
    <div class="settings" :class="{ 'small-screen': $vuetify.breakpoint.smAndDown }">
        <div class="settings-list" :class="{ 'small-screen': $vuetify.breakpoint.xsOnly }">
            <h2 class="text-h5 d-flex align-center  mb-8"><v-icon class="mr-3">mdi-server</v-icon>{{ $t('backend_settings') }}</h2>
            <v-text-field
                v-model.trim="backendURL"
                outlined
                validate-on-blur
                :label="$t('backend_url')"
                :rules="rulesUrl"
                :readonly="loading"
                :disabled="needToken"
                :error="urlError"
                :error-messages="urlError ? (urlErrorTemp ? $t('backend_maintenance') : $t('wrong_url')) : []"
                prefix="https://"
                prepend-inner-icon="mdi-server"
                @keydown="urlError = false"
            ></v-text-field>
            <v-text-field
                v-model.trim="backendToken"
                outlined
                :label="$t('backend_token')"
                :class="{ shown: needToken }"
                :disabled="!needToken"
                :readonly="loading"
                :hint="$t('need_token')"
                :error="tokenError"
                :error-messages="tokenError ? $t('wrong_token') : []"
                :type="showToken ? 'text' : 'password'"
                :append-icon="showToken ? 'mdi-eye' : 'mdi-eye-off'"
                prepend-inner-icon="mdi-shield-lock"
                class="token-input"
                @keydown="tokenError = false"
                @click:append="showToken = !showToken"
            ></v-text-field>
            <v-btn
                depressed
                color="primary"
                class="mb-3"
            >
                {{ $t('save') }}
            </v-btn>

            <v-divider class="mt-6 mb-8"></v-divider>

            <h2 class="text-h5 d-flex align-center mb-8"><v-icon class="mr-3">mdi-account-circle-outline</v-icon>{{ $t('account_settings') }}</h2>
            <settings></settings>
            <v-btn
                depressed
                color="primary"
                class="mb-3"
            >
                {{ $t('save') }}
            </v-btn>

            <v-divider class="mt-6 mb-8"></v-divider>

            <h2 class="text-h5 d-flex align-center"><v-icon class="mr-3">mdi-web</v-icon>{{ $t('network_settings') }}</h2>
            <v-list flat class="network-list">
                <v-list-item-group v-model="networkSettings" multiple>
                    <v-list-item class="pa-0" :ripple="false">
                        <template v-slot:default="{ active }">
                            <v-list-item-content class="ui-list-item">
                                <v-list-item-title class="mt-1 d-flex align-center switch-list-title">{{ $t('network_proxy') }}</v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-switch :input-value="active"></v-switch>
                            </v-list-item-action>
                        </template>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <div class="d-flex">
                <v-select
                    v-model="proxyProtocol"
                    outlined
                    dense
                    :items="['HTTP://', 'HTTPS://']"
                    :disabled="!networkSettings.includes(0)"
                    class="input-proxy-protocol"
                ></v-select>
                <v-text-field
                    v-model.trim="proxyAddress"
                    outlined
                    validate-on-blur
                    dense
                    :label="$t('proxy_address')"
                    :rules="rulesHost"
                    :disabled="!networkSettings.includes(0)"
                    class="ml-3"
                ></v-text-field>
                <v-text-field
                    v-model.number="proxyPort"
                    outlined
                    validate-on-blur
                    dense
                    :label="$t('proxy_port')"
                    :rules="rulesPort"
                    :disabled="!networkSettings.includes(0)"
                    type="number"
                    class="ml-3 input-proxy-port"
                    min="1"
                    max="65535"
                    step="1"
                ></v-text-field>
            </div>
            <v-btn
                depressed
                color="primary"
                class="mb-3"
            >
                {{ $t('save') }}
            </v-btn>

            <v-divider class="mt-6 mb-8"></v-divider>

            <h2 class="text-h5 d-flex align-center"><v-icon class="mr-3">mdi-autorenew</v-icon>{{ $t('sync_settings') }}</h2>
            <v-list flat three-line class="sync-list">
                <v-list-item-group>
                    <v-list-item class="pa-0" :ripple="false">
                        <v-list-item-content class="ui-list-item">
                            <v-list-item-title class="mt-1 d-flex align-center switch-list-title"><v-chip class="mr-2 beta-chip px-2 py-2" x-small outlined color="primary">BETA</v-chip>Todoist</v-list-item-title>
                            <v-list-item-subtitle class="mt-1">{{ $t('sync_settings_text') }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn color="primary" depressed @click="openTodoistConfig">{{ $t(todoistConnected ? 'disconnect' : 'connect') }}</v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-item-group>
            </v-list>

            <v-divider class="mt-6 mb-8"></v-divider>

            <h2 class="text-h5 d-flex align-center"><v-icon class="mr-3">mdi-palette-outline</v-icon>{{ $t('ui_settings') }}</h2>
            <v-list flat three-line class="ui-list">
                <v-list-item-group v-model="uiSettings" multiple>
                    <v-list-item class="pa-0" :ripple="false">
                        <template v-slot:default="{ active }">
                            <v-list-item-content class="ui-list-item">
                                <v-list-item-title class="mt-1 d-flex align-center switch-list-title">{{ $t('auto_dark_mode') }}</v-list-item-title>
                                <v-list-item-subtitle class="mt-1">{{ $t('auto_dark_mode_text') }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-switch :input-value="active"></v-switch>
                            </v-list-item-action>
                        </template>
                    </v-list-item>
                    <v-list-item class="pa-0" :ripple="false">
                        <template v-slot:default="{ active }">
                            <v-list-item-content class="ui-list-item">
                                <v-list-item-title class="mt-1 d-flex align-center switch-list-title"><v-chip class="mr-2 beta-chip px-2 py-2" x-small outlined color="primary">BETA</v-chip>{{ $t('blur_mode') }}</v-list-item-title>
                                <v-list-item-subtitle class="mt-1">{{ $t('blur_mode_text') }}</v-list-item-subtitle>
                            </v-list-item-content>
                            <v-list-item-action>
                                <v-switch :input-value="active"></v-switch>
                            </v-list-item-action>
                        </template>
                    </v-list-item>
                </v-list-item-group>
            </v-list>

            <v-divider class="mt-2 mb-8"></v-divider>

            <h2 class="text-h5 d-flex align-center"><v-icon class="mr-3">mdi-human</v-icon>{{ $t('a11y_settings') }}</h2>
            <a11y></a11y>

            <v-divider class="mt-2 mb-8"></v-divider>

            <h2 class="text-h5 d-flex align-center mb-7"><v-icon class="mr-3">mdi-database-cog-outline</v-icon>{{ $t('data_settings') }}</h2>
            <div>
                <v-btn
                    depressed
                    color="primary"
                    class="mb-3 mr-3"
                >
                    <v-icon class="mr-2">mdi-export</v-icon>
                    {{ $t('export') }}
                </v-btn>
                <v-btn
                    depressed
                    color="primary"
                    class="mb-3"
                >
                    <v-icon class="mr-2">mdi-import</v-icon>
                    {{ $t('import') }}
                </v-btn>
            </div>
            <p class="desc">{{ $t('data_settings_text') }}</p>
            <v-btn
                depressed
                dark
                color="red"
                class="mb-3"
            >
                <v-icon class="mr-2">mdi-autorenew</v-icon>
                {{ $t('reset') }}
            </v-btn>
            <p class="desc">{{ $t('clear_text') }}</p>
        </div>
        <v-dialog
            v-model="todoistConfig"
            max-width="600"
            persistent
            :fullscreen="$vuetify.breakpoint.xs"
            :transition="$vuetify.breakpoint.xs ? 'slide-y-reverse-transition' : 'dialog-transition'"
        >
            <v-card :class="$vuetify.breakpoint.xs ? 'rounded-0' : ''">
                <v-card-title class="headline">
                    {{ $t('connect_todoist') }}
                </v-card-title>
                <v-stepper
                    v-model="todoistStep"
                    class="stepper"
                    vertical
                    flat
                >
                    <v-stepper-step
                        :complete="todoistStep > 1"
                        step="1"
                    >API Token</v-stepper-step>

                    <v-stepper-content step="1">
                        <v-card class="rounded-0">
                            <p class="text-body-2">{{ $t('sync_settings_text') }}</p>
                            <div class="text-body-2 mb-6" v-html="$t('todoist_tip')"></div>
                            <v-text-field
                                v-model="todoistToken"
                                outlined
                                validate-on-blur
                                prepend-inner-icon="mdi-shield-lock"
                                hide-details="auto"
                                :label="$t('todoist_token')"
                                :rules="rulesToken"
                                :error="todoistTokenError"
                                :error-messages="todoistTokenError ? $t('wrong_token') : []"
                                :type="showTodoistToken ? 'text' : 'password'"
                                :append-icon="showTodoistToken ? 'mdi-eye' : 'mdi-eye-off'"
                                @keydown="todoistTokenError = false"
                                @click:append="showTodoistToken = !showTodoistToken"
                                @keydown.enter="connectTodoist"
                            ></v-text-field>
                            <v-card-actions class="px-0">
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    @click="todoistConfig = false"
                                    :disabled="loadingTodoist"
                                >
                                    {{ $t('cancel') }}
                                </v-btn>
                                <v-btn
                                    color="primary"
                                    text
                                    @click="connectTodoist"
                                    :disabled="!tokenValid || loadingTodoist"
                                    :loading="loadingTodoist"
                                >
                                    {{ $t('connect') }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-stepper-content>

                    <v-stepper-step
                        :complete="todoistStep > 2"
                        step="2"
                    >{{ $t('choose_project') }}</v-stepper-step>

                    <v-stepper-content step="2">
                        <v-card class="rounded-0">
                            <p class="text-body-2 mb-6">{{ $t('select_project') }}</p>
                            <v-select
                                v-model="selectCourse"
                                :items="todoistList"
                                :label="$t('coursework_project')"
                                item-text="name"
                                item-value="id"
                                outlined
                                dense
                            >
                                <template v-slot:item="data">
                                    <v-list-item-avatar :color="todoistColorList[data.item.color - 30]" size="20"></v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                                        <v-list-item-subtitle>ID: {{ data.item.id }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </template>
                            </v-select>
                            <v-select
                                v-model="selectTask"
                                :items="todoistList"
                                :label="$t('task_project')"
                                item-text="name"
                                item-value="id"
                                hide-details="auto"
                                outlined
                                dense
                            >
                                <template v-slot:item="data">
                                    <v-list-item-avatar :color="todoistColorList[data.item.color - 30]" size="20"></v-list-item-avatar>
                                    <v-list-item-content>
                                        <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                                        <v-list-item-subtitle>ID: {{ data.item.id }}</v-list-item-subtitle>
                                    </v-list-item-content>
                                </template>
                            </v-select>
                            <v-card-actions class="mt-2 px-0">
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            v-on="on"
                                            v-bind="attrs"
                                            icon
                                            small
                                            @click="addProjectOpen"
                                        >
                                            <v-icon>mdi-plus</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('add_project') }}</span>
                                </v-tooltip>
                                <v-tooltip top>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            v-on="on"
                                            v-bind="attrs"
                                            class="ml-2"
                                            icon
                                            small
                                            @click="connectTodoist"
                                            :disabled="loadingTodoist"
                                            :loading="loadingTodoist"
                                        >
                                            <v-icon>mdi-refresh</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>{{ $t('refresh') }}</span>
                                </v-tooltip>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    @click="todoistConfig = false"
                                    :disabled="loadingTodoist"
                                >
                                    {{ $t('cancel') }}
                                </v-btn>
                                <v-btn
                                    color="primary"
                                    text
                                    @click="todoistStep = 3"
                                    :disabled="selectCourse === '' || selectTask === '' || selectCourse === selectTask || !findItem(selectCourse) || !findItem(selectTask) || loadingTodoist"
                                >
                                    {{ $t('next') }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-stepper-content>

                    <v-stepper-step
                        :complete="todoistStep > 3"
                        step="3"
                    >{{ $t('init_sync_direction') }}</v-stepper-step>

                    <v-stepper-content step="3">
                        <p class="text-body-2 mb-6">{{ $t('select_direction') }}</p>
                        <v-item-group mandatory v-model="syncDirection">
                            <v-item v-slot="{ active, toggle }">
                                <v-card
                                    class="sync-direction rounded-lg d-flex align-center pr-4 py-2"
                                    :class="{ active, sync: loadingSync }"
                                    outlined
                                    @click="loadingSync ? null : toggle()"
                                >
                                    <v-icon x-large class="mx-4 sync-icon" :color="active ? 'primary' : ''">mdi-progress-upload</v-icon>
                                    <div>
                                        <p class="mb-1">{{ $t('from_local') }}</p>
                                        <p class="text-body-2 text--secondary mb-0">{{ $t('from_local_text') }}</p>
                                    </div>
                                </v-card>
                            </v-item>
                            <v-item v-slot="{ active, toggle }">
                                <v-card
                                    class="sync-direction rounded-lg mt-2 d-flex align-center pr-4 py-2"
                                    :class="{ active, sync: loadingSync }"
                                    outlined
                                    @click="loadingSync ? null : toggle()"
                                >
                                    <v-icon x-large class="mx-4 sync-icon" :color="active ? 'primary' : ''">mdi-progress-download</v-icon>
                                    <div>
                                        <p class="mb-1">{{ $t('from_todoist') }}</p>
                                        <p class="text-body-2 text--secondary mb-0">{{ $t('from_todoist_text') }}</p>
                                    </div>
                                </v-card>
                            </v-item>
                        </v-item-group>
                        <v-card-actions class="px-0">
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                @click="todoistConfig = false"
                                :disabled="loadingSync"
                            >
                                {{ $t('cancel') }}
                            </v-btn>
                            <v-btn
                                color="primary"
                                text
                                @click="sync"
                                :disabled="loadingSync"
                                :loading="loadingSync"
                            >
                                {{ $t('sync') }}
                            </v-btn>
                        </v-card-actions>
                    </v-stepper-content>

                    <v-stepper-step step="4">{{ $t('complete') }}</v-stepper-step>
                    <v-stepper-content step="4">
                        <v-card class="rounded-0">
                            <h1 class="text-h2 mb-6 pt-1">🎉</h1>
                            <p class="mb-0">{{ $t('sync_complete') }}</p>
                            <v-card-actions class="px-0">
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="primary"
                                    class="mb-n2"
                                    text
                                    @click="finishSync"
                                >
                                    {{ $t('finish') }}
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-stepper-content>
                </v-stepper>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="addProjectDialog"
            max-width="450"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('add_project') }}
                </v-card-title>
                <v-card-text class="pb-0">
                    <v-text-field
                        v-model="projectName"
                        counter="120"
                        :label="$t('project_name')"
                        :readonly="addProjectLoading"
                        clearable
                        dense
                        outlined
                        ref="addInput"
                        @keydown.enter="addProject"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        @click="addProjectDialog = false"
                        :disabled="addProjectLoading"
                    >
                        {{ $t('cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        text
                        @click="addProject"
                        :disabled="projectName === '' || projectName.length > 120 || addProjectLoading"
                        :loading="addProjectLoading"
                    >
                        {{ $t('add') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="addProjectError"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('add_project_error') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('add_project_error_body') }}
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="addProjectError = false"
                >
                    {{ $t('ok') }}
                </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { customAlphabet } from 'nanoid';

import a11y from '@/components/a11y.vue';
import settings from '@/components/settings.vue';

import betterFetch from '../tools/betterFetch';

export default {
    name: 'Settings',
    components: {
        a11y,
        settings,
    },
    data() {
        return {
            uiSettings: [],
            networkSettings: [],
            proxyProtocol: 'HTTP://',
            proxyAddress: '127.0.0.1',
            rulesHost: [
                (value) => !!value || '',
                (value) => /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/.test(value) || /^(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))|\[(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))\](?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/i.test(value) || /^[\w-]+(\.[\w-]+)*(\.[a-z]{2,})$/.test(value) || '',
            ],
            proxyPort: 80,
            rulesPort: [
                (value) => !!value || '',
                (value) => (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 65535) || '',
            ],
            backendURL: '',
            urlError: false,
            urlErrorTemp: false,
            backendToken: '',
            showToken: false,
            needToken: false,
            tokenError: false,
            loading: false,
            rulesUrl: [
                (value) => !!value || '',
                (value) => /^[\w-]+(\.[\w-]+)+([\w.,@^=%:/~+-]*)?$/i.test(value) || '',
            ],
            rulesToken: [
                (value) => !!value || '',
                (value) => /^([a-f]|\d){40}$/i.test(value) || '',
            ],
            todoistToken: '',
            todoistConfig: false,
            loadingTodoist: false,
            loadingTodoist2: false,
            todoistTokenError: false,
            showTodoistToken: false,
            todoistStep: 1,
            todoistList: [],
            selectCourse: '',
            selectTask: '',
            addProjectDialog: false,
            projectName: '',
            addProjectLoading: false,
            addProjectError: false,
            loadingSync: false,
            todoistConnected: false,
            syncDirection: '',
            todoistColorList: ['#b8256f', '#db4035', '#ff9933', '#fad000', '#afb83b', '#7ecc49', '#299438', '#6accbc', '#158fad', '#14aaf5', '#96c3eb', '#4073ff', '#884dff', '#af38eb', '#eb96eb', '#e05194', '#ff8d85', '#808080', '#b8b8b8', '#ccac93'],
        };
    },
    methods: {
        openTodoistConfig() {
            this.todoistStep = 1;
            this.todoistToken = '';
            this.todoistTokenError = false;
            this.showTodoistToken = false;
            this.todoistList = [];
            this.selectCourse = '';
            this.selectTask = '';
            this.projectName = '';
            this.todoistConfig = true;
        },
        async connectTodoist() {
            if (!this.tokenValid || this.loadingTodoist) {
                return;
            }
            this.loadingTodoist = true;

            const data = await betterFetch('https://api.todoist.com/rest/v1/projects', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.todoistToken}`,
                },
            });

            if (data.status && data.status !== 200) {
                this.todoistTokenError = true;
                this.loadingTodoist = false;
                this.todoistStep = 1;
                return;
            }

            this.todoistList = data.filter((item) => !item.inbox_project && !item.shared).map((item) => ({
                id: item.id,
                name: item.name,
                color: item.color,
            }));
            this.loadingTodoist = false;
            this.todoistStep = 2;
        },
        findItem(id) {
            return this.todoistList.find((item) => item.id === id);
        },
        addProjectOpen() {
            this.projectName = '';
            this.addProjectDialog = true;
            setTimeout(() => {
                this.$refs.addInput.focus();
            }, 300);
        },
        async addProject() {
            if (this.projectName === '' || this.projectName.length > 120 || this.addProjectLoading) {
                return;
            }
            this.addProjectLoading = true;

            const data = await betterFetch('https://api.todoist.com/rest/v1/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-Id': customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789-', 36)(),
                    Authorization: `Bearer ${this.todoistToken}`,
                },
                body: JSON.stringify({
                    name: this.projectName,
                }),
            });

            if (data.status && data.status !== 200) {
                this.addProjectError = true;
                this.addProjectLoading = false;
                return;
            }

            this.addProjectLoading = false;
            this.addProjectDialog = false;
            this.connectTodoist();
        },
        async sync() {
            this.loadingSync = true;
            setTimeout(() => {
                this.todoistStep = 4;
                this.loadingSync = false;
            }, 1000);
        },
        finishSync() {
            this.todoistConfig = false;
            this.todoistConnected = true;
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        /**
         * Toggle UI settings
         */
        uiSettings() {
            const data = JSON.parse(localStorage.getItem('misc_settings')) || {};
            data.autoDark = this.uiSettings.includes(0);
            data.blur = this.uiSettings.includes(1);
            localStorage.setItem('misc_settings', JSON.stringify(data));
            this.$store.commit('setAutoDark', data.autoDark);

            if (data.blur) {
                document.documentElement.classList.add('blur-style');
            } else {
                document.documentElement.classList.remove('blur-style');
            }
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            backend: (state) => state.backend,
            theme: (state) => state.theme,
        }),
        /**
         * Check if the token field is valid
         * @returns {boolean} whether the token field is valid
         */
        tokenValid() {
            if (this.todoistToken.length === 0) {
                return false;
            }
            if (/^([a-f]|\d){40}$/i.test(this.todoistToken)) {
                return true;
            }
            return false;
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Read UI setting from localStorage
        const uiConfig = (JSON.parse(localStorage.getItem('misc_settings')) || {});
        if (uiConfig.autoDark) {
            this.uiSettings.push(0);
        }
        if (uiConfig.blur) {
            this.uiSettings.push(1);
        }

        // Read backend info from localStorage
        const backend = JSON.parse(localStorage.getItem('backend') || `{
            "url": "",
            "token": "",
            "status": true
        }`);

        this.backendURL = backend.url;
    },
};
</script>

<style lang="less" scoped>
.settings {
    min-height: calc(100vh - 64px);
    padding: 20px;
    padding-top: 100px;
    padding-bottom: 30px;
    margin: 0 auto;
    max-width: 1200px;
    &.small-screen {
        min-height: calc(100vh - 56px);
        padding-top: 50px;
    }
    .settings-list {
        .text-h5 .v-icon {
            font-size: 28px;
        }
        .token-input {
            height: 0;
            opacity: 0;
            transition: height .2s, opacity .2s .2s;
            pointer-events: none;
            &.shown {
                height: 87px;
                opacity: 1;
                pointer-events: auto;
            }
        }
        .ui-list, .network-list, .sync-list {
            background-color: transparent!important;
            .ui-list-item .v-list-item__subtitle {
                -webkit-line-clamp: initial!important;
                display: block!important;
            }
        }
        .input-proxy-protocol {
            width: 130px;
            flex-grow: 0;
        }
        .input-proxy-port {
            width: 120px;
            flex-grow: 0;
        }
        .desc {
            font-size: 0.875rem;
            line-height: 1.2;
            color: rgba(0, 0, 0, .6);
            margin: 0 0 20px 0;
        }
        .switch-list-title {
            min-height: 25px;
            white-space: normal;
            .beta-chip {
                flex-shrink: 0;
            }
        }
        .v-list-item {
            min-height: 0;
        }
    }
    hr {
        border-width: 2px 0 0 0;
    }
}
.stepper {
    background-color: transparent;
    padding-bottom: 12px;
}
.sync-direction {
    border-width: 2px;
    min-height: 120px;
    &.active {
        border-color: #609;
    }
    &.sync {
        pointer-events: none;
    }
    .sync-icon {
        font-size: 45px!important;
    }
}
#app.theme--dark {
    .settings {
        .settings-list {
            .desc {
                color: rgba(255, 255, 255, .7);
            }
        }
    }
    .sync-direction {
        &.active {
            border-color: #D099E0;
        }
    }
}
</style>

<i18n>
{
    "en": {
        "backend_settings": "Backend Settings",
        "account_settings": "Account Settings",
        "ui_settings": "UI Settings",
        "network_settings": "Network Settings",
        "a11y_settings": "Accessibility Settings",
        "data_settings": "Data Management",
        "auto_dark_mode": "Auto Dark Mode Support",
        "auto_dark_mode_text": "Add an option to the config menu so that UoM Assistant's UI theme can switch automatically according to the system settings.",
        "save": "Save",
        "network_proxy": "Network Proxy",
        "proxy_address": "Proxy Address",
        "proxy_port": "Proxy Port",
        "export": "Export Settings",
        "import": "Import Settings",
        "reset": "Clear And Reset",
        "data_settings_text": "You can export the current settings and import them on another devices.",
        "clear_text": "Clear all data saved in your browser and completely reset UoM Assistant.",
        "backend_url": "Backend URL",
        "backend_maintenance": "The backend is under maintenance or backend version not supported",
        "wrong_url": "Cannot connect to this URL",
        "backend_token": "Token",
        "need_token": "You need a valid token to access this backend",
        "wrong_token": "This token is invalid",
        "message_from_backend": "Message from the backend",
        "ok": "OK",
        "blur_mode": "Acrylic Style",
        "blur_mode_text": "Enable acrylic style for all user interface.",
        "sync_settings": "Sync Settings",
        "sync_settings_text": "UoM Assistant can sychronize your course unit and task list crosss devices via Todoist API.",
        "connected": "Connected",
        "connect_todoist": "Connect with Todoist",
        "connect": "Connect",
        "disconnect": "Disconnect",
        "todoist_tip": "<p>To use <a href=\"https://todoist.com/\" target=\"_blank\" rel=\"noopener nofollow\">Todoist</a> for synchronising your data, you need to register as a Todoist user and follow its <a href=\"https://doist.com/terms-of-service\" target=\"_blank\" rel=\"noopener nofollow\">ToS</a> and <a href=\"https://doist.com/privacy\" target=\"_blank\" rel=\"noopener nofollow\">privacy policy</a>.</p><p>Todoist is a third party service which is created by <a href=\"https://doist.com/\" target=\"_blank\" rel=\"noopener nofollow\">Doist</a>, and is not affiliated with the UoM Assistant team or the University of Manchester. Your course unit list and task list will be transferred to Todoist and we cannot guarantee how your data will be used by Todoist. If you are unsure about Todoist's service, you can disconnect from Todoist at any time.</p><p>Get the API Token from the settings page of Todoist and fill in the input box below. This Token will be stored in this browser and will be sent directly to the Todoist API for authentication if required.</p>",
        "todoist_token": "Todoist Token",
        "cancel": "Cancel",
        "choose_project": "Choose projects",
        "init_sync_direction": "Initial sync direction",
        "complete": "Complete",
        "next": "Next",
        "coursework_project": "Assign Todoist project for \"course units\"",
        "task_project": "Assign Todoist project for \"tasks\"",
        "select_project": "You need to specify two different Todoist projects for the synchronisation of the \"Course Unit\" component and the \"Task\" component. The selected Todoist projects will be used exclusively for the synchronisation of UoM Assistant and should not be modified manually if possible.",
        "add_project": "New project",
        "refresh": "Refresh project list",
        "project_name": "Project name",
        "add": "Create",
        "from_todoist": "From Todoist to browser",
        "from_todoist_text": "Clear course units and tasks from your browser and sync data from Todoist",
        "from_local": "From browser to Todoist",
        "from_local_text": "Clear selected projects in Todoist and sync data from your browser",
        "select_direction": "Select the direction of the first synchronisation.",
        "sync": "Sync",
        "sync_complete": "Congratulations! The first sync with Todoist is complete! After that, UoM Assistant will regularly sync your course unit and task lists with Todoist so that all devices connected to this Todoist account will have access to a consistent list of course units and tasks.",
        "finish": "Finsh",
        "add_project_error": "Failed to create new project",
        "add_project_error_body": "Failed to create new project, Please check your input and make sure you have the correct Todoist token."
    },
    "zh": {
        "backend_settings": "后端设置",
        "account_settings": "账户设置",
        "ui_settings": "界面设置",
        "network_settings": "网络设置",
        "a11y_settings": "可访问性设置",
        "data_settings": "数据管理",
        "auto_dark_mode": "自动暗色模式支持",
        "auto_dark_mode_text": "在配置菜单中添加一个选项，使曼大助手的界面主题跟随系统设置自动切换。",
        "save": "保存",
        "network_proxy": "网络代理",
        "proxy_address": "代理地址",
        "proxy_port": "代理端口",
        "export": "导出设置",
        "import": "导入设置",
        "reset": "清除并重置",
        "data_settings_text": "你可以导出当前设置以便在另一个设备上导入。",
        "clear_text": "清除浏览器中保存的所有数据并完全重置曼大助手。",
        "backend_url": "后端 URL",
        "backend_maintenance": "不支持的后端版本或后端正在维护，暂时无法连接",
        "wrong_url": "无法连接到这个地址",
        "backend_token": "令牌",
        "need_token": "访问这个后端需要正确的令牌",
        "wrong_token": "此令牌无效",
        "message_from_backend": "来自后端的消息",
        "ok": "好",
        "blur_mode": "亚克力风格",
        "blur_mode_text": "为界面启用亚克力风格。",
        "sync_settings": "同步设置",
        "sync_settings_text": "曼大助手可以通过 Todoist API 跨设备地同步你的课程列表和任务列表。",
        "connected": "已连接",
        "connect_todoist": "与 Todoist 连接",
        "connect": "连接",
        "disconnect": "断开连接",
        "todoist_tip": "<p>要使用 <a href=\"https://todoist.com/\" target=\"_blank\" rel=\"noopener nofollow\">Todoist</a> 同步数据，你需要注册为 Todoist 用户并遵循其<a href=\"https://doist.com/terms-of-service\" target=\"_blank\" rel=\"noopener nofollow\">服务条款</a>和<a href=\"https://doist.com/privacy\" target=\"_blank\" rel=\"noopener nofollow\">隐私政策</a>。</p><p>Todoist 属于第三方服务，由 <a href=\"https://doist.com/\" target=\"_blank\" rel=\"noopener nofollow\">Doist</a> 创建，与曼大助手团队或曼彻斯特大学无关。你的课程列表和任务列表将会被传输至 Todoist，我们无法保证 Todoist 会如何使用你的数据。如果你对 Todoist 的服务感到疑虑，你可以随时断开与 Todoist 的连接。</p><p>从 Todoist 的设置页中获取 API Token，然后填入下方输入框。此 Token 会被存储于此浏览器中，并会在需要时被直接发送至 Todoist API 以验证你的身份。</p>",
        "todoist_token": "Todoist 令牌",
        "cancel": "取消",
        "choose_project": "选择项目",
        "init_sync_direction": "初始同步方向",
        "complete": "完成",
        "next": "下一步",
        "coursework_project": "为“课程”指定 Todoist 项目",
        "task_project": "为“任务”指定 Todoist 项目",
        "select_project": "你需要为“课程”组件和“任务”组件的同步指定两个不同的 Todoist 项目。被选中的 Todoist 项目将会被完全用于曼大助手的同步，请尽可能不要手动修改。",
        "add_project": "添加项目",
        "refresh": "刷新项目列表",
        "project_name": "项目名称",
        "add": "添加",
        "from_todoist": "从 Todoist 到浏览器",
        "from_todoist_text": "清空浏览器中的课程和任务并从 Todoist 同步数据",
        "from_local": "从浏览器到 Todoist",
        "from_local_text": "清空 Todoist 中对应的项目并从浏览器同步数据",
        "select_direction": "选择第一次同步的方向。",
        "sync": "同步",
        "sync_complete": "恭喜，第一次与 Todoist 的同步已完成！之后，曼大助手将会定期与 Todoist 同步你的课程和任务列表，这样所有连接到此 Todoist 账户的设备都将可以获得一致的课程和任务列表。",
        "finish": "完成",
        "add_project_error": "项目添加失败",
        "add_project_error_body": "项目添加失败，请检查你的输入并确保你的 Todoist 令牌正确。"
    },
    "es": {
        "backend_settings": "Configuración de back-end",
        "account_settings": "Configuración de cuenta",
        "ui_settings": "Configuración de interfaz de usuario",
        "network_settings": "Configuración de la red",
        "a11y_settings": "Configuración de accesibilidad",
        "data_settings": "Gestión de datos",
        "auto_dark_mode": "",
        "auto_dark_mode_text": "",
        "save": "Guardar",
        "network_proxy": "Red Proxy",
        "proxy_address": "Dirección Proxy",
        "proxy_port": "Puerto Proxy",
        "export": "Exportar configuración",
        "import": "Importar configuración",
        "reset": "Limpiar y restablecer",
        "backend_url": "Back-end URL",
        "backend_maintenance": "Versión de back-end no compatible o back-end en mantenimiento",
        "wrong_url": "No ha sido posible conectarse a este URL",
        "backend_token": "Token",
        "need_token": "Para acceder este back-end necesita un token válido",
        "wrong_token": "Token invalido",
        "message_from_backend": "Mensaje desde back-end",
        "ok": "OK",
        "blur_mode": "",
        "blur_mode_text": "",
        "sync_settings": "",
        "sync_settings_text": "",
        "connected": "",
        "connect": "",
        "cancel": "Cancelar"
    },
    "ja": {
        "backend_settings": "",
        "account_settings": "",
        "ui_settings": "",
        "network_settings": "",
        "a11y_settings": "",
        "data_settings": "",
        "auto_dark_mode": "",
        "auto_dark_mode_text": "",
        "save": "保存",
        "network_proxy": "",
        "proxy_address": "",
        "proxy_port": "",
        "export": "",
        "import": "",
        "reset": "",
        "backend_url": "バックエンドのURL",
        "backend_maintenance": "サポートされないバックエンドバージョンか、バックエンドはまだメンテナンスています可能性がありますので、今は接続できません。",
        "wrong_url": "このURLに接続できません",
        "backend_token": "トークン",
        "need_token": "このバックエンドをアクセスために正しいトークンが必要です。",
        "wrong_token": "このトークンが無効です",
        "message_from_backend": "バックエンドからのメッセージ",
        "ok": "はい",
        "blur_mode": "",
        "blur_mode_text": "",
        "sync_settings_text": "",
        "connected": "",
        "connect": "",
        "cancel": "キャンセル"
    }
}
</i18n>

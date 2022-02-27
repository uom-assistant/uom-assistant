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
            <div class="d-flex justify-space-between" v-if="storageUsage">
                <span>{{ $t('storage') }}</span>
                <span>{{ parseFloat((storageUsage.usage / storageUsage.quota * 100).toFixed(3)) }}%</span>
            </div>
            <div class="progress my-1" v-if="storageUsage">
                <div v-if="storageUsage.usage && !storageUsage.usageDetails" class="progress-bar primary" :style="{ width: `${(storageUsage.usage / storageUsage.quota * 100)}%` }"></div>
                <div v-if="storageUsage.usageDetails && storageUsage.usageDetails.indexedDB" class="progress-bar blue darken-1" :style="{ width: `${(storageUsage.usageDetails.indexedDB / storageUsage.quota * 100)}%` }"></div>
                <div v-if="storageUsage.usageDetails && storageUsage.usageDetails.caches" class="progress-bar pink" :style="{ width: `${(storageUsage.usageDetails.caches / storageUsage.quota * 100)}%`, left: `${(storageUsage.usageDetails.indexedDB / storageUsage.quota * 100)}%` }"></div>
                <div v-if="storageUsage.usageDetails && storageUsage.usageDetails.serviceWorkerRegistrations" class="progress-bar orange" :style="{ width: `${(storageUsage.usageDetails.serviceWorkerRegistrations / storageUsage.quota * 100)}%`, left: `${(storageUsage.usageDetails.indexedDB / storageUsage.quota * 100) + (storageUsage.usageDetails.caches / storageUsage.quota * 100)}%` }"></div>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1" v-if="storageUsage">
                <span>{{ $t('used', [formatBytes(storageUsage.usage)]) }}</span>
                <div>
                    {{ $t('total', [formatBytes(storageUsage.quota)]) }}
                    <v-btn icon x-small class="help-btn" @click="aboutStorage = true">
                        <v-icon
                            class="d-inline-block inline-icon"
                            small
                        >
                            mdi-information-outline
                        </v-icon>
                    </v-btn>
                </div>
            </div>
            <div class="mb-4 text-body-2" v-if="storageUsage.usageDetails">
                <div v-if="storageUsage.usageDetails.indexedDB" class="d-flex justify-space-between"><span><span class="type-dot blue darken-1 mr-2"></span>{{ $t('db') }}</span><span v-if="storageUsage.usageDetails.indexedDB">{{ formatBytes(storageUsage.usageDetails.indexedDB) }}</span><span v-else>0 B</span></div>
                <div class="d-flex justify-space-between"><span><span class="type-dot pink mr-2"></span>{{ $t('cache') }}</span><span v-if="storageUsage.usageDetails.caches">{{ formatBytes(storageUsage.usageDetails.caches) }}</span><span v-else>0 B</span></div>
                <div class="d-flex justify-space-between"><span><span class="type-dot orange mr-2"></span>{{ $t('cache_manage') }}</span><span v-if="storageUsage.usageDetails.serviceWorkerRegistrations">{{ formatBytes(storageUsage.usageDetails.serviceWorkerRegistrations) }}</span><span v-else>0 B</span></div>
            </div>
            <div class="d-flex justify-space-between" v-if="localStorageUsage">
                <span>{{ $t('localstorage') }}</span>
                <span>{{ parseFloat((localStorageUsage.usage / (5 * 1024 * 1024) * 100).toFixed(3)) }}%</span>
            </div>
            <div class="progress my-1" v-if="localStorageUsage">
                <div class="progress-bar primary" :style="{ width: (localStorageUsage.usage / (5 * 1024 * 1024) * 100) + '%' }"></div>
            </div>
            <div class="d-flex justify-space-between text-body-2" v-if="localStorageUsage">
                <span>{{ $tc('used_item', localStorageUsage.items, [localStorageUsage.items, formatBytes(localStorageUsage.usage)]) }}</span>
                <span>{{ $t('total', ['5 MB']) }}</span>
            </div>
            <v-list flat three-line class="storage-list mb-1">
                <v-list-item-group>
                    <v-list-item class="pt-0 mx-n8 px-8 pb-1" @click="persistStroageDialog = true" :class="{ persist }">
                        <v-list-item-content class="ui-list-item">
                            <v-list-item-title class="mt-1 d-flex align-center switch-list-title">{{ $t(persist ? 'persisted_stroage_on' : 'persisted_stroage_off') }}</v-list-item-title>
                            <v-list-item-subtitle class="mt-1">{{ $t(persist ? 'persisted_stroage_text_on' : 'persisted_stroage_text') }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action class="align-self-center" v-if="!persist">
                            <v-icon color="grey">mdi-chevron-right</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
            <div>
                <v-btn
                    depressed
                    color="primary"
                    class="mb-3 mr-3"
                    @click="exportData"
                >
                    <v-icon class="mr-2">mdi-export</v-icon>
                    {{ $t('export') }}
                </v-btn>
                <v-btn
                    depressed
                    color="primary"
                    class="mb-3"
                    @click="$refs.importDialog.openDialog()"
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
                @click="resetDialog = true"
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
        <v-dialog
            v-model="aboutStorage"
            max-width="400"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('about_storage') }}
                </v-card-title>
                    <v-card-text>
                        {{ $t('about_storage_text') }}
                    </v-card-text>
                    <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="aboutStorage = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="persistStroageDialog"
            max-width="500"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('persist_stroage') }}
                </v-card-title>
                <v-card-text v-if="persistStorageSupport" class="pb-0" v-html="$t('persist_stroage_text')"></v-card-text>
                <v-card-text v-else class="pb-0">
                    <p>{{ $t('persist_stroage_unsupported') }}</p>
                </v-card-text>
                <v-card-actions v-if="persistStorageSupport">
                    <v-spacer></v-spacer>
                    <v-btn
                        :disabled="waitingPersist"
                        text
                        @click="persistStroageDialog = false"
                    >
                        {{ $t('cancel') }}
                    </v-btn>
                    <v-btn
                        color="primary"
                        :loading="waitingPersist"
                        :disabled="waitingPersist"
                        text
                        @click="tryPersistStorage"
                    >
                        {{ $t('continue') }}
                    </v-btn>
                </v-card-actions>
                <v-card-actions v-else>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="persistStroageDialog = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="resetDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('reset_dialog') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('reset_dialog_body') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        text
                        :disabled="reseting"
                        @click="resetDialog = false"
                    >
                        {{ $t('cancel') }}
                    </v-btn>
                    <v-btn
                        color="red"
                        text
                        :loading="reseting"
                        :disabled="reseting"
                        @click="reset"
                    >
                        {{ $t('reset') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <importDialog ref="importDialog"></importDialog>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { customAlphabet, nanoid } from 'nanoid';
import localForage from 'localforage';
import { saveAs } from 'file-saver';

import a11y from '@/components/a11y.vue';
import settings from '@/components/settings.vue';
import importDialog from '@/components/import.vue';

import betterFetch from '../tools/betterFetch';
import * as localStorageUsage from '../tools/localstorageUsage.json';

export default {
    name: 'Settings',
    components: {
        a11y,
        settings,
        importDialog,
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
            storageUsage: false,
            localStorageUsage: false,
            aboutStorage: false,
            persist: false,
            persistStroageDialog: false,
            waitingPersist: false,
            resetDialog: false,
            reseting: false,
        };
    },
    methods: {
        /**
         * Open the Todoist configuration dialog
         */
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
        /**
         * Try to connect to Todoist
         */
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

            // Failed to connect
            if (data.status && data.status !== 200) {
                this.todoistTokenError = true;
                this.loadingTodoist = false;
                this.todoistStep = 1;
                return;
            }

            // Success
            this.todoistList = data.filter((item) => !item.inbox_project && !item.shared).map((item) => ({
                id: item.id,
                name: item.name,
                color: item.color,
            }));
            this.loadingTodoist = false;
            this.todoistStep = 2;
        },
        /**
         * Check if a project is in the list by ID
         * @param {number} id project ID
         */
        findItem(id) {
            return this.todoistList.find((item) => item.id === id);
        },
        /**
         * Open the add project dialog
         */
        addProjectOpen() {
            this.projectName = '';
            this.addProjectDialog = true;
            setTimeout(() => {
                this.$refs.addInput.focus();
            }, 300);
        },
        /**
         * Add a project to Todoist
         */
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

            // Error
            if (data.status && data.status !== 200) {
                this.addProjectError = true;
                this.addProjectLoading = false;
                return;
            }

            // Success
            this.addProjectLoading = false;
            this.addProjectDialog = false;

            // Refresh project list
            this.connectTodoist();
        },
        /**
         * Sync data
         */
        async sync() {
            this.loadingSync = true;
            setTimeout(() => {
                this.todoistStep = 4;
                this.loadingSync = false;
            }, 1000);
        },
        /**
         * Finish Todoist configuration
         */
        finishSync() {
            this.todoistConfig = false;
            this.todoistConnected = true;
        },
        /**
         * Calculate localStorage usage
         */
        calcLocalStorage() {
            let total = 0;
            let count = 0;
            const length = Object.keys(localStorage).length;
            for (const key in localStorage) {
                setTimeout(() => {
                    total += new Blob([localStorage[key]]).size;
                    count += 1;
                    if (count === length) {
                        this.localStorageUsage = {
                            items: count,
                            usage: total,
                        };
                    }
                }, 0);
            }
        },
        /**
         * Get storage usage
         */
        calcStorage() {
            if (navigator.storage && navigator.storage.estimate) {
                navigator.storage.estimate().then((estimate) => {
                    this.storageUsage = estimate;
                    if (this.storageUsage.quota && this.storageUsage.quota > 10737418240) {
                        this.storageUsage.quota = 10737418240; // 10 GB
                    }
                });
            }
        },
        /**
         * Check whether the storage is persistent
         */
        async checkPersist() {
            this.persist = navigator.storage && navigator.storage.persisted ? (await navigator.storage.persisted()) : false;
        },
        /**
         * Try to persist storage
         */
        async tryPersist() {
            if (this.persistStorageSupport) {
                if (navigator.permissions && navigator.permissions.query) {
                    const permission = await navigator.permissions.query({
                        name: 'persistent-storage',
                    });
                    if (permission.state === 'granted' || permission.state === 'prompt') {
                        await navigator.storage.persist();
                        this.checkPersist();
                    }
                } else {
                    await navigator.storage.persist();
                    this.checkPersist();
                }
            }
        },
        /**
         * Try to persist storage when click the button
         */
        async tryPersistStorage() {
            this.waitingPersist = true;
            await this.tryPersist();
            this.waitingPersist = false;
            this.persistStroageDialog = false;
        },
        /**
         * Format bytes to file size unit
         * @param {number} bytes file byte length
         * @param {number?} decimals file size decimal number
         * @returns {string} formated string
         */
        formatBytes(bytes, decimals = 2) {
            if (bytes === 0) {
                return '0 B';
            }

            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['B', 'KB', 'MB', 'GB'];

            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return `${parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
        },
        /**
         * Reset and reload UoM Assistant
         */
        async reset() {
            this.reseting = true;
            for (const item of localStorageUsage.default) {
                localStorage.removeItem(item);
            }
            await localForage.clear();
            window.location.reload(true);
        },
        /**
         * Export data
         */
        async exportData() {
            // Magic number for identifying the file
            const magicNumber = new Uint8Array(new ArrayBuffer(2));
            magicNumber[0] = 0x34;
            magicNumber[1] = 0x0B;

            // Export format version
            const backupVersion = new Uint8Array(new ArrayBuffer(1));
            backupVersion[0] = 0;

            // Export localStorage
            const settingsList = {};
            for (const item of localStorageUsage.default) {
                if (item !== 'current_timezone' && item !== 'update_frontend') {
                    if (localStorage.getItem(item) !== null) {
                        settingsList[item] = localStorage.getItem(item);
                    }
                }
            }
            // Hash password
            if (settingsList.account) {
                const account = JSON.parse(settingsList.account) || {};
                if (account.password) {
                    const salt = nanoid(10);
                    account.password = await this.hash(`${account.password}${salt}`);
                    account.salt = salt;
                }
                settingsList.account = JSON.stringify(account);
            }

            // Add binary files to the backup
            const binaryFiles = [];
            const headerImage = await localForage.getItem('header_img');
            if (headerImage !== null) {
                const headerImageLen = new ArrayBuffer(4);
                new DataView(headerImageLen).setUint32(0, headerImage.size, true);
                binaryFiles.push(headerImageLen);
                binaryFiles.push(headerImage);
                settingsList.headerImg = 0;
            }

            // Number of binary files
            const binaryFilesLen = new ArrayBuffer(1);
            new DataView(binaryFilesLen).setUint8(0, binaryFiles.length / 2, true);

            // Export IndexedDB
            const notes = await localForage.getItem('notes');
            if (notes !== null) {
                settingsList.notes = notes;
            }
            const settingsData = new Blob([JSON.stringify(settingsList)]);

            // Calculate JSON size
            const settingsLen = new ArrayBuffer(4);
            new DataView(settingsLen).setUint32(0, settingsData.size, true);

            // Calculate file name
            const now = new Date();
            const fileName = `uoma-backup-${`${now.getFullYear()}`.padStart(2, '0')}-${`${now.getMonth() + 1}`.padStart(2, '0')}-${`${now.getDate()}`.padStart(2, '0')}-${`${now.getHours()}`.padStart(2, '0')}-${`${now.getMinutes()}`.padStart(2, '0')}-${`${now.getSeconds()}`.padStart(2, '0')}.uomadata`;

            saveAs(new Blob([magicNumber, backupVersion, settingsLen, settingsData, binaryFilesLen, ...binaryFiles]), fileName);
        },
        async hash(message, method = 'SHA-256') {
            const msgUint8 = new TextEncoder().encode(message);
            return Array.from(new Uint8Array(await crypto.subtle.digest(method, msgUint8))).map((b) => b.toString(16).padStart(2, '0')).join('');
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
        /**
         * Check whether the browser supports persistent storage
         * @returns {boolean} whether the browser supports persistent storage
         */
        persistStorageSupport() {
            return navigator.storage && navigator.storage.persist;
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

        this.calcLocalStorage();
        this.calcStorage();
        this.checkPersist();
    },
};
</script>

<style lang="less" scoped>
.settings {
    min-height: calc(100vh - 64px);
    padding: 15px;
    padding-top: 50px;
    padding-bottom: 30px;
    margin: 0 auto;
    max-width: 1200px;
    &.small-screen {
        min-height: calc(100vh - 56px);
        padding-top: 30px;
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
        .ui-list, .network-list, .sync-list, .storage-list {
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
    .progress {
        background-color: rgba(126, 126, 126, .3);
        width: 100%;
        height: 6px;
        border-radius: 6px;
        position: relative;
        overflow: hidden;
        .progress-bar {
            position: absolute;
            top: 0;
            left: 0;
            width: 0;
            height: 100%;
        }
    }
    .type-dot {
        width: 7px;
        height: 7px;
        border-radius: 7px;
        display: inline-block;
        margin-bottom: 1px;
    }
    .persist {
        pointer-events: none;
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
        "export": "Export Data",
        "import": "Import Data",
        "reset": "Clear And Reset",
        "data_settings_text": "You can export data UoM Assistant stored in this browser and import them on another devices.",
        "clear_text": "Clear all data saved in your browser by UoM Assistant and completely reset UoM Assistant.",
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
        "add_project_error_body": "Failed to create new project, Please check your input and make sure you have the correct Todoist token.",
        "storage": "Storage",
        "localstorage": "Settings Storage",
        "used": "{0} used",
        "used_item": "{0} item, {1} used | {0} items, {1} used",
        "total": "{0} avaliable",
        "db": "Database",
        "cache": "Offline Cache",
        "cache_manage": "Cache Management",
        "about_storage": "About available space",
        "about_storage_text": "This value is an estimate of the amount of storage space available and is not exact, so the actual space available may vary.",
        "persisted_stroage_on": "Persistent stroage enabled",
        "persisted_stroage_off": "Persistent stroage not enabled",
        "persisted_stroage_text": "The browser will not actively erase the data stored by UoM Assistant when enabled.",
        "persisted_stroage_text_on": "The browser will not actively erase the data stored by UoM Assistant when out of space.",
        "persist_stroage": "Persistent stroage",
        "persist_stroage_text": "<p>With persistent storage enabled, the browser will not actively erase data stored by UoM Assistant when out of space. This will reduce the possibility of accidental loss of important data such as Quick Notes. </p><p>In Safari, your data may still be affected by the \"erasure after 7 days\" restriction. Please consider adding UoM Assistant to your home screen to avoid this restriction.</p><p>Not all browsers support this feature. Tap \"Continue\" to attempt to obtain a authorisation. The final outcome will be determined by the browser in conjunction with the site usage and there is no guarantee that persistent stroage will be authorized.</p>",
        "continue": "Continue",
        "persist_stroage_unsupported": "This browser does not support persistent storage.",
        "reset_dialog": "Reset UoM Assistant",
        "reset_dialog_body": "Are you sure you want to clear all data UoM Assistant stored in this browser and completely reset UoM Assistant? This action is unrecoverable."
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
        "export": "导出数据",
        "import": "导入数据",
        "reset": "清除并重置",
        "data_settings_text": "你可以导出曼大助手在此浏览器中保存的数据以便在另一个设备上导入。",
        "clear_text": "清除浏览器中曼大助手保存的所有数据并完全重置曼大助手。",
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
        "coursework_project": "为「课程」指定 Todoist 项目",
        "task_project": "为「任务」指定 Todoist 项目",
        "select_project": "你需要为「课程」组件和「任务」组件的同步指定两个不同的 Todoist 项目。被选中的 Todoist 项目将会被完全用于曼大助手的同步，请尽可能不要手动修改。",
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
        "add_project_error_body": "项目添加失败，请检查你的输入并确保你的 Todoist 令牌正确。",
        "storage": "存储",
        "localstorage": "设置存储",
        "used": "已使用 {0}",
        "used_item": "{0} 个条目，已使用 {1} | {0} 个条目，已使用 {1}",
        "total": "{0} 可用",
        "db": "数据库",
        "cache": "离线缓存",
        "cache_manage": "缓存管理",
        "about_storage": "关于可用空间",
        "about_storage_text": "此数值为估计的可用存储空间大小，非精确值，因此实际可用空间可能有所不同。",
        "persisted_stroage_on": "持续存储已启用",
        "persisted_stroage_off": "持续存储未启用",
        "persisted_stroage_text": "启用持续存储后浏览器将不会主动清除曼大助手存储的数据。",
        "persisted_stroage_text_on": "在空间不足时浏览器将不会主动清除曼大助手存储的数据。",
        "persist_stroage": "持续存储",
        "persist_stroage_text": "<p>启用持续存储后，浏览器在可用空间不足时将不会主动清除曼大助手存储的数据。这将降低快速笔记等重要数据意外丢失的可能性。</p><p>在 Safari 中，你的数据可能仍然受 7 天清除限制的影响。请考虑将曼大助手添加到主屏幕以避开此限制。</p><p>并非所有浏览器都支持此特性。点按「继续」以尝试获取持续存储授权，最终授权结果将由浏览器结合网站使用状况决定，无法保证获得授权。</p>",
        "continue": "继续",
        "persist_stroage_unsupported": "此浏览器不支持持续存储。",
        "reset_dialog": "重置曼大助手",
        "reset_dialog_body": "你确认要清除浏览器中曼大助手保存的所有数据并完全重置曼大助手吗？此操作不可恢复。"
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
        "cancel": "Cancelar",
        "choose_project": "",
        "init_sync_direction": "",
        "complete": "",
        "next": "",
        "coursework_project": "",
        "task_project": "",
        "select_project": "",
        "add_project": "",
        "refresh": "",
        "project_name": "",
        "add": "",
        "from_todoist": "",
        "from_todoist_text": "",
        "from_local": "",
        "from_local_text": "",
        "select_direction": "",
        "sync": "",
        "sync_complete": "",
        "finish": "",
        "add_project_error": "",
        "add_project_error_body": "",
        "storage": "",
        "localstorage": "",
        "used": "",
        "used_item": "",
        "total": "",
        "db": "",
        "cache": "",
        "cache_manage": "",
        "about_storage": "",
        "about_storage_text": "",
        "persisted_stroage_on": "",
        "persisted_stroage_off": "",
        "persisted_stroage_text": "",
        "persisted_stroage_text_on": "",
        "persist_stroage": "",
        "persist_stroage_text": "",
        "continue": "",
        "persist_stroage_unsupported": "",
        "reset_dialog": "",
        "reset_dialog_body": ""
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
        "cancel": "キャンセル",
        "choose_project": "",
        "init_sync_direction": "",
        "complete": "",
        "next": "",
        "coursework_project": "",
        "task_project": "",
        "select_project": "",
        "add_project": "",
        "refresh": "",
        "project_name": "",
        "add": "",
        "from_todoist": "",
        "from_todoist_text": "",
        "from_local": "",
        "from_local_text": "",
        "select_direction": "",
        "sync": "",
        "sync_complete": "",
        "finish": "",
        "add_project_error": "",
        "add_project_error_body": "",
        "storage": "",
        "localstorage": "",
        "used": "",
        "used_item": "",
        "total": "",
        "db": "",
        "cache": "",
        "cache_manage": "",
        "about_storage": "",
        "about_storage_text": "",
        "persisted_stroage_on": "",
        "persisted_stroage_off": "",
        "persisted_stroage_text": "",
        "persisted_stroage_text_on": "",
        "persist_stroage": "",
        "persist_stroage_text": "",
        "continue": "",
        "persist_stroage_unsupported": "",
        "reset_dialog": "",
        "reset_dialog_body": ""
    }
}
</i18n>

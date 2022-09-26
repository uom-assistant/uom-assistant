<template>
    <v-dialog
        v-model="open"
        persistent
        max-width="600"
        content-class="import-dialog"
    >
        <v-card @dragover.prevent @drop.prevent>
            <v-card-title class="headline">
                {{ $t('import_data') }}
            </v-card-title>
            <v-stepper
                v-model="step"
                class="stepper"
                vertical
                flat
            >
                <v-stepper-step
                    :complete="step > 1"
                    step="1"
                >{{ $t('choose_file') }}</v-stepper-step>

                <v-stepper-content step="1">
                    <v-card class="rounded-0">
                        <p class="text-body-2">{{ $t('choose_file_text') }}</p>
                        <div class="uploader rounded" :class="{ 'drag-over': isDragOver }" @click="$refs.attachmentInput.click()">
                            <div class="drop-layer" @dragover="isDragOver = true" @dragleave="isDragOver = false" @drop="handleFileDrop">
                                <v-icon x-large color="primary" class="mb-3">mdi-file-hidden</v-icon>
                                <span class="primary--text">{{ $t('drop_file') }}</span>
                            </div>
                            <v-icon large class="mb-2">mdi-plus</v-icon>
                            <span>{{ selectedFileName === '' ? $t('upload') : selectedFileName }}</span>
                        </div>
                        <input type="file" id="add-attachment" name="add-attachment" class="d-none" ref="attachmentInput" @change="handleFileInput" accept=".uomadata">
                        <v-card-actions class="px-0">
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                @click="open = false"
                            >
                                {{ $t('cancel') }}
                            </v-btn>
                            <v-btn
                                color="primary"
                                text
                                :disabled="selectedFileName === ''"
                                @click="checkPassword"
                            >
                                {{ $t('continue') }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-step
                    :complete="step > 2"
                    step="2"
                >{{ $t('verify_password') }}</v-stepper-step>

                <v-stepper-content step="2">
                    <v-card class="rounded-0">
                        <p class="text-body-2 mb-6">{{ $t('verify_password_text') }}</p>
                        <v-text-field
                            v-model.trim="inputPassword"
                            outlined
                            validate-on-blur
                            prepend-inner-icon="mdi-lock-outline"
                            hide-details="auto"
                            ref="password"
                            :label="$t('uom_password')"
                            :rules="rulesPassword"
                            :type="showPassword ? 'text' : 'password'"
                            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            v-if="showPasswordInput"
                            @click:append="showPassword = !showPassword"
                            @keydown.enter="checkPasswordHash"
                        ></v-text-field>
                        <v-card-actions class="mt-2 px-0">
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                @click="open = false"
                            >
                                {{ $t('cancel') }}
                            </v-btn>
                            <v-btn
                                color="primary"
                                text
                                :disabled="!validPassword"
                                @click="checkPasswordHash"
                            >
                                {{ $t('continue') }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-step
                    step="3"
                    :complete="step > 3"
                >{{ $t('confirm_import') }}</v-stepper-step>
                <v-stepper-content step="3">
                    <v-card class="rounded-0">
                        <p class="mb-0">{{ $t('confirm_import_text') }}</p>
                        <v-card-actions class="px-0">
                            <v-spacer></v-spacer>
                            <v-btn
                                text
                                @click="open = false"
                            >
                                {{ $t('cancel') }}
                            </v-btn>
                            <v-btn
                                color="red"
                                text
                                @click="doImport"
                            >
                                {{ $t('import') }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>

                <v-stepper-step step="4">{{ $t('complete') }}</v-stepper-step>
                <v-stepper-content step="4">
                    <v-card class="rounded-0">
                        <h1 class="text-h2 mb-6 pt-1">🎉</h1>
                        <p class="mb-0">{{ $t('complete_text') }}</p>
                        <v-card-actions class="px-0">
                            <v-spacer></v-spacer>
                            <v-btn
                                color="primary"
                                class="mb-n2"
                                text
                                @click="finish"
                            >
                                {{ $t('done') }}
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-stepper-content>
            </v-stepper>
        </v-card>
        <v-dialog
            v-model="tooManyDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('too_many') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('too_many_body') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="tooManyDialog = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="notUomadataDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('not_a_uomad') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('not_a_uomad_body') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="notUomadataDialog = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="notSupportedDialog"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('not_supported') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('not_supported_text') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="notSupportedDialog = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="wrongPassword"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('wrong_password') }}
                </v-card-title>
                <v-card-text>
                    {{ $t('wrong_password_text') }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="wrongPassword = false"
                    >
                        {{ $t('ok') }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model="refreshing"
            max-width="400"
            persistent
        >
            <v-card>
                <v-card-title class="headline text-center d-block">
                    {{ $t('loading') }}
                </v-card-title>
                <v-card-text>
                    <v-progress-linear
                        indeterminate
                        color="primary"
                    ></v-progress-linear>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-dialog>
</template>

<script>
import localforage from 'localforage';
import { mapState } from 'vuex';

let parsedJSON = null;
let exportBinaryList = [];

export default {
    name: 'import',
    data() {
        return {
            open: false,
            wrongPassword: false,
            tooManyDialog: false,
            notUomadataDialog: false,
            notSupportedDialog: false,
            isDragOver: false,
            selectedFileName: '',
            step: 1,
            showPassword: false,
            inputPassword: '',
            showPasswordInput: false,
            refreshing: false,
            rulesPassword: [
                (value) => (value === '' || value.length > 3) || '',
            ],
        };
    },
    methods: {
        /**
         * Open import dialog
         */
        openDialog() {
            this.open = true;
            parsedJSON = null;
            exportBinaryList = [];
            this.selectedFileName = '';
            this.inputPassword = '';
            this.step = 1;
        },
        /**
         * Handle file input event
         * @param {Event} e file input event
         */
        handleFileInput(e) {
            if (!e.target.files) {
                return;
            }
            this.selectFile(e.target.files).then(() => {
                e.target.value = '';
            });
        },
        /**
         * Handle file drop event
         * @param {Event} e file drop event
         */
        handleFileDrop(e) {
            this.isDragOver = false;
            if (!e.dataTransfer.files) {
                return;
            }
            this.selectFile(e.dataTransfer.files);
        },
        /**
         * Select and filter a file
         * @param {array} list file list
         */
        async selectFile(list) {
            if (list.length > 1) {
                this.tooManyDialog = true;
                return;
            }
            if (list[0].size > 7 && list[0].name.match(/.uomadata/i)) {
                // Check if it's a dir
                try {
                    await list[0].slice(0, 1).arrayBuffer();
                } catch (err) {
                    this.notUomadataDialog = true;
                    return;
                }

                // Check magic number
                const firstThree = new Uint8Array(await list[0].slice(0, 3).arrayBuffer());
                if (firstThree[0] !== 0x34 || firstThree[1] !== 0x0B) {
                    this.notUomadataDialog = true;
                    return;
                }

                // Check export data format version
                if (firstThree[2] !== 1) {
                    this.notSupportedDialog = true;
                    return;
                }

                // Parse
                const jsonLen = new DataView(await list[0].slice(3, 7).arrayBuffer()).getUint32(0, true);
                try {
                    parsedJSON = JSON.parse(new TextDecoder('utf-8').decode(await list[0].slice(7, 7 + jsonLen).arrayBuffer()));
                } catch (err) {
                    this.notUomadataDialog = true;
                    return;
                }

                const binaryNumber = new Uint8Array(await list[0].slice(7 + jsonLen, 7 + jsonLen + 1).arrayBuffer())[0];
                let pointer = 7 + jsonLen + 1;
                for (let i = 0; i < binaryNumber; i += 1) {
                    // eslint-disable-next-line no-await-in-loop
                    const binLen = new DataView(await list[0].slice(pointer, pointer + 4).arrayBuffer()).getUint32(0, true);
                    pointer += 4;
                    // eslint-disable-next-line no-await-in-loop
                    exportBinaryList.push(await list[0].slice(pointer, pointer + binLen).arrayBuffer());
                    pointer += binLen;
                }

                this.selectedFileName = list[0].name;
            } else {
                this.notUomadataDialog = true;
            }
        },
        /**
         * Check if we need to check password
         */
        async checkPassword() {
            if (parsedJSON === null) {
                return;
            }
            if (parsedJSON.account) {
                const account = JSON.parse(parsedJSON.account) || {};
                if (account.password) {
                    this.step = 2;
                    setTimeout(() => {
                        this.$refs.password.focus();
                    }, 800);
                } else {
                    this.step = 3;
                }
            }
        },
        /**
         * Check input password against the password hash in the file
         */
        async checkPasswordHash() {
            if (this.inputPassword === '' || parsedJSON === null) {
                return;
            }
            const account = JSON.parse(parsedJSON.account) || {};
            if (account.password) {
                if (account.salt) {
                    if ((await this.hash(`${this.inputPassword}${account.salt}`)) === account.password) {
                        // Hash verified
                        account.password = this.inputPassword;
                        delete account.salt;
                        parsedJSON.account = JSON.stringify(account);
                        this.step = 3;
                    } else {
                        this.wrongPassword = true;
                    }
                } else {
                    this.notSupportedDialog = true;
                }
            } else {
                this.step = 3;
            }
        },
        /**
         * Hash a message
         * @param {string} message message to be hashed
         * @param {string} method hash algorithm
         * @returns {string} hashed message
         */
        async hash(message, method = 'SHA-256') {
            const msgUint8 = new TextEncoder().encode(message);
            return Array.from(new Uint8Array(await crypto.subtle.digest(method, msgUint8))).map((b) => b.toString(16).padStart(2, '0')).join('');
        },
        /**
         * Import data
         */
        async doImport() {
            for (const item in parsedJSON) {
                if (item !== 'headerImg' && item !== 'notes') {
                    localStorage.setItem(item, parsedJSON[item]);
                }
            }

            // Import notes
            if (parsedJSON.notes) {
                localforage.setItem('notes', parsedJSON.notes);
            }

            // Import header image
            if (parsedJSON.headerImg !== undefined && exportBinaryList[parsedJSON.headerImg[0]]) {
                localforage.setItem('header_img', new Blob([exportBinaryList[parsedJSON.headerImg[0]]], { type: parsedJSON.headerImg[1] }));
            }
            this.step = 4;
        },
        finish() {
            this.refreshing = true;
            window.location.reload(true);
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        open() {
            if (!this.open) {
                parsedJSON = null;
                exportBinaryList = [];
                this.inputPassword = '';
            }
        },
        step(newVal, oldVal) {
            if (oldVal !== 2 && newVal === 2) {
                this.showPasswordInput = true;
            } else if (oldVal === 2 && newVal !== 2) {
                setTimeout(() => {
                    this.showPasswordInput = false;
                }, 400);
            } else if (newVal === 2) {
                this.showPasswordInput = true;
            } else {
                this.showPasswordInput = false;
            }
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
        validPassword() {
            // Check if password is valid
            if (this.inputPassword === '') {
                return false;
            }
            for (const rule of this.rulesPassword) {
                if (this.inputPassword === '' || !rule(this.inputPassword)) {
                    return false;
                }
            }
            return true;
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';
    },
};
</script>

<style lang="less">
.import-dialog {
    .uploader {
        width: 100%;
        height: 150px;
        border: rgba(136, 136, 136, .7) dashed 2px;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        opacity: .7;
        transition: opacity .2s;
        cursor: pointer;
        user-select: none;
        position: relative;
        & > i.v-icon, & > span {
            opacity: 1;
            transition: opacity .2s;
        }
        & > span {
            display: inline-block;
            padding: 0 10px;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
            max-width: 100%;
        }
        .drop-layer {
            position: absolute;
            display: flex;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: fade(#660099, 30%);
            z-index: 3;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            opacity: 0;
            transition: opacity .2s;
            user-select: none;
            & > i {
                font-size: 80px!important;
            }
        }
        &.drag-over {
            * {
                pointer-events: none;
            }
            & > i.v-icon, & > span {
                opacity: .4;
            }
            .drop-layer {
                opacity: 1;
                pointer-events: auto;
            }
        }
        &:hover {
            opacity: 1;
        }
    }
    .stepper {
        background-color: transparent;
        padding-bottom: 12px;
    }
}
</style>

<i18n>
{
    "en": {
        "import_data": "Import data",
        "upload": "Click or drag & drop to select",
        "too_many": "Too many files",
        "too_many_body": "You can only choose one file at a time.",
        "not_a_uomad": "Not a UoM Assistant data file",
        "not_a_uomad_body": "The file you have selected is not a UoM Assistant data file.",
        "ok": "OK",
        "drop_file": "Drop your file here",
        "cancel": "Cancel",
        "continue": "Continue",
        "import": "Import",
        "choose_file": "Choose a file",
        "choose_file_text": "Choose a UoM Assistant data file to import.",
        "confirm_import": "Confirm import",
        "confirm_import_text": "Are you sure you want to import this file? Any data previously stored in this browser by UoM Assistant will be overwritten and this cannot be undone.",
        "verify_password": "Verify password",
        "verify_password_text": "This UoM Assistant data file contains a UoM account password. For security reasons the relevant data is encrypted when exporting and you have to provide password contained in this data file to proceed with the import.",
        "uom_password": "UoM Account Password",
        "complete": "Import complete",
        "complete_text": "The data import has been completed. Press \"Done\" to reload the page and check the latest changes.",
        "done": "Done",
        "not_supported": "Unsupported data file version",
        "not_supported_text": "Version of this UoM Assistant data file is not supported. This data file may have been created by a new version of UoM Assistant and cannot be parsed correctly.",
        "wrong_password": "Wrong password",
        "wrong_password_text": "The password provided can not match the encrypted data. Please try again.",
        "loading": "Reloading…"
    },
    "zh": {
        "import_data": "导入数据",
        "upload": "点按或拖拽以选择曼大助手数据文件",
        "too_many": "太多文件了",
        "too_many_body": "一次只能选择一个文件。",
        "not_a_uomad": "不是曼大助手数据文件",
        "not_a_uomad_body": "你选择的文件不是一个曼大助手数据文件。",
        "ok": "好",
        "drop_file": "在此放下文件",
        "cancel": "取消",
        "continue": "继续",
        "import": "导入",
        "choose_file": "选择文件",
        "choose_file_text": "选择要被导入的曼大助手数据文件。",
        "confirm_import": "确认导入",
        "confirm_import_text": "你确认要导入这个文件吗？曼大助手此前存储在此浏览器中的数据都将被覆盖，且无法恢复。",
        "verify_password": "验证密码",
        "verify_password_text": "此数据文件中包含曼大账户密码。出于安全考虑，相关数据在导出时已被加密，你需要提供此数据文件中包含的曼大账户密码以继续导入。",
        "uom_password": "曼大账户密码",
        "complete": "导入完成",
        "complete_text": "数据导入已经完成。点按「完成」以重新载入页面并反映最新更改。",
        "done": "完成",
        "not_supported": "不支持的数据文件版本",
        "not_supported_text": "不支持此曼大助手数据文件的版本。此数据文件可能是由新版本的曼大助手创建的，无法被正确解析。",
        "wrong_password": "密码错误",
        "wrong_password_text": "提供的密码无法匹配加密的数据。请重试。",
        "loading": "重新载入…"
    },
    "es": {
        "import_data": "",
        "upload": "",
        "too_many": "Demasiados archivos",
        "too_many_body": "Solo puede elegir un archivo cada vez",
        "not_a_uomad": "",
        "not_a_uomad_body": "",
        "ok": "OK",
        "drop_file": "Suelte su archivo aquí",
        "cancel": "Cancelar",
        "continue": "Continuar",
        "import": "",
        "choose_file": "",
        "choose_file_text": "",
        "confirm_import": "",
        "confirm_import_text": "",
        "verify_password": "",
        "verify_password_text": "",
        "uom_password": "UoM contraseña de cuenta"
    },
    "ja": {
        "import_data": "",
        "upload": "",
        "too_many": "ファイルが多すぎる",
        "too_many_body": "一度に選択できるのは一つのファイルのみ。",
        "not_a_uomad": "",
        "not_a_uomad_body": "",
        "ok": "はい",
        "drop_file": "ここでファイルをドロップして",
        "cancel": "キャンセル",
        "continue": "",
        "import": "",
        "choose_file": "",
        "choose_file_text": "",
        "confirm_import": "",
        "confirm_import_text": "",
        "verify_password": "",
        "verify_password_text": "",
        "uom_password": "大学パスワード"
    }
}
</i18n>

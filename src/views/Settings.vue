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
    </div>
</template>

<script>
import { mapState } from 'vuex';
// import betterFetch from '@/tools/betterFetch';

import a11y from '@/components/a11y.vue';
import settings from '@/components/settings.vue';

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
        };
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        /**
         * Toggle auto dark mode
         */
        uiSettings() {
            const data = JSON.parse(localStorage.getItem('misc_settings')) || {};
            data.autoDark = this.uiSettings.includes(0);
            localStorage.setItem('misc_settings', JSON.stringify(data));
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
            backend: (state) => state.backend,
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Read auto dark mode setting from localStorage
        if ((JSON.parse(localStorage.getItem('misc_settings')) || {}).autoDark) {
            this.uiSettings.push(0);
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
            &.shown {
                height: 87px;
                opacity: 1;
            }
        }
        .ui-list, .network-list {
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
            height: 25px;
        }
        .v-list-item {
            min-height: 0;
        }
    }
    hr {
        border-width: 2px 0 0 0;
    }
}
#app.theme--dark .settings {
    .settings-list {
        .desc {
            color: rgba(255, 255, 255, .7);
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
        "auto_dark_mode": "Auto Dark Mode",
        "auto_dark_mode_text": "Make UoM Assistant's UI theme switch automatically according to the system settings.",
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
        "ok": "OK"
    },
    "zh": {
        "backend_settings": "后端设置",
        "account_settings": "账户设置",
        "ui_settings": "界面设置",
        "network_settings": "网络设置",
        "a11y_settings": "可访问性设置",
        "data_settings": "数据管理",
        "auto_dark_mode": "自动暗色模式",
        "auto_dark_mode_text": "使曼大助手的界面主题跟随系统设置自动切换。",
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
        "ok": "好"
    },
    "es": {
        "backend_settings": "",
        "account_settings": "",
        "ui_settings": "",
        "network_settings": "",
        "a11y_settings": "",
        "data_settings": "",
        "save": "Guardar",
        "network_proxy": "",
        "proxy_address": "",
        "proxy_port": "",
        "export": "",
        "import": "",
        "reset": "",
        "backend_url": "Back-end URL",
        "backend_maintenance": "Versión de back-end no compatible o back-end en mantenimiento",
        "wrong_url": "No ha sido posible conectarse a este URL",
        "backend_token": "Token",
        "need_token": "Para acceder este back-end necesita un token válido",
        "wrong_token": "Token invalido",
        "message_from_backend": "Mensaje desde back-end",
        "ok": "OK",
        "invalid_port": ""
    },
    "ja": {
        "backend_settings": "",
        "account_settings": "",
        "ui_settings": "",
        "network_settings": "",
        "a11y_settings": "",
        "data_settings": "",
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
        "ok": "はい"
    }
}
</i18n>

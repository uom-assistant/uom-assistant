<template>
    <div>
        <v-text-field
            v-model.trim="calendarURL"
            outlined
            :label="$t('calendar_subscription')"
            :key="`settings-calendar-${refreshKey}`"
            :rules="rulesUrl"
            validate-on-blur
            prepend-inner-icon="mdi-calendar-sync-outline"
            class="input"
            ref="calendarSub"
            hide-details="auto"
            @keypress.enter="submit"
        ></v-text-field>
        <span class="mt-1 mb-2 clickable" @click="icaHelper = true">
            <v-icon small class="help-icon">
                mdi-help-circle-outline
            </v-icon>
            {{ $t('where_ica') }}
        </span>
        <v-text-field
            v-model.trim="username"
            outlined
            :label="$t('uom_username')"
            :key="`settings-username-${refreshKey}`"
            :rules="rulesUsername"
            validate-on-blur
            :disabled="!allowAccount"
            :error-messages="hintUsername"
            prepend-inner-icon="mdi-account-circle-outline"
            class="input"
            ref="username"
            @keypress.enter="submit"
        ></v-text-field>
        <v-text-field
            v-model.trim="password"
            outlined
            :label="$t('uom_password')"
            :key="`settings-password-${refreshKey}`"
            :rules="rulesPassword"
            validate-on-blur
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :disabled="!allowAccount"
            :error-messages="hintPassword"
            prepend-inner-icon="mdi-lock-outline"
            class="input"
            @click:append="showPassword = !showPassword"
            @keypress.enter="submit"
        ></v-text-field>
        <v-text-field
            v-model.trim="email"
            outlined
            :label="$t('uom_email')"
            :key="`settings-email-${refreshKey}`"
            :rules="rulesEmail"
            validate-on-blur
            :disabled="!allowAccount || !allowEmail"
            :error-messages="hintEmail"
            prepend-inner-icon="mdi-at"
            suffix=".manchester.ac.uk"
            class="input"
            @keypress.enter="submit"
        ></v-text-field>
        <!-- <v-switch
            v-model="allowSave"
            :label="$t('allow_save')"
            :disabled="!allowSync"
            color="primary"
            class="d-inline-block"
            :class="(allowAccount && allowEmail) ? 'mt-6' : 'mt-0'"
        ></v-switch>
        <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
                <v-icon
                    v-bind="attrs"
                    v-on="on"
                    class="d-inline-block inline-icon"
                >
                    mdi-information-outline
                </v-icon>
            </template>
            <span>{{ allowSync ? $t('will_store_on') : $t('not_allow_sync') }}</span>
        </v-tooltip> -->
        <v-dialog
            v-model="icaHelper"
            max-width="550"
        >
            <v-card>
                <v-card-title class="headline">
                    {{ $t('where_ica') }}
                </v-card-title>
                <v-card-text v-html="$t('where_ica_body')">
                </v-card-text>
                <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    text
                    @click="icaHelper = false"
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

export default {
    name: 'settings',
    data() {
        return {
            calendarURL: '',
            username: '',
            password: '',
            email: '',
            hintUsername: [],
            hintPassword: [],
            hintEmail: [],
            showPassword: false,
            allowSave: false,
            allowAccount: true,
            allowEmail: true,
            // allowSync: true,
            refreshKey: 0,
            icaHelper: false,
            rulesUrl: [
                (value) => (value === '' || /^((https):\/\/)[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*(\.ics))$/i.test(value)) || '',
            ],
            rulesUsername: [
                (value) => (value === '' || /^[a-z]\d{5}[a-z]{2}$/i.test(value.toLowerCase())) || '',
            ],
            rulesPassword: [
                (value) => (value === '' || value.length > 3) || '',
            ],
            rulesEmail: [
                (value) => (value === '' || /^[a-z]+\.[a-z]+(((\.)?[a-z]+)*)(-(\d+))?@([a-z]|\d)+((\.)?([a-z]|\d)+)*$/i.test(value.toLowerCase())) || '',
            ],
        };
    },
    methods: {
        /**
         * Focus on the first input
         */
        focusFirst() {
            this.$refs.calendarSub.focus();
        },
        /**
         * Focus on the username input
         */
        focusUsername() {
            this.$refs.username.focus();
        },
        /**
         * Set input's states
         */
        setState(info) {
            if (!info.allowAccount) {
                this.allowAccount = false;
                this.hintUsername = this.$t('not_allow_account');
                this.hintPassword = this.$t('not_allow_account');
                this.hintEmail = this.$t('not_allow_email');

                this.username = '';
                this.password = '';
                this.email = '';
            } else if (!info.allowEmail) {
                this.allowEmail = false;
                this.hintEmail = this.$t('not_allow_email');

                this.email = '';
            }
            // if (!info.allowAccount || !info.allowSync) {
            //     this.allowSync = false;
            // }
        },
        submit() {
            this.$emit('submit');
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        valid() {
            this.$emit('valid', this.valid);
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
        valid() {
            // Check if the form is valid
            for (const rule of this.rulesUrl) {
                if (this.calendarURL === '' || !rule(this.calendarURL)) {
                    return false;
                }
            }
            if (this.allowAccount && (this.username || this.password || this.email)) {
                for (const rule of this.rulesUsername) {
                    if (this.username === '' || !rule(this.username)) {
                        return false;
                    }
                }
                for (const rule of this.rulesPassword) {
                    if (this.password === '' || !rule(this.password)) {
                        return false;
                    }
                }
                for (const rule of this.rulesEmail) {
                    if (this.email === '' || !rule(this.email)) {
                        return false;
                    }
                }
            }
            return true;
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        const account = JSON.parse(localStorage.getItem('account') || `{
            "calendar": "",
            "email": "",
            "password": "",
            "username": ""
        }`);

        this.calendarURL = account.calendar === '' ? '' : `https://scientia-eu-v3-3-0-api-d3-02.azurewebsites.net/api/ical/${account.calendar}/timetable.ics`;
        this.username = account.username;
        this.password = account.password;
        this.email = account.email.replace(/\.manchester\.ac\.uk$/, '');

        this.refreshKey = new Date().valueOf();
    },
};
</script>

<style lang="less" scoped>
// .inline-icon {
//     vertical-align: baseline!important;
//     margin-left: 5px;
//     font-size: 22px!important;
// }
.help-icon {
    vertical-align: text-top!important;
}
.clickable {
    user-select: none;
    display: inline-block;
    cursor: pointer;
}
</style>

<i18n>
{
    "en": {
        "calendar_subscription": "Calendar Subscription",
        "uom_username": "UoM Username",
        "uom_email": "UoM Email",
        "uom_password": "UoM Account Password",
        "allow_save": "Use this backend to sync settings",
        "will_store_on": "Enabling this option means your UoM account information will be stored on this backend",
        "not_allow_account": "This backend doesn't allow you to store UoM account",
        "not_allow_email": "This backend doesn't allow you to sync email",
        "not_allow_sync": "This backend doesn't allow you to sync settings",
        "where_ica": "Where can I get my calendar subscription?",
        "where_ica_body": "Go to <a href=\"https://timetables.manchester.ac.uk/\" target=\"_blank\" rel=\"noreferrer noopener\">this page</a> and click the \"Subscribe\" button in the top right corner of the page after logging in, then click \"More\" and \"Copy\" and paste the URL here.",
        "ok": "OK"
    },
    "zh": {
        "calendar_subscription": "日历订阅",
        "uom_username": "曼大用户名",
        "uom_email": "曼大邮箱",
        "uom_password": "曼大账户密码",
        "allow_save": "使用这个后端同步设置",
        "will_store_on": "启用这个选项意味着此后端将会保存你的曼大账户信息",
        "not_allow_account": "这个后端不允许使用曼大账户",
        "not_allow_email": "这个后端不允许使用邮箱",
        "not_allow_sync": "这个后端不允许同步设置",
        "where_ica": "我能在哪里获得我的日历订阅？",
        "where_ica_body": "前往<a href=\"https://timetables.manchester.ac.uk/\" target=\"_blank\" rel=\"noreferrer noopener\">此页面</a>，并在登录后点击页面右上角 \"Subscribe\" 按钮，然后依次点击 \"More\", \"Copy\"，并在此粘贴得到的 URL。",
        "ok": "好"
    },
    "es": {
        "calendar_subscription": "Subscripción de Calendario",
        "uom_username": "UoM nombre de usuario",
        "uom_email": "UoM correo",
        "uom_password": "UoM contraseña de cuenta",
        "allow_save": "Usar este servidor back-end para sincronizar ajustes",
        "will_store_on": "Habilitado permitirá el servidor back-end guardar la información de su cuenta UoM",
        "not_allow_account": "Este servidor back-end no permite guardar la cuenta UoM",
        "not_allow_email": "Este servidor back-end no permite la sincronización del correo",
        "not_allow_sync": "Este servidor back-end no permite la sincronización de ajustes",
        "where_ica": "Dónde puedo obtener mi subscripción del calendario",
        "where_ica_body": "Vaya a <a href=\"https://timetables.manchester.ac.uk/\" target=\"_blank\" rel=\"noreferrer noopener\">esta página</a>, y tras iniciar sesión haga clic en el botón de \"Subscribe\" en la parte de arriba derecha，más tarde a \"More\", \"Copy\", respectivamente, y copie el URL obtenido.",
        "ok": "OK"
    },
    "ja": {
        "calendar_subscription": "カレンダーの購読",
        "uom_username": "大学ユーザー名",
        "uom_email": "大学メールアドレス",
        "uom_password": "大学パスワード",
        "allow_save": "このバックエンドの同期設定を使う",
        "will_store_on": "このオプションを有効にすると、バックエンドはあなたの大学アカウント情報を保存することをご注意ください。",
        "not_allow_account": "このバックエンドはマンチェスター大学アカウントの使用が対応されない。",
        "not_allow_email": "このバックエンドはメールアドレスの使用が対応されない。",
        "not_allow_sync": "このバックエンドは同期設定が対応されない。",
        "where_ica": "どこに私のカレンダーの登録を見つかる？",
        "where_ica_body": "このページ<a href=\"https://timetables.manchester.ac.uk/\" target=\"_blank\" rel=\"noreferrer noopener\">をアクセスして</a>，ログインしてたら右上の「Subscribe」ボタンをクリックして、そして「More」,「Copy」の順にクリックして、ここに先で取得したURLをペーストしてください。",
        "ok": "はい"
    }
}
</i18n>

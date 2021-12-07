<template>
    <v-list flat three-line class="a11y-list">
        <v-list-item-group v-model="settings" multiple>
            <v-list-item class="pa-0" :ripple="false">
                <template v-slot:default="{ active }">
                    <v-list-item-content class="a11y-list-item">
                        <v-list-item-title class="mt-1 d-flex align-center"><v-chip class="mr-2" small outlined color="primary">BETA</v-chip>{{ $t('color_blind_assistance') }}</v-list-item-title>
                        <v-list-item-subtitle class="mt-1">{{ $t('color_blind_assistance_text') }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-switch :input-value="active"></v-switch>
                    </v-list-item-action>
                </template>
            </v-list-item>
        </v-list-item-group>
    </v-list>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'a11y',
    data() {
        return {
            settings: [],
        };
    },
    methods: {
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        settings() {
            const data = JSON.parse(localStorage.getItem('misc_settings')) || {};
            data.colorBlind = this.settings.includes(0);
            localStorage.setItem('misc_settings', JSON.stringify(data));
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        if ((JSON.parse(localStorage.getItem('misc_settings')) || {}).colorBlind) {
            this.settings.push(0);
        }
    },
};
</script>

<style lang="less" scoped>
.a11y-list {
    background-color: transparent!important;
    .a11y-list-item /deep/ .v-list-item__subtitle {
        -webkit-line-clamp: initial!important;
        display: block!important;
    }
}
</style>

<i18n>
{
    "en": {
        "color_blind_assistance": "Colour Assistance",
        "color_blind_assistance_text": "Activating Colour Assistance makes users who have difficulty distinguishing the red/green spectrum to recognise colours easier."
    },
    "zh": {
        "color_blind_assistance": "色彩辅助",
        "color_blind_assistance_text": "激活色彩辅助可使难以辨别红/绿色谱的用户更轻松地辨认颜色。"
    },
    "es": {
        "color_blind_assistance": "Color Asistencia",
        "color_blind_assistance_text": "Activando Color Asistencia ayuda a usuarios quien tengan dificultades en distinguir rojo/verde del espectro a reconocer colores más facilmente."
    },
    "ja": {
        "color_blind_assistance": "",
        "color_blind_assistance_text": ""
    }
}
</i18n>

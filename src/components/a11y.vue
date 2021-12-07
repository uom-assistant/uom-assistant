<template>
    <v-list flat three-line class="a11y-list">
        <v-list-item-group v-model="settings" multiple>
            <v-list-item class="pa-0" :ripple="false">
                <template v-slot:default="{ active }">
                    <v-list-item-content class="a11y-list-item">
                        <v-list-item-title class="mt-1 d-flex align-center a11y-title"><v-chip class="mr-2" small outlined color="primary">BETA</v-chip>{{ $t('color_blind_assistance') }}</v-list-item-title>
                        <v-list-item-subtitle class="mt-1">{{ $t('color_blind_assistance_text') }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-switch :input-value="active"></v-switch>
                    </v-list-item-action>
                </template>
            </v-list-item>
            <v-list-item class="pa-0" :ripple="false">
                <template v-slot:default="{ active }">
                    <v-list-item-content class="a11y-list-item">
                        <v-list-item-title class="mt-1 d-flex align-center a11y-title"><v-chip class="mr-2" small outlined color="primary">BETA</v-chip>{{ $t('change_live_announcement') }}</v-list-item-title>
                        <v-list-item-subtitle class="mt-1">{{ $t('change_live_announcement_text') }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-switch :input-value="active"></v-switch>
                    </v-list-item-action>
                </template>
            </v-list-item>
            <v-list-item class="pa-0" :ripple="false">
                <template v-slot:default="{ active }">
                    <v-list-item-content class="a11y-list-item">
                        <v-list-item-title class="mt-1 d-flex align-center a11y-title">{{ $t('reduce_motion') }}</v-list-item-title>
                        <v-list-item-subtitle class="mt-1">{{ $t('reduce_motion_text') }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                        <v-switch :input-value="active"></v-switch>
                    </v-list-item-action>
                </template>
            </v-list-item>
            <v-list-item class="pa-0" :ripple="false">
                <template v-slot:default="{ active }">
                    <v-list-item-content class="a11y-list-item">
                        <v-list-item-title class="mt-1 d-flex align-center a11y-title">{{ $t('dyslexic_type') }}</v-list-item-title>
                        <v-list-item-subtitle class="mt-1">{{ $t('dyslexic_type_text') }}</v-list-item-subtitle>
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
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        settings() {
            // Save shanges
            const data = JSON.parse(localStorage.getItem('misc_settings')) || {};
            data.colorBlind = this.settings.includes(0);
            data.announcement = this.settings.includes(1);
            data.reduceMotion = this.settings.includes(2);
            data.easyRead = this.settings.includes(3);
            localStorage.setItem('misc_settings', JSON.stringify(data));

            // Apply changes
            if (data.reduceMotion) {
                document.documentElement.classList.add('reduce-motion');
            } else {
                document.documentElement.classList.remove('reduce-motion');
            }

            if (data.easyRead) {
                document.documentElement.classList.add('easy-read');
            } else {
                document.documentElement.classList.remove('easy-read');
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

        // Load settings
        const settings = JSON.parse(localStorage.getItem('misc_settings')) || {};
        if (settings.colorBlind) {
            this.settings.push(0);
        }
        if (settings.announcement) {
            this.settings.push(1);
        }
        if (settings.reduceMotion) {
            this.settings.push(2);
        }
        if (settings.easyRead) {
            this.settings.push(3);
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
    .a11y-title {
        height: 25px;
    }
    & /deep/ .v-list-item {
        min-height: 0;
    }
}
</style>

<i18n>
{
    "en": {
        "color_blind_assistance": "Colour assistance",
        "color_blind_assistance_text": "Activating colour assistance makes users who have difficulty distinguishing the red/green spectrum to recognise colours easier.",
        "change_live_announcement": "Live announcement for changes",
        "change_live_announcement_text": "Announce content changes to screen reader users when pages updated.",
        "reduce_motion": "Reduce motion",
        "reduce_motion_text": "Diminishe some animation effects to reduce possible discomfort.",
        "dyslexic_type": "Easy-to-read font",
        "dyslexic_type_text": "Try using OpenDyslexic font to alleviate dyslexia."
    },
    "zh": {
        "color_blind_assistance": "色彩辅助",
        "color_blind_assistance_text": "激活色彩辅助可使难以辨别红/绿色谱的用户更轻松地辨认颜色。",
        "change_live_announcement": "页面更新实时宣告",
        "change_live_announcement_text": "在页面内容变化时向屏幕阅读器用户宣告内容变化。",
        "reduce_motion": "减弱动画",
        "reduce_motion_text": "减弱部分动画效果以减轻可能的不适感。",
        "dyslexic_type": "易读字体",
        "dyslexic_type_text": "尝试使用 OpenDyslexic 字体缓解阅读障碍。"
    },
    "es": {
        "color_blind_assistance": "",
        "color_blind_assistance_text": ""
    },
    "ja": {
        "color_blind_assistance": "",
        "color_blind_assistance_text": ""
    }
}
</i18n>

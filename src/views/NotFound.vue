<template>
    <div class="not-found">
        <div class="not-found-text">
            <h1>4<v-icon>mdi-cancel</v-icon>4</h1>
        </div>
        <div class="not-found-text">
            <div>
                <h2>{{ $t('oops') }}</h2>
                <p>{{ $t('not_found') }}<br>
                <v-btn
                    depressed
                    replace
                    color="primary"
                    to="/"
                    class="home-btn"
                    :large="$vuetify.breakpoint.smAndUp && !$vuetify.breakpoint.mdAndUp"
                    :x-large="$vuetify.breakpoint.mdAndUp"
                >
                    <v-icon
                        dark
                        class="mr-2"
                    >
                        mdi-view-dashboard
                    </v-icon>
                    {{ $t('dashboard')}}
                </v-btn></p>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'NotFound',
    watch: {
        locale() {
            // Responding to language changes and update time format
            this.$i18n.locale = this.locale;
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
    },
    mounted() {
        // Initialize language
        this.$i18n.locale = localStorage.getItem('language') || 'en';
    },
};
</script>

<style lang="less" scoped>
.not-found {
    min-height: calc(100vh - 56px);
    background-color: #F5F5F5;
    display: flex;
    justify-content: center;
    align-items: center;
    h1 {
        font-size: 60vw;
        line-height: 1;
        white-space: nowrap;
        opacity: .1;
        font-weight: 400;
        user-select: none;
        i {
            font-size: 50vw;
            color: #202020;
            margin-top: -11vw;
        }
    }
    .not-found-text {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: .9;
        h2 {
            font-size: ~"clamp(50px, 6vw, 120px)";
            text-align: center;
        }
        p {
            font-size: ~"clamp(25px, 2vw, 45px)";
            text-align: center;
            .home-btn {
                margin-top: ~"clamp(15px, 1.5vw, 35px)";
                border-radius: 6px;
            }
        }
    }
}
.theme--dark .not-found {
    background-color: #272727;
    h1 i {
        color: white;
    }
}
@media (min-width: 960px) {
    .not-found {
        min-height: calc(100vh - 64px);
    }
}
</style>

<i18n>
{
    "en": {
        "oops": "Oooops!",
        "not_found": "Page Not Found",
        "dashboard": "Dashboard"
    },
    "zh": {
        "oops": "妈耶…",
        "not_found": "找不到页面",
        "dashboard": "仪表板"
    },
    "es": {
        "oops": "Uhhhhh!",
        "not_found": "Página No Encontrada",
        "dashboard": "Tablero"
    },
    "ja": {
        "oops": "ヤバい！",
        "not_found": "ページが見つかりません",
        "dashboard": "ダッシュボード"
    }
}
</i18n>

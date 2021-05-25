<template>
    <v-card
        class="mx-auto rounded-lg plugin-container"
        :class="expanded ? 'expanded' : ''"
        outlined
    >
        <v-progress-circular
            indeterminate
            color="grey"
            :width="2"
            :size="18"
            class="loading"
            v-show="loading"
        ></v-progress-circular>
        <div class="plugin-outer">
            <h2 class="handle">
                {{ $t('plugins') }}
                <v-btn icon small @click.stop="toggleExpanded" class="float-right mr-4" :title="expanded ? $t('collapse') : $t('expand')">
                    <v-icon>{{ expanded ? 'mdi-unfold-less-vertical' : 'mdi-unfold-more-vertical' }}</v-icon>
                </v-btn>
            </h2>
        </div>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'plugins',
    props: {
        searchid: Number,
    },
    data() {
        return {
            loading: false,
            expanded: true,
            timer: null,
        };
    },
    methods: {
        /**
         * Toggle widget width
         */
        toggleExpanded() {
            this.expanded = !this.expanded;
            this.$emit('toggle-expanded', this.expanded);
            localStorage.setItem('plugin_expanded', this.expanded);
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
            packery: (state) => state.packery,
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Initialize widget width
        this.expanded = (localStorage.getItem('plugin_expanded') || 'true') === 'true';

        // Sync with backend every 30 minutes
        this.timer = setInterval(() => {
        }, 1800000);
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
};
</script>

<style lang="less">
.plugin-container {
    position: relative;
    padding-left: 0;
    padding-right: 0;
    overflow: hidden;
    .loading {
        position: absolute;
        top: 10px;
        right: 10px;
    }
    h2 {
        font-size: 18px;
        font-weight: normal;
        opacity: .87;
        margin-top: 18px;
        margin-left: 20px;
    }
    .list {
        padding-top: 0;
        .v-list-item__action {
            margin: 7.5px 16px 7.5px 0;
        }
        .v-list-item {
            background-color: transparent;
            transition: background-color .2s;
            &:hover, &:focus {
                background-color: rgba(0, 0, 0, .04);
            }
        }
    }
    .plugin-outer {
        width: 100%;
        min-height: 450px;
    }
}
#app.theme--dark .plugin-container {
    .v-list-item {
        &:hover, &:focus {
            background-color: rgba(255, 255, 255, .04);
        }
    }
}
</style>

<i18n>
{
    "en": {
        "plugins": "Plug-ins",
        "expand": "Expand",
        "collapse": "Collapse"
    },
    "zh": {
        "plugins": "插件",
        "expand": "展开",
        "collapse": "收缩"
    }
}
</i18n>

<template>
    <div class="chart-container" :class="{ 'dark-mode': $vuetify.theme.dark }">
        <v-sparkline
            :value="listValue"
            :smooth="8"
            :padding="4"
            :line-width="width"
            :height="Math.max((100 - (Math.min(...value) / 100) * 100 - ((100 - Math.max(...value)) / 100) * 100), 5)"
            :style="{ top: `max(calc(${((100 - Math.max(...value)) / 100) * 100}% - ${Math.abs(Math.min((100 - (Math.min(...value) / 100) * 100 - ((100 - Math.max(...value)) / 100) * 100) - 5, 0))}px), 0px)` }"
            width="315"
            stroke-linecap="round"
            class="chart chart-1"
            v-if="listValue.length > 0"
        ></v-sparkline>
        <v-sparkline
            :value="listValue"
            :smooth="8"
            :padding="4"
            :line-width="width"
            :height="Math.max((100 - (Math.min(...value) / 100) * 100 - ((100 - Math.max(...value)) / 100) * 100), 5)"
            :style="{ top: `max(calc(${((100 - Math.max(...value)) / 100) * 100}% - ${Math.abs(Math.min((100 - (Math.min(...value) / 100) * 100 - ((100 - Math.max(...value)) / 100) * 100) - 5, 0))}px), 0px)` }"
            width="315"
            fill
            class="chart chart-2"
            v-if="listValue.length > 0"
        ></v-sparkline>
        <div class="base" :style="{ paddingTop: `min(${(Math.min(...value) / 100) * (1 / 3) * 100}%, ${(1 / 3) * 100 - 2}%)` }"></div>
        <div class="mask"></div>
        <div class="empty text--disabled text-body-2" v-if="listValue.length === 0 && empty">{{ empty }}</div>
    </div>
</template>

<script>
export default {
    name: 'chart',
    props: {
        value: Array,
        width: Number,
        empty: String,
    },
    computed: {
        listValue() {
            return this.value.length === 1 ? [this.value[0], this.value[0]] : this.value;
        },
    },
};
</script>

<style lang="less" scoped>
.chart-container {
    overflow: hidden;
    padding-top: 32%;
    position: relative;
    contain: strict;
    .chart {
        position: absolute;
        top: 0;
        left: -2.5%;
        width: 105%;
        &.chart-1 {
            z-index: 4;
        }
        &.chart-2 {
            z-index: 1;
            opacity: .2;
        }
    }
    .base {
        position: absolute;
        z-index: 2;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #E0CCEB;
    }
    .mask {
        position: absolute;
        z-index: 3;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
    }
    .empty {
        position: absolute;
        z-index: 4;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &.dark-mode {
        .base {
            background-color: #423745;
        }
        .mask {
            background-image: linear-gradient(to bottom, rgba(30, 30, 30, 0) 0%, rgba(30, 30, 30, 1) 100%);
        }
    }
}
</style>

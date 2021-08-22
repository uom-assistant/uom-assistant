<template>
    <v-card
        class="mx-auto gray-container pl-0 pr-0 mb-2"
        outlined
    >
        <div class="clock-outer">
            <div class="label text-truncate">{{ city }}{{ $t('time') }}</div>
            <div class="time-number">
                <span class="daylight-label mr-3">
                    <v-icon v-if="otherHour <= 5 || otherHour >= 19">mdi-weather-night</v-icon>
                    <v-icon v-else>mdi-white-balance-sunny</v-icon>
                </span>
                <span class="hour">{{ otherHour }}</span>:{{ otherMin }}:{{ sec }}
            </div>
        </div>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'clockSearch',
    props: {
        city: String,
        timezone: String,
    },
    data() {
        return {
            min: '00',
            sec: '00',
            otherObj: this.convertTimeZone(new Date(), this.timezone ? this.timezone : 'Europe/London'),
            timer: null,
        };
    },
    methods: {
        /**
         * Convert a Date object to a specified time zone
         * @param {Date} date Date object
         * @param {string} tzString timezone name
         * @returns {Date} a new Date object that has converted to the specified time zone
         */
        convertTimeZone(date, tzString) {
            return new Date((typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', { timeZone: tzString }));
        },
        /**
         * Update time
         */
        updateTime() {
            const now = new Date(new Date().valueOf());
            this.otherObj = this.convertTimeZone(now, this.timezone);
            this.sec = `${now.getSeconds()}`.padStart(2, '0');
            this.min = `${now.getMinutes()}`.padStart(2, '0');
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        timezone() {
            this.updateTime();
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
        otherMin() {
            return `${this.otherObj.getMinutes()}`.padStart(2, '0');
        },
        otherHour() {
            return `${this.otherObj.getHours()}`.padStart(2, '0');
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Update time every 1 second
        this.timer = setInterval(() => {
            this.updateTime();
        }, 1000);

        this.updateTime();
    },
    beforeDestroy() {
        clearInterval(this.timer);
    },
};
</script>

<style lang="less" scoped>
p {
  color: #000000;
  font-size: 0.8em;
  opacity: 0.75;
}
.clock-outer {
    display: flex;
    padding: 0 20px;
    font-size: 35px;
    line-height: 35px;
    flex-direction: row;
    align-items: center;
    height: 100px;
    justify-content: space-between;
    .time-number {
        user-select: none;
        display: flex;
        flex-direction: row;
        .hour {
            color: #660099;
        }
        .daylight-label {
            opacity: .5;
            font-size: 15px;
            display: inline-block;
        }
    }
    .label {
        font-size: 20px;
        text-align: center;
    }
}
.gray-container {
    position: relative;
    overflow: hidden;
    border-radius: 6px;
    contain: layout paint;
}
#app.theme--dark .gray-container {
    background-color: #272727;
}
#app.theme--dark .clock-outer {
    .hour {
        color: #D099E0;
    }
}
</style>

<i18n>
{
    "en": {
        "time": " time"
    },
    "zh": {
        "time": "时间"
    },
    "es": {
        "time": " hora"
    },
    "ja": {
        "time": "時間"
    }
}
</i18n>

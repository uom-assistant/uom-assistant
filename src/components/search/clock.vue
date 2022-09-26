<template>
    <v-card
        class="mx-auto gray-container pl-0 pr-0 mb-2"
        outlined
    >
        <div class="clock-outer">
            <div class="label text-truncate">{{ city }}{{ $t('time') }}</div>
            <div class="time-number">
                <span class="daylight-label mr-3">
                    <v-icon v-if="remoteNight">mdi-weather-night</v-icon>
                    <v-icon v-else>mdi-white-balance-sunny</v-icon>
                </span>
                <span class="hour" ref="hourRemote"></span>:<span ref="minRemote"></span>:<span ref="secRemote"></span>
            </div>
        </div>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';

// Time zone conversion is expensive, so we cache and update the time difference every 15 minutes
let remoteDiff = 0;

let hourRemote = '';
let minRemote = '';
let sec = '';

let timezoneConverter = null;

export default {
    name: 'clockSearch',
    props: {
        city: String,
        timezone: String,
    },
    data() {
        return {
            timer: null,
            remoteNight: false,
        };
    },
    methods: {
        /**
         * Convert a Date object to a specified time zone
         * @param {Date} date Date object
         * @returns {Date} a new Date object that has converted to the specified time zone
         */
        convertTimeZone(date) {
            return new Date(timezoneConverter.format(date));
        },
        /**
         * Update time difference between remote and local
         * @param {Date} now date object needs to be calculated
         */
        updateRemoteDiff(now) {
            const secNow = now - now.getMilliseconds();
            remoteDiff = this.convertTimeZone(new Date(secNow)) - secNow;
        },
        /**
         * Update time
         */
        updateTime(init = false) {
            if (!this.$refs.secRemote) {
                return;
            }
            const now = new Date(new Date().valueOf());

            const secOld = sec;

            sec = `${now.getSeconds()}`.padStart(2, '0');

            if (secOld !== sec || init) {
                this.$refs.secRemote.textContent = sec;

                const minLocal = now.getMinutes();

                // Update time difference
                if ((minLocal === 0 || minLocal === 15 || minLocal === 30 || minLocal === 45) && sec === '00') {
                    this.updateRemoteDiff(now);
                }
            }

            const remoteNow = new Date(now.valueOf() + remoteDiff);
            const minRemoteOld = minRemote;
            const hourRemoteOld = hourRemote;

            minRemote = `${remoteNow.getMinutes()}`.padStart(2, '0');
            hourRemote = `${remoteNow.getHours()}`.padStart(2, '0');

            if (secOld !== sec || init) {
                this.$refs.secRemote.textContent = sec;
            }
            if (minRemoteOld !== minRemote || sec === '00' || init) {
                this.$refs.minRemote.textContent = minRemote;
            }
            if (hourRemoteOld !== hourRemote || (sec === '00' && minRemote === '00') || init) {
                this.$refs.hourRemote.textContent = hourRemote;
                if (hourRemote <= 5 || hourRemote >= 19) {
                    this.remoteNight = true;
                } else {
                    this.remoteNight = false;
                }
            }
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
        },
        timezone() {
            timezoneConverter = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: this.timezone,
            });

            this.updateRemoteDiff(new Date());
            this.updateTime();
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        timezoneConverter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: this.timezone,
        });

        this.updateRemoteDiff(new Date());

        this.updateTime(true);

        // Update time every 1 second
        setTimeout(() => {
            this.updateTime();
            this.timer = setInterval(this.updateTime, 1000);
        }, 1000 - new Date().getMilliseconds());
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
.easy-read .clock-outer {
    font-size: 28px;
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

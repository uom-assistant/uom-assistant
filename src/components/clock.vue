<template>
    <v-card
        class="mx-auto rounded-lg gray-container pl-0 pr-0"
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
        <v-btn
            icon
            small
            class="settings-icon"
            @click.stop="settings = !settings"
            :class="{ shown: settings }"
            :title="$t('timezone_setting')"
        >
            <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
        <v-btn
            icon
            small
            class="adjust-icon"
            @click.stop="adjust = !adjust"
            :class="{ shown: adjust }"
            :title="$t('time_travel')"
        >
            <v-icon>mdi-swap-horizontal</v-icon>
        </v-btn>
        <div class="settings-bg" :class="{ opened: settings }"></div>
        <div class="settings-flex" :class="{ shown: settings }">
            <v-autocomplete
                prepend-inner-icon="mdi-clock-outline"
                class="timezone-input"
                v-model="timeZone"
                outlined
                item-value="code"
                item-text="code"
                ref="timeZoneInput"
                @blur="checkInput"
                :items="timeZoneList"
                :label="$t('timezone')"
                :no-data-text="$t('no_timezone')"
                :key="`${locale}-${inputRefreshKey}`"
                :menu-props="{
                    closeOnClick: false,
                    closeOnContentClick: false,
                    disableKeys: true,
                    openOnClick: false,
                    maxHeight: 304,
                    offsetY: true,
                    offsetOverflow: true,
                    transition: 'slide-y-transition'
                }"
            >
                <template v-slot:item="data">
                    <v-list-item-content>
                        <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ data.item.code }}</v-list-item-subtitle>
                    </v-list-item-content>
                </template>
            </v-autocomplete>
        </div>
        <v-slider
            v-model="base"
            :thumb-size="24"
            :max="24"
            :min="-24"
            thumb-label
            hide-details
            class="slider"
            :class="{ opened: adjust }"
            @end="base = 0"
        ></v-slider>
        <div class="clock-outer handle">
            <div class="time-label label-left" :class="$vuetify.breakpoint.xs ? 'small-screen' : ''">
                <span class="daylight-label">
                    <v-icon v-if="localNight">mdi-weather-night</v-icon>
                    <v-icon v-else>mdi-white-balance-sunny</v-icon>
                </span><br>
                <span class="hour" ref="hourLocal"></span>:<span ref="minLocal"></span>:<span ref="secLocal"></span><br>
                <span class="label text-truncate d-inline-block">{{ $t('local_time') }}</span>
            </div>
            <div class="time-label label-right" :class="$vuetify.breakpoint.xs ? 'small-screen' : ''">
                <span class="daylight-label">
                    <v-icon v-if="remoteNight">mdi-weather-night</v-icon>
                    <v-icon v-else>mdi-white-balance-sunny</v-icon>
                </span><br>
                <span class="hour" ref="hourRemote"></span>:<span ref="minRemote"></span>:<span ref="secRemote"></span><br>
                <span class="label text-truncate d-inline-block">{{ $t('uk_time', [$t(getCity)]) }}</span>
            </div>
        </div>
    </v-card>
</template>

<script>
import { mapState } from 'vuex';
import * as tzList from '@/tools/tzList.json';

// Time zone conversion is expensive, so we cache and update the time difference every 15 minutes
let remoteDiff = 0;

let hourLocal = '';
let minLocal = '';
let hourRemote = '';
let minRemote = '';

let sec = '';

let timezoneConverter = null;

export default {
    name: 'clock',
    props: {
        searchid: Number,
    },
    data() {
        return {
            loading: false,
            settings: false,
            timeZone: '',
            timeZoneList: [],
            base: 0,
            adjust: false,
            timer: null,
            idelTimer: null,
            localNight: false,
            remoteNight: false,
            inputRefreshKey: 0,
        };
    },
    methods: {
        /**
         * Update timezone list
         */
        updateList() {
            const timezoneList = [];
            const searchIndex = [];
            for (const item of tzList.default) {
                timezoneList.push({
                    name: this.locale === 'en' || this.locale === 'es' ? `${this.$t(item.mainCity)}, ${window.displayFormatters.region.of(item.countryCode)}` : `${window.displayFormatters.region.of(item.countryCode)} ${this.$t(item.mainCity)}`,
                    code: item.name,
                    display: item.mainCity,
                });
                searchIndex.push({
                    code: item.name,
                    display: this.$t(item.mainCity),
                    mainCity: item.mainCity === this.$t(item.mainCity) ? item.mainCity : [item.mainCity, this.$t(item.mainCity)],
                });
            }
            this.timeZoneList = timezoneList;

            // Commit search index
            this.$store.commit('setSearchIndex', {
                id: this.searchid,
                payload: {
                    name: 'clock',
                    key: 'code',
                    indexes: ['mainCity', 'code'],
                    data: searchIndex,
                },
            });
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
         * Update clock UI
         * @param {boolean} init whether it's for init the view
         */
        updateView(init = false) {
            if (!this.$refs.secRemote) {
                return;
            }
            const now = new Date(new Date().valueOf() + this.base * 3600000);

            const secOld = sec;
            const minLocalOld = minLocal;
            const hourLocalOld = hourLocal;
            const minRemoteOld = minRemote;
            const hourRemoteOld = hourRemote;

            sec = `${now.getSeconds()}`.padStart(2, '0');
            minLocal = `${now.getMinutes()}`.padStart(2, '0');
            hourLocal = `${now.getHours()}`.padStart(2, '0');

            if (secOld !== sec || init) {
                this.$refs.secLocal.textContent = sec;
                this.$refs.secRemote.textContent = sec;

                // Update time difference
                if ((minLocal === '00' || minLocal === '15' || minLocal === '30' || minLocal === '45') && sec === '00') {
                    this.updateRemoteDiff(now);
                }
            }

            const remoteNow = new Date(now.valueOf() + remoteDiff);

            minRemote = `${remoteNow.getMinutes()}`.padStart(2, '0');
            hourRemote = `${remoteNow.getHours()}`.padStart(2, '0');

            if (minLocalOld !== minLocal || sec === '00' || init) {
                this.$refs.minLocal.textContent = minLocal;
                if (!init) {
                    this.$store.commit('setTimerMin', minLocal);
                    if (minLocal === '00') {
                        this.$store.commit('setTimerHour', `${hourLocal}${new Date().valueOf()}`);
                    }
                }
            }
            if (minRemoteOld !== minRemote || init) {
                this.$refs.minRemote.textContent = minRemote;
            }
            if (hourLocalOld !== hourLocal || init) {
                this.$refs.hourLocal.textContent = hourLocal;
                if (hourLocal <= 5 || hourLocal >= 19) {
                    this.localNight = true;
                } else {
                    this.localNight = false;
                }
            }
            if (hourRemoteOld !== hourRemote || init) {
                this.$refs.hourRemote.textContent = hourRemote;
                if (hourRemote <= 5 || hourRemote >= 19) {
                    this.remoteNight = true;
                } else {
                    this.remoteNight = false;
                }
            }
        },
        /**
         * Check if the value is null when blur from the input
         */
        checkInput() {
            if (this.$refs.timeZoneInput.lazyValue === null) {
                this.inputRefreshKey = new Date().valueOf();
            }
        },
        /**
         * Store timezone settings
         */
        store() {
            localStorage.setItem('timezone', this.timeZone);
        },
        /**
         * Convert a Date object to a specified time zone
         * @param {Date} date Date object
         * @returns {Date} a new Date object that has converted to the specified time zone
         */
        convertTimeZone(date) {
            return new Date(timezoneConverter.format(date));
        },
    },
    watch: {
        locale() {
            this.$i18n.locale = this.locale;
            this.updateList();
        },
        timeZone() {
            // Store timezone settings when timezone changed
            if (!this.timeZone) {
                this.timeZone = localStorage.getItem('timezone') || 'Europe/London';
            } else {
                this.store();
            }
            timezoneConverter = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: this.timeZone,
            });
            this.updateRemoteDiff(new Date(new Date().valueOf() + this.base * 3600000));
        },
        base() {
            // Re-calculate date time when time travel base time changed
            const now = new Date(new Date().valueOf() + this.base * 3600000);
            this.updateRemoteDiff(now);
            const remoteNow = new Date(now.valueOf() + remoteDiff);

            const hourLocalOld = hourLocal;
            const hourRemoteOld = hourRemote;

            hourLocal = `${now.getHours()}`.padStart(2, '0');
            hourRemote = `${remoteNow.getHours()}`.padStart(2, '0');

            if (hourLocalOld !== hourLocal) {
                this.$refs.hourLocal.textContent = hourLocal;
                if (hourLocal <= 5 || hourLocal >= 19) {
                    this.localNight = true;
                } else {
                    this.localNight = false;
                }
            }
            if (hourRemoteOld !== hourRemote) {
                this.$refs.hourRemote.textContent = hourRemote;
                if (hourRemote <= 5 || hourRemote >= 19) {
                    this.remoteNight = true;
                } else {
                    this.remoteNight = false;
                }
            }
        },
    },
    computed: {
        ...mapState({
            locale: (state) => state.locale,
        }),
        /**
         * Get mian city of a timezone
         * @returns {string} city name in English
         */
        getCity() {
            for (const item of this.timeZoneList) {
                if (item.code === this.timeZone) {
                    return item.display;
                }
            }
            return 'London';
        },
    },
    mounted() {
        this.$i18n.locale = localStorage.getItem('language') || 'en';

        // Restore timezone
        this.timeZone = localStorage.getItem('timezone') || 'Europe/London';
        localStorage.setItem('timezone', this.timeZone);

        // Bulid timezone list
        for (const item of tzList.default) {
            this.timeZoneList.push({
                name: this.locale === 'en' ? `${this.$t(item.mainCity)}, ${window.displayFormatters.region.of(item.countryCode)}` : `${window.displayFormatters.region.of(item.countryCode)} ${this.$t(item.mainCity)}`,
                code: item.name,
                display: item.mainCity,
            });
        }

        this.$nextTick(() => {
            this.updateRemoteDiff(new Date(new Date().valueOf() + this.base * 3600000));

            // Update time every 1 second
            this.updateView(true);
            this.timer = setInterval(this.updateView, 1000);

            // Make second accurate
            this.idelTimer = requestIdleCallback(() => {
                this.idelTimer = null;
                if (this.timer !== null) {
                    clearInterval(this.timer);
                }
                setTimeout(() => {
                    this.updateView();
                    this.timer = setInterval(this.updateView, 1000);
                }, 1000 - new Date().getMilliseconds());
            });
        });

        this.updateList();
    },
    beforeDestroy() {
        clearInterval(this.timer);
        if (this.idelTimer !== null) {
            cancelIdleCallback(this.idelTimer);
        }
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
    width: 350px;
    margin: 0 auto;
    user-select: none;
}
.gray-container {
    position: relative;
    overflow: hidden;
    contain: strict;
    .loading {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
    }
    .settings-icon, .adjust-icon {
        position: absolute;
        right: 10px;
        opacity: 0;
        transition: opacity .2s;
        &.shown {
            opacity: .5;
        }
    }
    .settings-icon {
        top: 10px;
        z-index: 5;
    }
    .adjust-icon {
        bottom: 5px;
        z-index: 1;
    }
    .settings-bg {
        position: absolute;
        top: -525px;
        right: -525px;
        z-index: 2;
        width: 1100px;
        height: 1100px;
        border-radius: 50%;
        background-color: #fafafa;
        transform-origin: center center;
        transform: scale(0);
        transition: transform .4s .1s;
        &.opened {
            transform: scale(1);
            transition: transform .4s;
        }
    }
    .settings-flex {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 3;
        opacity: 0;
        pointer-events: none;
        height: 0;
        width: 0;
        overflow: hidden;
        transition: opacity .2s, height 0s .2s, width 0s .2s;
        display: flex;
        justify-content: center;
        align-items: center;
        &.shown {
            opacity: 1;
            pointer-events: auto;
            width: 100%;
            height: 100%;
            transition: opacity .2s .3s;
        }
        .timezone-input {
            max-width: 270px;
            width: 270px;
            margin-bottom: -20px;
        }
    }
    &:hover, &:focus {
        .settings-icon, .adjust-icon {
            opacity: .5;
        }
    }
    .slider {
        position: absolute;
        bottom: -32px;
        left: 10px;
        z-index: 1;
        width: calc(100% - 50px);
        transition: bottom .2s;
        opacity: .8;
        &.opened {
            bottom: 2px;
        }
    }
}
.time-label {
    width: 175px;
    display: inline-block;
    text-align: center;
    box-sizing: border-box;
    font-size: 35px;
    line-height: 35px;
    .hour {
        color: #660099;
    }
    .label {
        opacity: .5;
        font-size: 15px;
        width: 165px;
        text-align: center;
    }
    .daylight-label {
        opacity: .5;
        font-size: 15px;
        margin-bottom: 12px;
        display: inline-block;
    }
    &.label-left {
        padding: 35px 5px 40px 0;
        &.small-screen {
            padding: 35px 0 40px 15px;
            margin-right: -7.5px;
        }
    }
    &.label-right {
        padding: 35px 0 40px 5px;
        &.small-screen {
            padding: 35px 0 40px 0;
        }
    }
}
.easy-read .time-label {
    font-size: 28px;
    line-height: 35px;
}
#app.theme--dark .gray-container {
    background-color: #1E1E1E;
    .settings-bg {
        background-color: #272727;
    }
}
#app.theme--dark .time-label {
    .hour {
        color: #D099E0;
    }
}
</style>

<i18n>
{
    "en": {
        "local_time": "Local time",
        "uk_time": "{0} time",
        "timezone": "Time Zone",
        "no_timezone": "Time zone not found",
        "timezone_setting": "Time Zone",
        "time_travel": "Time Travel",
        "Alofi": "Alofi",
        "Midway": "Midway",
        "Pago Pago": "Pago Pago",
        "Avarua": "Avarua",
        "Adak": "Adak",
        "Honolulu": "Honolulu",
        "Faaa": "Faaa",
        "Marquesas": "Marquesas",
        "Anchorage": "Anchorage",
        "Gambier": "Gambier",
        "Los Angeles": "Los Angeles",
        "Tijuana": "Tijuana",
        "Vancouver": "Vancouver",
        "Adamstown": "Adamstown",
        "Hermosillo": "Hermosillo",
        "Calgary": "Calgary",
        "Ciudad Juárez": "Ciudad Juárez",
        "Denver": "Denver",
        "Phoenix": "Phoenix",
        "Whitehorse": "Whitehorse",
        "Belize City": "Belize City",
        "Chicago": "Chicago",
        "Guatemala City": "Guatemala City",
        "Managua": "Managua",
        "Mexico City": "Mexico City",
        "San José": "San José",
        "San Salvador": "San Salvador",
        "Saskatoon": "Saskatoon",
        "Tegucigalpa": "Tegucigalpa",
        "Winnipeg": "Winnipeg",
        "Easter": "Easter",
        "Galapagos": "Galapagos",
        "Rio Branco": "Rio Branco",
        "Bogotá": "Bogotá",
        "Havana": "Havana",
        "Atikokan": "Atikokan",
        "Cancún": "Cancún",
        "Cockburn Town": "Cockburn Town",
        "George Town": "George Town",
        "Kingston": "Kingston",
        "Nassau": "Nassau",
        "New York City": "New York City",
        "Panamá": "Panamá",
        "Port-au-Prince": "Port-au-Prince",
        "Toronto": "Toronto",
        "Quito": "Quito",
        "Lima": "Lima",
        "Manaus": "Manaus",
        "Basseterre": "Basseterre",
        "Brades": "Brades",
        "Bridgetown": "Bridgetown",
        "Castries": "Castries",
        "Chaguanas": "Chaguanas",
        "Fort-de-France": "Fort-de-France",
        "Gustavia": "Gustavia",
        "Halifax": "Halifax",
        "Hamilton": "Hamilton",
        "Kingstown": "Kingstown",
        "Kralendijk": "Kralendijk",
        "Les Abymes": "Les Abymes",
        "Blanc-Sablon": "Blanc-Sablon",
        "Marigot": "Marigot",
        "Oranjestad": "Oranjestad",
        "Philipsburg": "Philipsburg",
        "Road Town": "Road Town",
        "Roseau": "Roseau",
        "Saint Croix": "Saint Croix",
        "Saint George's": "Saint George's",
        "Saint John’s": "Saint John’s",
        "San Juan": "San Juan",
        "Santo Domingo": "Santo Domingo",
        "The Valley": "The Valley",
        "Thule": "Thule",
        "Willemstad": "Willemstad",
        "La Paz": "La Paz",
        "Santiago": "Santiago",
        "Georgetown": "Georgetown",
        "Asunción": "Asunción",
        "Caracas": "Caracas",
        "St. John's": "St. John's",
        "Buenos Aires": "Buenos Aires",
        "São Paulo": "São Paulo",
        "Palmer": "Palmer",
        "Punta Arenas": "Punta Arenas",
        "Stanley": "Stanley",
        "Cayenne": "Cayenne",
        "Saint-Pierre": "Saint-Pierre",
        "Paramaribo": "Paramaribo",
        "Montevideo": "Montevideo",
        "Nuuk": "Nuuk",
        "Noronha": "Noronha",
        "Grytviken": "Grytviken",
        "Ponta Delgada": "Ponta Delgada",
        "Praia": "Praia",
        "Scoresbysund": "Scoresbysund",
        "Abidjan": "Abidjan",
        "Accra": "Accra",
        "Bamako": "Bamako",
        "Bissau": "Bissau",
        "Camayenne": "Camayenne",
        "Dakar": "Dakar",
        "Danmarkshavn": "Danmarkshavn",
        "Douglas": "Douglas",
        "Dublin": "Dublin",
        "Freetown": "Freetown",
        "Jamestown": "Jamestown",
        "Lomé": "Lomé",
        "London": "London",
        "Monrovia": "Monrovia",
        "Nouakchott": "Nouakchott",
        "Ouagadougou": "Ouagadougou",
        "Reykjavík": "Reykjavík",
        "Saint Helier": "Saint Helier",
        "Saint Peter Port": "Saint Peter Port",
        "Serekunda": "Serekunda",
        "São Tomé": "São Tomé",
        "Troll": "Troll",
        "Casablanca": "Casablanca",
        "Laayoune": "Laayoune",
        "Las Palmas de Gran Canaria": "Las Palmas de Gran Canaria",
        "Lisbon": "Lisbon",
        "Tórshavn": "Tórshavn",
        "Windhoek": "Windhoek",
        "Algiers": "Algiers",
        "Amsterdam": "Amsterdam",
        "Andorra la Vella": "Andorra la Vella",
        "Belgrade": "Belgrade",
        "Berlin": "Berlin",
        "Birkirkara": "Birkirkara",
        "Bratislava": "Bratislava",
        "Brussels": "Brussels",
        "Budapest": "Budapest",
        "Copenhagen": "Copenhagen",
        "Gibraltar": "Gibraltar",
        "Ljubljana": "Ljubljana",
        "Longyearbyen": "Longyearbyen",
        "Luxembourg": "Luxembourg",
        "Madrid": "Madrid",
        "Monaco": "Monaco",
        "Oslo": "Oslo",
        "Paris": "Paris",
        "Podgorica": "Podgorica",
        "Prague": "Prague",
        "Rome": "Rome",
        "San Marino": "San Marino",
        "Sarajevo": "Sarajevo",
        "Skopje": "Skopje",
        "Stockholm": "Stockholm",
        "Tirana": "Tirana",
        "Tunis": "Tunis",
        "Vaduz": "Vaduz",
        "Vatican City": "Vatican City",
        "Vienna": "Vienna",
        "Warsaw": "Warsaw",
        "Zagreb": "Zagreb",
        "Zürich": "Zürich",
        "Bangui": "Bangui",
        "Bata": "Bata",
        "Brazzaville": "Brazzaville",
        "Cotonou": "Cotonou",
        "Douala": "Douala",
        "Kinshasa": "Kinshasa",
        "Lagos": "Lagos",
        "Libreville": "Libreville",
        "Luanda": "Luanda",
        "N'Djamena": "N'Djamena",
        "Niamey": "Niamey",
        "Bujumbura": "Bujumbura",
        "Gaborone": "Gaborone",
        "Harare": "Harare",
        "Khartoum": "Khartoum",
        "Kigali": "Kigali",
        "Lilongwe": "Lilongwe",
        "Lubumbashi": "Lubumbashi",
        "Lusaka": "Lusaka",
        "Maputo": "Maputo",
        "Aleppo": "Aleppo",
        "Amman": "Amman",
        "Athens": "Athens",
        "Beirut": "Beirut",
        "Bucharest": "Bucharest",
        "Cairo": "Cairo",
        "Chisinau": "Chisinau",
        "East Jerusalem": "East Jerusalem",
        "Helsinki": "Helsinki",
        "Kaliningrad": "Kaliningrad",
        "Mariehamn": "Mariehamn",
        "Nicosia": "Nicosia",
        "Riga": "Riga",
        "Sofia": "Sofia",
        "Tallinn": "Tallinn",
        "Tripoli": "Tripoli",
        "Vilnius": "Vilnius",
        "Zaporizhzhya": "Zaporizhzhya",
        "Jerusalem": "Jerusalem",
        "Johannesburg": "Johannesburg",
        "Manzini": "Manzini",
        "Maseru": "Maseru",
        "Al Aḩmadī": "Al Aḩmadī",
        "Baghdad": "Baghdad",
        "Doha": "Doha",
        "Manama": "Manama",
        "Riyadh": "Riyadh",
        "Sanaa": "Sanaa",
        "Addis Ababa": "Addis Ababa",
        "Antananarivo": "Antananarivo",
        "Asmara": "Asmara",
        "Dar es Salaam": "Dar es Salaam",
        "Djibouti": "Djibouti",
        "Juba": "Juba",
        "Kampala": "Kampala",
        "Mamoudzou": "Mamoudzou",
        "Mogadishu": "Mogadishu",
        "Moroni": "Moroni",
        "Nairobi": "Nairobi",
        "Minsk": "Minsk",
        "Moscow": "Moscow",
        "Sevastopol": "Sevastopol",
        "Syowa": "Syowa",
        "Istanbul": "Istanbul",
        "Tehran": "Tehran",
        "Yerevan": "Yerevan",
        "Baku": "Baku",
        "Tbilisi": "Tbilisi",
        "Dubai": "Dubai",
        "Muscat": "Muscat",
        "Port Louis": "Port Louis",
        "Saint-Denis": "Saint-Denis",
        "Samara": "Samara",
        "Victoria": "Victoria",
        "Kabul": "Kabul",
        "Port-aux-Français": "Port-aux-Français",
        "Male": "Malé",
        "Mawson": "Mawson",
        "Karachi": "Karachi",
        "Dushanbe": "Dushanbe",
        "Ashgabat": "Ashgabat",
        "Tashkent": "Tashkent",
        "Kyzylorda": "Kyzylorda",
        "Yekaterinburg": "Yekaterinburg",
        "Colombo": "Colombo",
        "Mumbai": "Mumbai",
        "Kathmandu": "Kathmandu",
        "Dhaka": "Dhaka",
        "Thimphu": "Thimphu",
        "Ürümqi": "Ürümqi",
        "Almaty": "Almaty",
        "Chagos": "Chagos",
        "Bishkek": "Bishkek",
        "Omsk": "Omsk",
        "Vostok": "Vostok",
        "West Island": "West Island",
        "Yangon": "Yangon",
        "Flying Fish Cove": "Flying Fish Cove",
        "Davis": "Davis",
        "Ulaangom": "Ulaangom",
        "Bangkok": "Bangkok",
        "Ho Chi Minh City": "Ho Chi Minh City",
        "Phnom Penh": "Phnom Penh",
        "Vientiane": "Vientiane",
        "Novosibirsk": "Novosibirsk",
        "Jakarta": "Jakarta",
        "Perth": "Perth",
        "Bandar Seri Begawan": "Bandar Seri Begawan",
        "Makassar": "Makassar",
        "Macau": "Macau",
        "Shanghai": "Beijing",
        "Hong Kong": "Hong Kong",
        "Irkutsk": "Irkutsk",
        "Kota Bharu": "Kota Bharu",
        "Quezon City": "Quezon City",
        "Singapore": "Singapore",
        "Taipei": "Taipei",
        "Ulan Bator": "Ulan Bator",
        "Eucla": "Eucla",
        "Dili": "Dili",
        "Jayapura": "Jayapura",
        "Tokyo": "Tokyo",
        "Pyongyang": "Pyongyang",
        "Seoul": "Seoul",
        "Ngerulmud": "Ngerulmud",
        "Chita": "Chita",
        "Adelaide": "Adelaide",
        "Darwin": "Darwin",
        "Brisbane": "Brisbane",
        "Sydney": "Sydney",
        "Dededo Village": "Dededo Village",
        "Saipan": "Saipan",
        "Chuuk": "Chuuk",
        "DumontDUrville": "DumontDUrville",
        "Port Moresby": "Port Moresby",
        "Khabarovsk": "Khabarovsk",
        "Lord Howe": "Lord Howe",
        "Arawa": "Arawa",
        "Casey": "Casey",
        "Kosrae": "Kosrae",
        "Nouméa": "Nouméa",
        "Yuzhno-Sakhalinsk": "Yuzhno-Sakhalinsk",
        "Honiara": "Honiara",
        "Port-Vila": "Port-Vila",
        "Suva": "Suva",
        "Tarawa": "Tarawa",
        "Majuro": "Majuro",
        "Yaren": "Yaren",
        "Auckland": "Auckland",
        "McMurdo": "McMurdo",
        "Petropavlovsk-Kamchatsky": "Petropavlovsk-Kamchatsky",
        "Funafuti": "Funafuti",
        "Wake": "Wake",
        "Mata-Utu": "Mata-Utu",
        "Chatham": "Chatham",
        "Apia": "Apia",
        "Kanton": "Kanton",
        "Fakaofo": "Fakaofo",
        "Nuku‘alofa": "Nuku‘alofa",
        "Kiritimati": "Kiritimati"
    },
    "zh": {
        "local_time": "本地时间",
        "uk_time": "{0}时间",
        "timezone": "时区",
        "no_timezone": "找不到时区",
        "timezone_setting": "时区设置",
        "time_travel": "时间穿梭",
        "Alofi": "阿洛菲",
        "Midway": "中途岛",
        "Pago Pago": "帕果帕果",
        "Avarua": "阿瓦鲁",
        "Adak": "埃达克",
        "Honolulu": "檀香山",
        "Faaa": "法阿",
        "Marquesas": "马克萨斯群岛",
        "Anchorage": "安克雷奇",
        "Gambier": "甘比尔群岛",
        "Los Angeles": "洛杉矶",
        "Tijuana": "提华纳",
        "Vancouver": "温哥华",
        "Adamstown": "亚当斯敦",
        "Hermosillo": "埃莫西约",
        "Calgary": "卡尔加里",
        "Ciudad Juárez": "华瑞兹城",
        "Denver": "丹佛",
        "Phoenix": "凤凰城",
        "Whitehorse": "怀特霍斯",
        "Belize City": "伯利兹城",
        "Chicago": "芝加哥",
        "Guatemala City": "危地马拉城",
        "Managua": "马那瓜",
        "Mexico City": "墨西哥城",
        "San José": "圣荷西",
        "San Salvador": "圣萨尔瓦多",
        "Saskatoon": "萨斯卡通",
        "Tegucigalpa": "特古西加尔巴",
        "Winnipeg": "温尼伯",
        "Easter": "复活节岛",
        "Galapagos": "加拉帕戈斯群岛",
        "Rio Branco": "里奥布朗库",
        "Bogotá": "波哥大",
        "Havana": "哈瓦那",
        "Atikokan": "阿蒂科肯",
        "Cancún": "坎昆",
        "Cockburn Town": "科伯恩城",
        "George Town": "乔治市",
        "Kingston": "金斯敦",
        "Nassau": "拿骚",
        "New York City": "纽约",
        "Panamá": "巴拿马",
        "Port-au-Prince": "太子港",
        "Toronto": "多伦多",
        "Quito": "基多",
        "Lima": "利马",
        "Manaus": "马瑙斯",
        "Basseterre": "巴斯特尔",
        "Brades": "布莱兹",
        "Bridgetown": "布里奇顿",
        "Castries": "卡斯特里",
        "Chaguanas": "查瓜纳斯",
        "Fort-de-France": "法兰西堡",
        "Gustavia": "古斯塔维亚",
        "Halifax": "哈利法克斯",
        "Hamilton": "哈密尔顿",
        "Kingstown": "金斯顿",
        "Kralendijk": "克拉伦代克",
        "Les Abymes": "萨莱比梅",
        "Blanc-Sablon": "布朗萨布隆",
        "Marigot": "马里戈特",
        "Oranjestad": "奥拉涅斯塔德",
        "Philipsburg": "菲利普斯堡",
        "Road Town": "罗德城",
        "Roseau": "罗索",
        "Saint Croix": "圣克鲁斯岛",
        "Saint George's": "圣乔治",
        "Saint John’s": "圣约翰斯",
        "San Juan": "圣胡安",
        "Santo Domingo": "圣多明戈",
        "The Valley": "瓦利",
        "Thule": "卡纳克",
        "Willemstad": "威廉斯塔德",
        "La Paz": "拉巴斯",
        "Santiago": "圣地亚哥",
        "Georgetown": "乔治城",
        "Asunción": "亚松森",
        "Caracas": "加拉斯加",
        "St. John's": "圣约翰",
        "Buenos Aires": "布宜诺斯艾利斯",
        "São Paulo": "圣保罗",
        "Palmer": "帕默",
        "Punta Arenas": "蓬塔阿雷纳斯",
        "Stanley": "赤柱",
        "Cayenne": "卡宴",
        "Saint-Pierre": "圣皮埃尔",
        "Paramaribo": "帕拉马里博",
        "Montevideo": "蒙得维的亚",
        "Nuuk": "努克",
        "Noronha": "费尔南多·迪诺罗尼亚群岛",
        "Grytviken": "古利德维肯",
        "Ponta Delgada": "蓬塔德尔加达",
        "Praia": "普腊亚",
        "Scoresbysund": "斯科斯比松",
        "Abidjan": "阿比让",
        "Accra": "阿克拉",
        "Bamako": "巴马科",
        "Bissau": "比绍",
        "Camayenne": "科纳克里",
        "Dakar": "达喀尔",
        "Danmarkshavn": "丹马沙站",
        "Douglas": "道格拉斯",
        "Dublin": "都柏林 ",
        "Freetown": "弗里敦",
        "Jamestown": "詹姆斯敦",
        "Lomé": "洛美",
        "London": "伦敦",
        "Monrovia": "蒙罗维亚",
        "Nouakchott": "努瓦克肖特",
        "Ouagadougou": "瓦加杜古",
        "Reykjavík": "雷克雅未克",
        "Saint Helier": "圣赫利尔",
        "Saint Peter Port": "圣彼得港",
        "Serekunda": "萨拉昆达",
        "São Tomé": "圣多美",
        "Troll": "特罗尔站",
        "Casablanca": "卡萨布兰卡",
        "Laayoune": "阿尤恩",
        "Las Palmas de Gran Canaria": "大加那利岛拉斯帕尔马斯",
        "Lisbon": "里斯本",
        "Tórshavn": "托尔斯港",
        "Windhoek": "温得和克",
        "Algiers": "阿尔及尔",
        "Amsterdam": "阿姆斯特丹",
        "Andorra la Vella": "安道尔城",
        "Belgrade": "贝尔格莱德",
        "Berlin": "柏林",
        "Birkirkara": "比尔基卡拉",
        "Bratislava": "布拉迪斯拉发",
        "Brussels": "布鲁塞尔",
        "Budapest": "布达佩斯",
        "Copenhagen": "哥本哈根",
        "Gibraltar": "直布罗陀",
        "Ljubljana": "卢布尔雅那",
        "Longyearbyen": "朗伊尔城",
        "Luxembourg": "卢森堡",
        "Madrid": "马德里",
        "Monaco": "摩纳哥",
        "Oslo": "奥斯陆",
        "Paris": "巴黎",
        "Podgorica": "波德戈里察",
        "Prague": "布拉格",
        "Rome": "罗马",
        "San Marino": "圣马力诺",
        "Sarajevo": "萨拉热窝",
        "Skopje": "斯科普里",
        "Stockholm": "斯德哥尔摩",
        "Tirana": "Tirana",
        "Tunis": "突尼斯",
        "Vaduz": "瓦杜兹",
        "Vatican City": "梵蒂冈城",
        "Vienna": "维也纳",
        "Warsaw": "华沙",
        "Zagreb": "萨格勒布",
        "Zürich": "苏黎世",
        "Bangui": "班吉",
        "Bata": "巴塔",
        "Brazzaville": "布拉柴维尔",
        "Cotonou": "科托努",
        "Douala": "杜阿拉",
        "Kinshasa": "金夏沙",
        "Lagos": "拉各斯",
        "Libreville": "利伯维尔",
        "Luanda": "罗安达",
        "N'Djamena": "恩贾梅纳",
        "Niamey": "尼亚美",
        "Bujumbura": "布琼布拉",
        "Gaborone": "哈博罗内",
        "Harare": "哈拉雷",
        "Khartoum": "喀土穆",
        "Kigali": "基加利",
        "Lilongwe": "利隆圭",
        "Lubumbashi": "卢本巴希",
        "Lusaka": "卢萨卡",
        "Maputo": "马普托",
        "Aleppo": "阿勒颇",
        "Amman": "安曼",
        "Athens": "雅典",
        "Beirut": "贝鲁特",
        "Bucharest": "布加勒斯特",
        "Cairo": "开罗",
        "Chisinau": "基希讷乌",
        "East Jerusalem": "东耶路撒冷",
        "Helsinki": "赫尔辛基",
        "Kaliningrad": "加里宁格勒",
        "Mariehamn": "玛丽港",
        "Nicosia": "尼科西亚",
        "Riga": "里加",
        "Sofia": "苏菲亚",
        "Tallinn": "塔林",
        "Tripoli": "的黎波里",
        "Vilnius": "维尔纽斯",
        "Zaporizhzhya": "扎波罗热",
        "Jerusalem": "耶路撒冷",
        "Johannesburg": "约翰内斯堡",
        "Manzini": "曼齐尼",
        "Maseru": "马塞卢",
        "Al Aḩmadī": "艾哈迈迪",
        "Baghdad": "巴格达",
        "Doha": "多哈",
        "Manama": "麦纳麦",
        "Riyadh": "利雅得",
        "Sanaa": "萨纳",
        "Addis Ababa": "亚的斯亚贝巴",
        "Antananarivo": "塔那那利佛",
        "Asmara": "阿斯马拉",
        "Dar es Salaam": "达累斯萨拉姆",
        "Djibouti": "吉布提",
        "Juba": "朱巴",
        "Kampala": "坎帕拉",
        "Mamoudzou": "马穆楚",
        "Mogadishu": "摩加迪沙",
        "Moroni": "莫罗尼",
        "Nairobi": "内罗毕",
        "Minsk": "明斯克",
        "Moscow": "莫斯科",
        "Sevastopol": "塞瓦斯托波尔",
        "Syowa": "昭和站",
        "Istanbul": "伊斯坦布尔",
        "Tehran": "德黑兰",
        "Yerevan": "埃里温",
        "Baku": "巴库",
        "Tbilisi": "第比利斯",
        "Dubai": "迪拜",
        "Muscat": "马斯喀特",
        "Port Louis": "路易港",
        "Saint-Denis": "圣但尼",
        "Samara": "萨马拉",
        "Victoria": "维多利亚",
        "Kabul": "喀布尔",
        "Port-aux-Français": "法兰西港",
        "Male": "马累",
        "Mawson": "莫森",
        "Karachi": "卡拉奇",
        "Dushanbe": "杜尚别",
        "Ashgabat": "阿什哈巴德",
        "Tashkent": "塔什干",
        "Kyzylorda": "克孜勒奥尔达",
        "Yekaterinburg": "叶卡捷琳堡",
        "Colombo": "哥伦坡",
        "Mumbai": "孟买",
        "Kathmandu": "加德满都",
        "Dhaka": "达卡",
        "Thimphu": "廷布",
        "Ürümqi": "乌鲁木齐",
        "Almaty": "阿拉木图",
        "Chagos": "查戈斯",
        "Bishkek": "比什凯克",
        "Omsk": "鄂木斯克",
        "Vostok": "沃斯托克",
        "West Island": "西岛",
        "Yangon": "仰光",
        "Flying Fish Cove": "飞鱼湾",
        "Davis": "戴维斯",
        "Ulaangom": "乌兰固木",
        "Bangkok": "曼谷",
        "Ho Chi Minh City": "胡志明市",
        "Phnom Penh": "金边",
        "Vientiane": "万象",
        "Novosibirsk": "新西伯利亚",
        "Jakarta": "雅加达",
        "Perth": "珀斯",
        "Bandar Seri Begawan": "斯里巴加湾",
        "Makassar": "望加锡",
        "Macau": "澳门",
        "Shanghai": "北京",
        "Hong Kong": "香港",
        "Irkutsk": "伊尔库茨克",
        "Kota Bharu": "哥打巴鲁",
        "Quezon City": "奎松市",
        "Singapore": "新加坡",
        "Taipei": "台北",
        "Ulan Bator": "乌兰巴托",
        "Eucla": "尤克拉",
        "Dili": "帝力",
        "Jayapura": "查亚普拉",
        "Tokyo": "东京",
        "Pyongyang": "平壤",
        "Seoul": "首尔",
        "Ngerulmud": "恩吉鲁穆德",
        "Chita": "赤塔",
        "Adelaide": "阿德莱德",
        "Darwin": "达尔文",
        "Brisbane": "布里斯班",
        "Sydney": "悉尼",
        "Dededo Village": "德德多",
        "Saipan": "塞班岛",
        "Chuuk": "丘克州",
        "DumontDUrville": "杜蒙特杜维尔站",
        "Port Moresby": "莫尔斯比港",
        "Khabarovsk": "伯力",
        "Lord Howe": "豪勋爵岛",
        "Arawa": "阿拉瓦",
        "Casey": "凯西",
        "Kosrae": "科斯雷",
        "Nouméa": "努美阿",
        "Yuzhno-Sakhalinsk": "南萨哈林斯克",
        "Honiara": "霍尼亚拉",
        "Port-Vila": "维拉港",
        "Suva": "苏瓦",
        "Tarawa": "塔拉瓦",
        "Majuro": "马朱罗",
        "Yaren": "亚伦",
        "Auckland": "奥克兰",
        "McMurdo": "麦克默多站",
        "Petropavlovsk-Kamchatsky": "堪察加彼得罗巴甫洛夫斯克",
        "Funafuti": "富纳富提",
        "Wake": "韦克",
        "Mata-Utu": "马塔乌图",
        "Chatham": "查塔姆",
        "Apia": "阿皮亚",
        "Kanton": "坎顿",
        "Fakaofo": "法卡福",
        "Nuku‘alofa": "努库阿洛法",
        "Kiritimati": "基里蒂马蒂"
    },
    "es": {
        "local_time": "Hora local",
        "uk_time": "Hora {0}",
        "timezone": "Zona horaria",
        "no_timezone": "Zona horaria no encontrada",
        "timezone_setting": "Elegir zona horaria",
        "time_travel": "Viaje temporal",
        "Los Angeles": "Los Angeles",
        "Ciudad Juárez": "Ciudad Juárez",
        "Belize City": "Ciudad de Belice",
        "Guatemala City": "Ciudad de Guatemala",
        "Mexico City": "Ciudad de Mexico",
        "Easter": "Isla de Pascua",
        "Nassau": "Nassáu",
        "New York City": "Nueva York",
        "Port-au-Prince": "Puerto Príncipe",
        "Saint Croix": "Santa Cruz",
        "Saint George's": "Saint Jorge",
        "Saint John’s": "Saint John",
        "Accra": "Acra",
        "Dublin": "Dublín",
        "London": "Londres",
        "Saint Helier": "Saint Helier",
        "Las Palmas de Gran Canaria": "Las Palmas de Gran Canaria",
        "Lisbon": "Lisboa",
        "Berlin": "Berlín",
        "Brussels": "Bruselas",
        "Luxembourg": "Luxemburgo",
        "Madrid": "Madrid",
        "Monaco": "Mónaco",
        "Paris": "París",
        "Prague": "Praga",
        "Rome": "Roma",
        "Stockholm": "Estocolmo",
        "Tirana": "Tirana",
        "Tunis": "Túnez",
        "Vatican City": "Ciudad del Vaticano",
        "Vienna": "Viena",
        "Warsaw": "Varsovia",
        "Lilongwe": "Lilongüe",
        "Athens": "Atenas",
        "Bucharest": "Bucarest",
        "East Jerusalem": "Jerusalem Este",
        "Kaliningrad": "Kaliningrado",
        "Sofia": "Sofía",
        "Vilnius": "Vilna",
        "Zaporizhzhya": "Zaporiyia",
        "Riyadh": "Riad",
        "Sanaa": "Saná",
        "Djibouti": "Yibuti",
        "Moscow": "Moscú",
        "Sevastopol": "Sebastopol",
        "Syowa": "Showa",
        "Male": "Malé",
        "Yekaterinburg": "Ekaterimburgo",
        "Kathmandu": "Katmandú",
        "Thimphu": "Timbu",
        "Bishkek": "Biskek",
        "Ulaangom": "Ulaangom",
        "Bangkok": "Bangkok",
        "Phnom Penh": "Nom Pen",
        "Vientiane": "Vientián",
        "Makassar": "Macasar",
        "Quezon City": "Ciudad Quezon",
        "Singapore": "Singapur",
        "Ulan Bator": "Ulán Bator",
        "Seoul": "Seúl",
        "Adelaide": "Adelaida",
        "Sydney": "Sídney",
        "Dededo Village": "Dededo",
        "Port Moresby": "Puerto Moresby"
    },
    "ja": {
        "local_time": "現地時間",
        "uk_time": "{0}時間",
        "timezone": "タイムゾーン",
        "no_timezone": "タイムゾーンが見つかりません",
        "timezone_setting": "タイムゾーン設定",
        "time_travel": "タイムトラベル",
        "Alofi": "アロフィ",
        "Midway": "ミッドウェイ",
        "Pago Pago": "パゴパゴ",
        "Avarua": "アバルア",
        "Adak": "アダック",
        "Honolulu": "ホノルル",
        "Faaa": "ファー",
        "Marquesas": "マルケサス",
        "Anchorage": "アンカレッジ",
        "Gambier": "ガンビア",
        "Los Angeles": "ロサンゼルス",
        "Tijuana": "ティファナ",
        "Vancouver": "バンクーバー",
        "Adamstown": "アダムスタウン",
        "Hermosillo": "エルモシヨ",
        "Calgary": "カルガリー",
        "Ciudad Juárez": "シウダードフアレス",
        "Denver": "デンバー",
        "Phoenix": "フェニックス",
        "Whitehorse": "ホワイトホース",
        "Belize City": "ベリーズ・シティ",
        "Chicago": "シカゴ",
        "Guatemala City": "グアテマラシティ",
        "Managua": "マナグア",
        "Mexico City": "メキシコシティ",
        "San José": "サンホセ",
        "San Salvador": "サンサルバドル",
        "Saskatoon": "サスカトゥーン",
        "Tegucigalpa": "テグシガルパ",
        "Winnipeg": "ウィニペグ",
        "Easter": "イースター",
        "Galapagos": "ガラパゴス",
        "Rio Branco": "リオ・ブランコ",
        "Bogotá": "ボゴタ",
        "Havana": "ハバナ",
        "Atikokan": "アティコカン",
        "Cancún": "カンクン",
        "Cockburn Town": "コックバーンタウン",
        "George Town": "ジョージタウン",
        "Kingston": "キングストン",
        "Nassau": "ナッソー",
        "New York City": "ニューヨーク・シティ",
        "Panamá": "パナマ",
        "Port-au-Prince": "ポルトープランス",
        "Toronto": "トロント",
        "Quito": "キト",
        "Lima": "リマ",
        "Manaus": "マナウス",
        "Basseterre": "バセテラ",
        "Brades": "ブレイズ",
        "Bridgetown": "ブリッジタウン",
        "Castries": "カストリーズ",
        "Chaguanas": "チャグアナス",
        "Fort-de-France": "フォール・ド・フランス",
        "Gustavia": "グスタヴィア",
        "Halifax": "ハリファックス",
        "Hamilton": "ハミルトン",
        "Kingstown": "キングスタウン",
        "Kralendijk": "クラレンダイク",
        "Les Abymes": "レ・アビム",
        "Marigot": "マリゴ",
        "Oranjestad": "オラニエスタッド",
        "Philipsburg": "フィリップスバーグ",
        "Road Town": "ロードタウン",
        "Roseau": "ロゾー",
        "Saint Croix": "セントクロイ",
        "Saint George's": "セント・ジョージズ",
        "Saint John’s": "セント・ジョンズ",
        "San Juan": "サンファン",
        "Santo Domingo": "サント・ドミンゴ",
        "The Valley": "ザ・バレー",
        "Thule": "トゥール",
        "Willemstad": "ウィレムスタッド",
        "La Paz": "ラパス",
        "Santiago": "サンティアゴ",
        "Georgetown": "ジョージタウン",
        "Asunción": "アスンシオン",
        "Caracas": "カラカス",
        "St. John's": "St.John's",
        "Buenos Aires": "ブエノスアイレス",
        "São Paulo": "サンパウロ",
        "Palmer": "パーマー",
        "Punta Arenas": "プンタ・アレナス",
        "Stanley": "スタンレー",
        "Cayenne": "カイエン",
        "Saint-Pierre": "サンピエール",
        "Paramaribo": "パラマリボ",
        "Montevideo": "モンテビデオ",
        "Nuuk": "ヌーク",
        "Noronha": "ノローニャ",
        "Grytviken": "グリトビケン",
        "Ponta Delgada": "ポンタ・デルガダ",
        "Praia": "プライア",
        "Scoresbysund": "スコアビズンド",
        "Abidjan": "アビジャン",
        "Accra": "アクラ",
        "Bamako": "バマコ",
        "Bissau": "ビッサウ",
        "Camayenne": "カマイアン",
        "Dakar": "ダカール",
        "Danmarkshavn": "ダンマークスハヴン",
        "Douglas": "ダグラス",
        "Dublin": "ダブリン",
        "Freetown": "フリータウン",
        "Jamestown": "ジェームスタウン",
        "Lomé": "ロメ",
        "London": "ロンドン",
        "Monrovia": "モンロビア",
        "Nouakchott": "ヌアクショット",
        "Ouagadougou": "ワガドゥグー",
        "Reykjavík": "レイキャビク",
        "Saint Helier": "セントヘリア",
        "Saint Peter Port": "セント・ピーター・ポート",
        "Serekunda": "セレクンダ",
        "São Tomé": "サントメ",
        "Troll": "トロール",
        "Casablanca": "カサブランカ",
        "Laayoune": "ラユーン",
        "Las Palmas de Gran Canaria": "ラス・パルマス・デ・グラン・カナリア",
        "Lisbon": "リスボン",
        "Tórshavn": "トールシャヴン",
        "Windhoek": "ウィントフック",
        "Algiers": "アルジェ",
        "Amsterdam": "アムステルダム",
        "Andorra la Vella": "アンドラ・ラ・ベリャ",
        "Belgrade": "ベオグラード",
        "Berlin": "ベルリン",
        "Birkirkara": "ビルキルカラ",
        "Bratislava": "ブラチスラバ",
        "Brussels": "ブリュッセル",
        "Budapest": "ブダペスト",
        "Copenhagen": "コペンハーゲン",
        "Gibraltar": "ジブラルタル",
        "Ljubljana": "リュブリャナ",
        "Longyearbyen": "ロングイヤービーン",
        "Luxembourg": "ルクセンブルク",
        "Madrid": "マドリッド",
        "Monaco": "モナコ",
        "Oslo": "オスロ",
        "Paris": "パリ",
        "Podgorica": "ポドゴリツァ",
        "Prague": "プラハ",
        "Rome": "ローマ",
        "San Marino": "サンマリノ",
        "Sarajevo": "サラエボ",
        "Skopje": "スコピエ",
        "Stockholm": "ストックホルム",
        "Tirana": "ティラナ",
        "Tunis": "チュニス",
        "Vaduz": "ヴァドゥーツ",
        "Vatican City": "バチカン市国",
        "Vienna": "ウィーン",
        "Warsaw": "ワルシャワ",
        "Zagreb": "ザグレブ",
        "Zürich": "チューリッヒ",
        "Bangui": "バンギ",
        "Bata": "バタ",
        "Brazzaville": "ブラザビル",
        "Cotonou": "コトヌー",
        "Douala": "ドゥアラ",
        "Kinshasa": "キンシャサ",
        "Lagos": "ラゴス",
        "Libreville": "リーブルヴィル",
        "Luanda": "ルアンダ",
        "N'Djamena": "ンジャメナ",
        "Niamey": "ニアメ",
        "Bujumbura": "ブジュンブラ",
        "Gaborone": "ハボローネ",
        "Harare": "ハラレ",
        "Khartoum": "カルトゥーム",
        "Kigali": "キガリ",
        "Lilongwe": "リロングウェ",
        "Lubumbashi": "ルブンバシ",
        "Lusaka": "ルサカ",
        "Maputo": "マプト",
        "Aleppo": "アレッポ",
        "Amman": "アンマン",
        "Athens": "アテネ",
        "Beirut": "ベイルート",
        "Bucharest": "ブカレスト",
        "Cairo": "カイロ",
        "Chisinau": "キシナウ",
        "East Jerusalem": "東エルサレム",
        "Helsinki": "ヘルシンキ",
        "Kaliningrad": "カリーニングラード",
        "Mariehamn": "マリーハムン",
        "Nicosia": "ニコシア",
        "Riga": "リガ",
        "Sofia": "ソフィア",
        "Tallinn": "タリン",
        "Tripoli": "トリポリ",
        "Vilnius": "ビリニュス",
        "Zaporiyia": "ザポリージャ",
        "Jerusalem": "エルサレム",
        "Johannesburg": "ヨハネスブルグ",
        "Manzini": "マンジーニ",
        "Maseru": "マセル",
        "Al Aḩmadī": "アル・アリフトマディ",
        "Baghdad": "バグダッド",
        "Doha": "ドーハ",
        "Manama": "マナマ",
        "Riyadh": "リヤド",
        "Sanaa": "サナ",
        "Addis Ababa": "アディスアベバ",
        "Antananarivo": "アンタナナリボ",
        "Asmara": "アスマラ",
        "Dar es Salaam": "ダルエスサラーム",
        "Djibouti": "ジブチ",
        "Juba": "ジュバ",
        "Kampala": "カンパラ",
        "Mamoudzou": "マムードゥーゾ",
        "Mogadishu": "モガディシュ",
        "Moroni": "モロニー",
        "Nairobi": "ナイロビ",
        "Minsk": "ミンスク",
        "Moscow": "モスクワ",
        "Sevastopol": "セヴァストポリ",
        "Syowa": "ショーワ",
        "Istanbul": "イスタンブール",
        "Tehran": "テヘラン",
        "Yerevan": "イェレバン",
        "Baku": "バク",
        "Tbilisi": "トビリシ",
        "Dubai": "ドバイ",
        "Muscat": "マスカット",
        "Port Louis": "ポートルイス",
        "Saint-Denis": "サン・ドニ",
        "Samara": "サマラ",
        "Victoria": "ビクトリア",
        "Kabul": "カブール",
        "Port-aux-Français": "ポルトゥ・フランセーズ",
        "Male": "マール",
        "Mawson": "モーソン",
        "Karachi": "カラチ",
        "Dushanbe": "ドゥシャンベ",
        "Ashgabat": "アシュガバット",
        "Tashkent": "タシケント",
        "Kyzylorda": "キジローダ",
        "Yekaterinburg": "エカテリンブルグ",
        "Colombo": "コロンボ",
        "Mumbai": "ムンバイ",
        "Kathmandu": "カトマンズ",
        "Dhaka": "ダッカ",
        "Thimphu": "テヒプ",
        "Almaty": "アルマティ",
        "Chagos": "チャゴス",
        "Bishkek": "ビシュケク",
        "Omsk": "オムスク",
        "Vostok": "ボストーク",
        "West Island": "ウエストアイランド",
        "Yangon": "ヤンゴン",
        "Flying Fish Cove": "フライング・フィッシュ・コーブ",
        "Davis": "デービス",
        "Ulaangom": "オラーンゴム",
        "Bangkok": "バンコク",
        "Ho Chi Minh City": "ホーチミン市",
        "Phnom Penh": "プノンペン",
        "Vientiane": "ビエンチャン",
        "Novosibirsk": "ノボシビルスク",
        "Jakarta": "ジャカルタ",
        "Perth": "パース",
        "Bandar Seri Begawan": "バンダルスリブガワン",
        "Makassar": "マカッサル",
        "Macau": "マカオ",
        "Shanghai": "北京",
        "Hong Kong": "香港",
        "Irkutsk": "イルクーツク",
        "Kota Bharu": "コタバル",
        "Quezon City": "ケソン市",
        "Singapore": "シンガポール",
        "Taipei": "台北",
        "Ulan Bator": "ウランバートル",
        "Eucla": "ユークラ",
        "Dili": "ディリ",
        "Jayapura": "ジャヤプラ",
        "Tokyo": "東京",
        "Pyongyang": "ピョンヤン",
        "Seoul": "ソウル",
        "Ngerulmud": "ンゲルムド",
        "Chita": "知多",
        "Adelaide": "アデレード",
        "Darwin": "ダーウィン",
        "Brisbane": "ブリスベン",
        "Sydney": "シドニー",
        "Dededo Village": "デデド村",
        "Saipan": "サイパン",
        "Chuuk": "チューク",
        "DumontDUrville": "デュモンデュルビル",
        "Port Moresby": "ポートモレスビー",
        "Khabarovsk": "ハバロフスク",
        "Lord Howe": "ロード・ハウ",
        "Arawa": "浦和",
        "Casey": "ケイシー",
        "Kosrae": "コスラエ",
        "Nouméa": "ヌメア",
        "Yuzhno-Sakhalinsk": "ユジノサハリンスク",
        "Honiara": "ホニアラ",
        "Port-Vila": "ポートビラ",
        "Suva": "スバ",
        "Tarawa": "タラワ",
        "Majuro": "マジュロ",
        "Yaren": "ヤレン",
        "Auckland": "オークランド",
        "McMurdo": "マクマード",
        "Petropavlovsk-Kamchatsky": "ペトロパブロフスク・カムチャツキー",
        "Funafuti": "フナフチ",
        "Wake": "ウェイク",
        "Mata-Utu": "マタウチュ",
        "Chatham": "チャタム",
        "Apia": "アピア",
        "Kanton": "カントン"
    }
}
</i18n>

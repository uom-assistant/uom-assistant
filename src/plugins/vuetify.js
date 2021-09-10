import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

import en from 'vuetify/es5/locale/en';
import zhHans from 'vuetify/es5/locale/zh-Hans';
import es from 'vuetify/es5/locale/es';
import ja from 'vuetify/es5/locale/ja';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#660099',
                secondary: '#E1BEE7',
                accent: '#D500F9',
                uomtheme: '#660099',
                uomthemelight: '#D099E0',
                colordark: '#DDDDDD',
            },
            dark: {
                primary: '#D099E0',
                secondary: '#E1BEE7',
                accent: '#D500F9',
                uomtheme: '#660099',
                uomthemelight: '#D099E0',
                colordark: '#555555',
            },
        },
    },
    lang: {
        locales: {
            en,
            zhHans,
            es,
            ja,
        },
        current: 'en',
    },
});

import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#660099',
                secondary: '#E1BEE7',
                accent: '#D500F9',
                uomtheme: '#660099',
                colordark: '#DDDDDD',
            },
            dark: {
                primary: '#D099E0',
                secondary: '#E1BEE7',
                accent: '#D500F9',
                uomtheme: '#660099',
                colordark: '#555555',
            },
        },
    },
});

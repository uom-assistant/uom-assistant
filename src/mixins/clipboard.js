import Vue from 'vue';
import VueClipboard from 'vue-clipboard2';

Vue.use(VueClipboard);

export default {
    data() {
        return {
            copySuccess: false,
            copyingIndex: -1,
        };
    },
    methods: {
        /**
         * Show an animation on the copy button if copy succeeded
         */
        onCopy() {
            this.copySuccess = true;
            setTimeout(() => {
                this.copySuccess = false;
            }, 500);
        },
    },
};

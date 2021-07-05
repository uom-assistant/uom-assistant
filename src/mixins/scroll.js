let scroll = 0;
let headerShadowCopy = false;

export default {
    data() {
        return {
            headerShadow: false,
        };
    },
    methods: {
        /**
         * Handle scroll event
         * @param {Event} e scroll event
         */
        scrollHandler(e) {
            scroll = e.target.scrollTop;

            if (scroll > 5 && headerShadowCopy === false) {
                this.headerShadow = true;
                headerShadowCopy = true;
            } else if (scroll < 5 && headerShadowCopy === true) {
                this.headerShadow = false;
                headerShadowCopy = false;
            }
        },
    },
};

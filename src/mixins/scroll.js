let scroll = 0;
let scrollEle = null;
let headerShadowCopy = false;

export default {
    data() {
        return {
            headerShadow: false,
        };
    },
    methods: {
        /**
         * Initialize scroll listener
         * @param {HTMLElement} ele the scroll source
         */
        initScroll(ele) {
            if (scrollEle !== null) {
                scrollEle.removeEventListener('scroll', this.scrollHandler);
            }
            scrollEle = ele;
            ele.addEventListener('scroll', this.scrollHandler);

            this.scrollHandler({
                target: ele,
            });
        },
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
    beforeDestroy() {
        if (scrollEle !== null) {
            scrollEle.removeEventListener('scroll', this.scrollHandler);
        }
    },
};

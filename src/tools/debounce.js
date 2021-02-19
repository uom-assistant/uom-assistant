export default {
    /**
    * Debounce a function
    * @param {function} func the function to be debounced
    * @param {number} wait waiting time
    * @param {boolean?} immediate whether the function needs to execute immediately
    * @returns {function} debounced function
    */
    debounce(func, wait, immediate) {
        let timeout;
        return function () {
            const context = this;
            // eslint-disable-next-line prefer-rest-params
            const args = arguments;
            clearTimeout(timeout);
            // eslint-disable-next-line prefer-arrow-callback
            timeout = setTimeout(function () {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            }, wait);
            if (immediate && !timeout) {
                func.apply(context, args);
            }
        };
    },
};

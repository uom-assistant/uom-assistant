export default {
    methods: {
        /**
         * Get direct link to meeting apps, supports Zoom and Teams
         * @param {string} link original link
         * @param {string} passcode passcode for the meeting or ''
         * @returns {string} converted direct link or the original link
         */
        meetingLink(link, passcode) {
            if (this.ifZoomLink(link)) {
                const linkSplit = link.split('/j/');
                return `${this.zoomProtocol()}://zoom.us/join?action=join&confno=${linkSplit[linkSplit.length - 1].split('#')[0]}${passcode ? `&pwd=${passcode}` : ''}&zc=0`;
            }
            if (this.ifTeamsLink(link)) {
                const linkSplit = link.split('://');
                linkSplit.shift();
                return `msteams://${linkSplit.join('://')}`;
            }
            return link;
        },
        /**
         * Check if it's a Zoom link
         * @param {string} link original link
         * @returns {boolean} whether it's a Zoom link
         */
        ifZoomLink(link) {
            return (link.indexOf('https://zoom.us/j/') === 0 || link.indexOf('http://zoom.us/j/') === 0);
        },
        /**
         * Check if it's a Teams link
         * @param {string} link original link
         * @returns {boolean} whether it's a Teams link
         */
        ifTeamsLink(link) {
            return (link.indexOf('https://teams.microsoft.com/l/') === 0 || link.indexOf('http://teams.microsoft.com/l/') === 0);
        },
        /**
         * Get Zoom's direct link protocol based on device
         * @returns {string} protocol
         */
        zoomProtocol() {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/windows phone/i.test(userAgent) || /android/i.test(userAgent) || ([
                'iPad Simulator',
                'iPhone Simulator',
                'iPod Simulator',
                'iPad',
                'iPhone',
                'iPod',
            ].includes(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document))) {
                return 'zoomus';
            }
            return 'zoommtg';
        },
    },
};

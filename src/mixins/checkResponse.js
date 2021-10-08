import checkBackendVersion from '@/tools/checkBackendVersion';

export default {
    methods: {
        /**
         * Check whether the response from backend is valid
         * @param {Object} response response object
         * @returns {boolean} `true` if it's valid
         */
        checkResponse(response) {
            if (!response.uomabVersion) {
                // Not a valid UoM Assistant backend
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('backend_error'),
                        content: this.$t('backend_error_body'),
                        type: 'error',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                return false;
            }

            if (!checkBackendVersion(response.uomabVersion)) {
                // Version error
                this.$store.commit('addError', {
                    title: this.$t('backend_error'),
                    content: this.$t('version_error'),
                    type: 'error',
                });
                return false;
            }

            if (!response.success) {
                // Request error
                this.$store.commit('addError', {
                    title: this.$t('request_error'),
                    content: response.reason,
                    type: 'error',
                });
                return false;
            }

            if (response.maintenance) {
                // Backend maintenance
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('backend_maintenance'),
                        content: this.$t('backend_maintenance_body'),
                        type: 'warning',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                return false;
            }

            if (response.data.tokenRequired) {
                // Wrong Token
                if (this.backendStatus) {
                    this.$store.commit('addError', {
                        title: this.$t('token_error'),
                        content: this.$t('token_error_body'),
                        type: 'error',
                    });
                    this.$store.commit('setBackendStatus', false);
                }
                return false;
            }

            return true;
        },
    },
};

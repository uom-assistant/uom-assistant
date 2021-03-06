module.exports = {
    transpileDependencies: [
        'vuetify',
    ],

    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'zh',
            localeDir: 'locales',
            enableInSFC: true,
        },
    },

    pwa: {
        name: 'UoM Assistant',
        themeColor: '#660099',
        msTileColor: '#660099',
        appleMobileWebAppCapable: true,
        workboxOptions: {
            skipWaiting: true,
            clientsClaim: true,
            runtimeCaching: [
                {
                    urlPattern: new RegExp('https://fonts.googleapis.com/'),
                    handler: 'StaleWhileRevalidate',
                },
                {
                    urlPattern: new RegExp('https://cdn.jsdelivr.net/npm/@mdi/font@latest/'),
                    handler: 'StaleWhileRevalidate',
                },
            ],
        },
    },

    configureWebpack: {
        optimization: {
            splitChunks: {
                minSize: 128000,
                maxSize: 1024000,
            },
        },
    },

    chainWebpack: (config) => {
        config.module
            .rule('i18n')
            .resourceQuery(/blockType=i18n/)
            .type('javascript/auto')
            .use('i18n')
            .loader('@intlify/vue-i18n-loader')
            .end();
    },
};

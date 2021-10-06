const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const minifyHTML = require('html-minifier').minify;

module.exports = {
    productionSourceMap: false,

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
            exclude: [/version\.json/, /\/plugins\//, /\.htaccess/],
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
        manifestOptions: {
            background_color: '#FFFFFF',
        },
    },

    configureWebpack: {
        optimization: {
            splitChunks: {
                minSize: 256000,
                maxSize: 2048000,
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
        config.module.rule('markdown')
            .test(/\.md$/)
            .use('ignore-loader')
            .loader('ignore-loader')
            .end();
        if (process.env.NODE_ENV !== 'development') {
            config.plugin('copy').tap(([options]) => {
                options.push({
                    from: path.resolve(__dirname, 'pdfjs_viewer/web/cmaps'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/cmaps'),
                    toType: 'dir',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/web/images'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/images'),
                    toType: 'dir',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/web/locale'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/locale'),
                    toType: 'dir',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/web/debugger.js'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/debugger.js'),
                    transform: async (content) => (await minify(content.toString())).code,
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/web/viewer.js'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/viewer.js'),
                    transform: async (content) => (await minify(content.toString())).code,
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/build/pdf.js'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/build/pdf.js'),
                    transform: async (content) => (await minify(content.toString())).code,
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/build/pdf.sandbox.js'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/build/pdf.sandbox.js'),
                    transform: async (content) => (await minify(content.toString())).code,
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/build/pdf.worker.js'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/build/pdf.worker.js'),
                    transform: async (content) => (await minify(content.toString())).code,
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/web/viewer.css'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/viewer.css'),
                    transform: (content) => new CleanCSS({ level: 2 }).minify(content.toString().replace(/@media \(prefers-color-scheme: dark\) \{\n {2}:root/, '[data-theme="dark"]').replace(/svg\);\n {2}\}\n\}/, 'svg);\n  }')).styles,
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'src/tools/override.js'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/override.js'),
                    transform: async (content) => (await minify(content.toString())).code,
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'pdfjs_viewer/web/viewer.html'),
                    to: path.resolve(__dirname, 'dist/pdf-viewer/web/viewer.html'),
                    transform: (content) => minifyHTML(content.toString().replace('<link rel="stylesheet" href="viewer.css">', '<link rel="stylesheet" href="viewer.css"><script src="override.js"></script>'), {
                        caseSensitive: true,
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        conservativeCollapse: true,
                        continueOnParseError: true,
                        decodeEntities: true,
                        removeComments: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true,
                    }),
                    toType: 'file',
                }, {
                    from: path.resolve(__dirname, 'plugins/plugins'),
                    to: path.resolve(__dirname, 'dist/plugins/plugins'),
                    toType: 'dir',
                }, {
                    from: path.resolve(__dirname, 'plugins/plugins.json'),
                    to: path.resolve(__dirname, 'dist/plugins/plugins.json'),
                    toType: 'file',
                });
                return [options];
            });
        } else {
            config.plugin('copy').tap(([options]) => {
                options.push({
                    from: path.resolve(__dirname, 'plugins/plugins'),
                    to: path.resolve(__dirname, 'dist/plugins/plugins'),
                    toType: 'dir',
                }, {
                    from: path.resolve(__dirname, 'plugins/plugins.json'),
                    to: path.resolve(__dirname, 'dist/plugins/plugins.json'),
                    toType: 'file',
                });
                return [options];
            });
        }
    },
};

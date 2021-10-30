module.exports = {
    preset: '@vue/cli-plugin-unit-jest',
    transformIgnorePatterns: [
        'node_modules/(?!(katex|franc-min|trigram-utils|n-gram|collapse-white-space)/)',
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    globalSetup: './tests/unit/setup.js',
    setupFiles: ['jest-localstorage-mock'],
};

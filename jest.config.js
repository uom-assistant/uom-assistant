module.exports = {
    preset: '@vue/cli-plugin-unit-jest',
    transformIgnorePatterns: [
        'node_modules/(?!(katex)/)',
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
};

module.exports = {
    root: true,
    env: {
        node: true,
        jest: true,
    },
    extends: [
        'plugin:vue/essential',
        '@vue/airbnb',
    ],
    parserOptions: {
        parser: 'babel-eslint',
    },
    rules: {
        semi: [2, 'always'],
        indent: ['error', 4],
        'no-new': 0,
        'no-restricted-syntax': 0,
        'max-len': 'off',
        'no-bitwise': 'off',
        'no-lonely-if': 'off',
        'guard-for-in': 'off',
        'func-names': 'off',
        'newline-per-chained-call': 'off',
        'prefer-destructuring': 'off',
        'no-loop-func': 'off',
        'no-underscore-dangle': ['error', { allow: ['__UOMA_ELECTRON__', '__UOMA_ELECTRON_BRIDGE__'] }],
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
    overrides: [
        {
            files: [
                '**/__tests__/*.{j,t}s?(x)',
                '**/tests/unit/**/*.spec.{j,t}s?(x)',
            ],
        },
    ],
};

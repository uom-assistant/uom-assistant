module.exports = {
    root: true,
    env: {
        node: true,
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
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
};

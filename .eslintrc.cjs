module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['dist'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
};
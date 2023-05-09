module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        jest: true,
    },
    extends: [
        'plugin:react/recommended',
        'plugin:jest/recommended',
        'plugin:react-hooks/recommended',
        'plugin:storybook/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.eslint.json',
    },
    plugins: ['@typescript-eslint', 'eslint-comments', 'jest', 'storybook'],
    root: true,
    rules: {
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        'react/require-default-props': 'off',
        '@typescript-eslint/dot-notation': 'off',
        // Allow most functions to rely on type inference. If the function is exported, then `@typescript-eslint/explicit-module-boundary-types` will ensure
        // it's typed.
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-shadow': 'warn',
        '@typescript-eslint/no-unused-expressions': 'warn',
        '@typescript-eslint/semi': ['warn', 'always'],
        '@typescript-eslint/type-annotation-spacing': 'error',
        // Often used for this library
        'react/jsx-props-no-spreading': 'off',
        'react/react-in-jsx-scope': 'off',
        '@typescript-eslint/no-use-before-define': [
            'error',
            {
                functions: false,
                classes: true,
                variables: true,
                typedefs: true,
            },
        ],
        'react/prop-types': 'off',
        'jest/no-conditional-expect': 'off',
        'react/display-name': 'off',
    },
};

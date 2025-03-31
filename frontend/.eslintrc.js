module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true,
    node: true,
    'cypress/globals': true,
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:storybook/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'cypress'],
  rules: {
    'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    'react/prop-types': 'warn', // Warn about missing prop types
    'no-unused-vars': 'warn', // Warning instead of error for development
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  // Ignore build and node_modules directories
  ignorePatterns: ['build/**', 'node_modules/**'],
};
/**
 * ESLint configuration for code quality enforcement
 * 
 * This configuration extends the base ESLint config with additional
 * rules focused on code quality and maintainability.
 */
module.exports = {
  extends: [
    './.eslintrc.js',
    'plugin:sonarjs/recommended',
    'plugin:jest-dom/recommended',
    'plugin:testing-library/react'
  ],
  plugins: [
    'sonarjs',
    'jest-dom',
    'testing-library',
    'jsx-a11y',
    'react-hooks',
    'import'
  ],
  rules: {
    // Complexity rules
    'complexity': ['error', 10],
    'max-depth': ['error', 3],
    'max-lines': ['error', 500],
    'max-lines-per-function': ['error', 50],
    'max-nested-callbacks': ['error', 3],
    'max-params': ['error', 4],
    'sonarjs/cognitive-complexity': ['error', 15],
    
    // Naming conventions
    'camelcase': ['error', { properties: 'always' }],
    'id-length': ['error', { min: 2, exceptions: ['i', 'j', 'x', 'y', 'z'] }],
    
    // Code style
    'no-console': ['warn'],
    'no-alert': ['error'],
    'no-debugger': ['error'],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-duplicate-imports': ['error'],
    
    // Import organization
    'import/order': ['error', {
      'groups': ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' }
    }],
    'import/no-cycle': ['error'],
    'import/no-unused-modules': ['error'],
    
    // React best practices
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/prop-types': 'error',
    'react/jsx-no-bind': ['error', { 'allowArrowFunctions': true }],
    'react/jsx-fragments': ['error', 'syntax'],
    
    // Accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-props': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/aria-unsupported-elements': 'error',
    'jsx-a11y/label-has-associated-control': 'error'
  }
};

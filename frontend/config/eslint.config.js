module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    // Error prevention
    'no-unused-vars': 'warn',
    'no-undef': 'error',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // React specific rules
    'react/prop-types': 'warn',
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react/display-name': 'warn',
    'react/no-unescaped-entities': [
      'error',
      {
        forbid: [
          {
            char: "'",
            alternatives: ['&apos;', '&#39;', '&rsquo;']
          },
          {
            char: '"',
            alternatives: ['&quot;', '&#34;', '&rdquo;']
          },
          { char: ">", alternatives: ["&gt;"] },
          { char: "<", alternatives: ["&lt;"] }
        ]
      }
    ],
    
    // React Hooks
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Case declarations in switch statements
    'no-case-declarations': 'warn',
    
    // Allow certain patterns that we know are safe
    'no-useless-catch': 'warn',
  },
  // Special override for test files
  overrides: [
    {
      files: ['**/*.test.js', '**/*.test.jsx', '**/tests/**'],
      env: {
        jest: true,
      },
      rules: {
        'react/display-name': 'off',
        'no-undef': 'off',
      },
    },
  ],
};
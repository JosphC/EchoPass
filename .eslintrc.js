module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: { react: { version: 'detect' } },
  env: { node: true, jest: true },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],
  },
  overrides: [
    {
      files: ['app/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 60, skipBlankLines: true, skipComments: true }],
      },
    },
    {
      files: ['src/ui/**/*.tsx', 'src/features/**/*.tsx'],
      rules: {
        'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      },
    },
  ],
  ignorePatterns: ['node_modules/', 'dist/', '.expo/', 'mock-api/', 'docker/'],
};

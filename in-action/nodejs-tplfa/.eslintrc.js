module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 12,
  },
  plugins: ['prettier', '@typescript-eslint'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'error',
    'import/prefer-default-export': 'off',
    'prettier/prettier': ['error'],
    'no-console': ['off'],
  },
  root: true,
  settings: {
    'import/resolver': {
      'node': {
        'extensions': ['.ts', '.tsx']
      }
    }
  },
};

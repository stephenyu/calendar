module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  ignorePatterns: ['*.json', 'dist/**/*', 'node_modules/**/*'],
  rules: {
    // Code quality rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'error',
    'prefer-const': 'error',

    // Style rules
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],

    // Best practices
    eqeqeq: 'error',
    'no-var': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',

    // JSDoc rules
    'valid-jsdoc': 'error',
    'require-jsdoc': [
      'error',
      {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: true,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false
        }
      }
    ]
  },
  globals: {
    // Browser globals
    document: 'readonly',
    window: 'readonly',
    localStorage: 'readonly',

    // External libraries
    jsyaml: 'readonly',
    LZString: 'readonly',
    luxon: 'readonly'
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      },
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        // Disable base rules that conflict with TypeScript
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' }
        ],
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'error',
          {
            functions: false,
            classes: true,
            variables: true
          }
        ],

        // Relax some TypeScript rules for this project
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        // TypeScript-friendly style rules
        semi: 'off',
        '@typescript-eslint/semi': ['error', 'always'],
        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': [
          'error',
          {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always'
          }
        ],
        indent: 'off',
        '@typescript-eslint/indent': ['error', 2],
        quotes: ['error', 'single'],
        'comma-dangle': ['error', 'never'],

        // Best practices
        'no-console': 'warn',
        eqeqeq: 'error',
        'no-var': 'error',
        'prefer-const': 'error',
        curly: ['error', 'all'],

        // Disable JSDoc requirement for TypeScript (types are in the code)
        'require-jsdoc': 'off',
        'valid-jsdoc': 'off'
      }
    },
    {
      files: ['scripts/**/*.js'],
      rules: {
        // Allow console in build scripts
        'no-console': 'off'
      }
    }
  ]
};

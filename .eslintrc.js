module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 11,
  },
  'rules': {
  },
  'rules': {
    'arrow-spacing': ['error'],
    'comma-dangle': ['error', {
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
      'functions': 'only-multiline',
    }],
    'indent': ['error', 2],
    'linebreak-style': 'off',
    'operator-linebreak': ['error', 'before'],
    'space-infix-ops': ['error'],
    'space-unary-ops': ['error'],
  },
};

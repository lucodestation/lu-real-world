module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  rules: {
    semi: ['warn', 'always'], // 必须加分号
    quotes: ['warn', 'single'], // 尽量使用单引号
    eqeqeq: 'warn', // 全等
    indent: ['warn', 2], // 缩进
    'comma-dangle': ['warn', 'never'] // 结尾逗号
  }
};

// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // check if imports actually resolve
  'settings': {
    'import/resolver': {
      'webpack': {
        'config': 'build/webpack.base.conf.js'
      }
    }
  },
  // 自定义编码规范，慎重修改
  'rules': {
    // 关闭数组，对象最后一个元素后的逗号检查
    'comma-dangle': 0,
    'max-len': [
      'error', {
        // 代码长度
        'code': 320,
        // 忽略正则表达式匹配的行；可以只匹配单行，而且在 YAML 或 JSON 中需要双重转义
        // 'ignorePattern': true,
        // 忽略所有拖尾注释和行内注释
        'ignoreComments': true,
        // 强制注释的最大长度；默认长度同 code, 暂未生效,因此加入上方的规则
        'comments': 320
      }
    ],
    'no-cond-assign': 0,
    // console警告
    'no-console': 0,
    'consistent-return': 0,
    // 允许未定义
    'no-undef': 0,
    // 允许new
    'no-new': 0,
    'arrow-body-style': 0,
    'guard-for-in': 0,
    'no-restricted-syntax': 0,
    // 禁止变量声明覆盖外层作用域的变量
    'no-shadow': ['error', { 'allow': ['state'] }],
    // 允许修改传入的参数
    'no-param-reassign': 0,
    // 允许嵌套三元表达式
    'no-nested-ternary': 0,
    'linebreak-style': 0,
    // 允许不存在默认的抛出
    'import/prefer-default-export': 0,
    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // allow global require
    'global-require': 0
  }
};

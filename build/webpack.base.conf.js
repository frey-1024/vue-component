var path = require('path')
var glob = require('glob');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin'); //生成html
var utils = require('./utils')
var config = require('../config')
var vueLoaderConfig = require('./vue-loader.conf')
var ExtractTextPlugin = require('extract-text-webpack-plugin'); //css单独打包

var router = require('../config/router.env');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

const webpackConfig = {
  // entry: {
  //   app: ['babel-polyfill', './src/main.js']
  // },
  entry: {},
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production' ||  process.env.NODE_ENV === 'test'
      ? router.baseVersionRouter
      : router.baseRouter
  },

  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolve('src'),
      'components': resolve('src/components'),
      'images': resolve('src/static/images'),
      'lib': resolve('src/lib')
    }
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: [resolve('src'), resolve('test')],
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test')]
      },
      //  {
      //   test: /\.(scss|sass)$/,
      //   loader: 'style-loader!css-loader!sass-loader'
      // },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          //resolve-url-loader may be chained before sass-loader if necessary
          use: [ {
            loader: 'css-loader',
            options: {
              modules: false,
            }
          },{
            loader: 'postcss-loader',
            options: {
              plugins: function () {
                return [
                  require('precss'),
                  require('autoprefixer')
                ];
              }
            }
          },{loader:'sass-loader'}]
        })
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
    ]
  },
  plugins:[
    new ExtractTextPlugin(utils.assetsPath('styles/[name][hash].css')),
  ],
}
function getEntries(globPath) {
  var files = glob.sync(globPath),
    entries = {};
  files.forEach(function(filepath) {
    // 取倒数第二层(view下面的文件夹)做包名
    var split = filepath.split('/');
    var name = split[split.length - 2];
    entries[name] = './' + filepath;
  });
  return entries;
}
if (!process.env.fileName) {
  var entries = getEntries('./src/views/**/index.html');

  Object.keys(entries).forEach(function(name) {
    // 每个页面生成一个entry，如果需要HotUpdate，在这里修改entry
    webpackConfig.entry[name] = entries[name].replace('.html', '.js');

    // 每个页面生成一个html
    var plugin = new HtmlWebpackPlugin({
      // 生成出来的html文件名
      filename: name + '.html',
      // 每个html的模版，这里多个页面使用同一个模版
      template: entries[name],
      // 自动将引用插入html
      inject: true,
      showErrors: false,
      chunks: [name]
    });
    webpackConfig.plugins.push(plugin);
  });
} else {
  var name = process.env.fileName;
  webpackConfig.entry[name] = './src/views/'+name+'/index.js';
  var plugin = new HtmlWebpackPlugin({
    // 生成出来的html文件名
    filename: name + '.html',
    // 每个html的模版，这里多个页面使用同一个模版
    template: './src/views/'+name+'/index.html',
    // 自动将引用插入html
    inject: true,
    showErrors: false,
    chunks: [name]
  });
  webpackConfig.plugins.push(plugin);
}

if (process.env.NODE_ENV.indexOf('production') < 0 && process.env.NODE_ENV.indexOf('test') < 0) {
  var plugin = new HtmlWebpackPlugin({
    // 生成出来的html文件名
    filename: 'index.html',
    // 每个html的模版，这里多个页面使用同一个模版
    template: 'index.html',
    inject: false,
  });
  webpackConfig.plugins.push(plugin);
}

const vuxLoader = require('vux-loader');

module.exports = vuxLoader.merge(webpackConfig, {
  plugins: ['vux-ui']
});

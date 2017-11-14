require('./check-versions')();

var ora = require('ora');
var rm = require('rimraf');
var path = require('path');
var chalk = require('chalk');
var webpack = require('webpack');
var config;
var webpackConfig;

if (process.env.NODE_ENV === 'production') {
  config = require('../config').build;
  webpackConfig = require('./webpack.prod.conf');
} else {
  config = require('../config').test;
  webpackConfig = require('./webpack.test.conf');
}

var spinner = ora(`building for ${process.env.NODE_ENV || 'development'}...`);
spinner.start();

rm(path.join(config.assetsRoot, config.assetsSubDirectory), err => {
  if (err) throw err;
  webpack(webpackConfig, function (err, stats) {
    spinner.stop();
    if (err) throw err;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n\n');

    console.log(chalk.cyan('  Build complete.\n'));
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ));
  });
});

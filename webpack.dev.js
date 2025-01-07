const common = require('./webpack.common');
const { merge } = require('webpack-merge');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    open: true,
    host: '0.0.0.0',
    port: 8080,
    watchFiles: ['./src/template.html', './src/script.js', './src/css/style.css'],
  },
});

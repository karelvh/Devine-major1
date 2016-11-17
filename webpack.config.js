const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const HTMLWebpackPlugin = require(`html-webpack-plugin`);

const path = require('path');

const LoaderOptionsPlugin = require(`webpack`).LoaderOptionsPlugin;
const HotModuleReplacementPlugin = require('webpack').HotModuleReplacementPlugin;
const UglifyJsPlugin = require('webpack').optimize.UglifyJsPlugin;

const CopyWebpackPlugin = require('copy-webpack-plugin');

const extractHTML = new HTMLWebpackPlugin({
  template: `./src/index.html`,
  filename: `index.html`,
});

const loaderOptions = new LoaderOptionsPlugin({
  options: {
    postcss: [
      require(`stylelint`),
      require('postcss-reporter')({ clearMessages: true }),
      require(`postcss-cssnext`),
    ],
  },
});

const copy = new CopyWebpackPlugin([
  {
    from: './src/assets/fonts',
    to: 'assets/fonts',
  },
  {
    context: './src/assets/',
    from: '**/*.+(png|webp|gif|jpe?g|json)',
    to: 'assets',
  },
], {
  ignore: ['.DS_Store'],
});

const config = {

  entry: [
    `./src/css/style.css`,
    './src/js/script.js',
  ],

  output: {
    path: path.join(__dirname, 'dist'),
    filename: `js/script.js`,
    publicPath: `/`,
  },

  devtool: 'sourcemap',

  devServer: {
    contentBase: './src',
    hot: true,
    port: 3000,
  },

  module: {

    rules: [
      {
        test: /\.css$/,
        loaders: [
          'style',
          `css?importLoaders=1`,
          `postcss`,
        ],
      },
      {
        test: /\.html$/,
        loaders: `html`,
      },
      {
        test: /\.js$/,
        loaders: `babel`,
      },
      {
        test: /\.(svg|png|jpe?g|gif|webp)$/,
        loaders: `url`,
        query: {
          limit: 1000,
          context: `./src`,
          name: `[path][name].[ext]`,
        },
      },
    ],

  },

  plugins: [
    new HotModuleReplacementPlugin(),
    extractHTML,
    loaderOptions,
    copy,
  ],

};

if (process.env.NODE_ENV === 'production') {
  const extractCSS = new ExtractTextPlugin(`css/style.css`);
  config.module.rules.shift();

  config.module.rules.push({
    test: /\.css$/,
    loaders: extractCSS.extract([
      `css?importLoaders=1`,
      `postcss`,
    ]),
  });

  config.module.rules.push({
    test: /\.(svg|png|jpe?g|gif)$/,
    loaders: `image-webpack`,
    enforce: 'pre',
  });

  config.plugins.shift();

  config.plugins = config.plugins.concat([
    extractCSS,
    new UglifyJsPlugin({
      sourceMap: true,
      comments: true,
    }),
  ]);
} else {
  config.entry.push('./src/index.html');
}

module.exports = config;

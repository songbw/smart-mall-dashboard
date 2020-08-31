'use strict'
const path = require('path')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const WebpackCdnPlugin = require('webpack-cdn-plugin')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const isDev = process.env.NODE_ENV === 'development'
const moment = require('moment')
process.env.VUE_APP_VERSION = require('./package.json').version + '.' + moment().format('MMDD-HHmm')
process.env.VUE_APP_NAME = process.env.ENV_TITLE || 'Smart Mall Dashboard' // page title

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: isDev,
  transpileDependencies: ['password-validator', 'url-regex', 'vue-hotzone', 'ip-regex', 'nanoid'],
  productionSourceMap: false,
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: process.env.VUE_APP_NAME,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    plugins: [
      new MomentLocalesPlugin({
        localesToKeep: []
      }),
      new WebpackCdnPlugin({
        modules: isDev ? [] : [
          {
            name: 'vue',
            var: 'Vue',
            version: '2.6.12',
            path: 'dist/vue.min.js'
          },
          {
            name: 'vue-router',
            var: 'VueRouter',
            version: '3.4.3',
            path: 'dist/vue-router.min.js'
          },
          {
            name: 'vuex',
            var: 'Vuex',
            version: '3.5.1',
            path: 'dist/vuex.min.js'
          },
          {
            name: 'element-ui',
            var: 'ELEMENT',
            version: '2.13.2',
            path: 'lib/index.js'
          },
          {
            name: 'axios',
            var: 'axios',
            version: '0.20.0',
            path: 'dist/axios.min.js'
          },
          {
            name: 'echarts',
            var: 'echarts',
            version: '4.9.0',
            path: 'dist/echarts.min.js'
          },
          {
            name: 'v-charts',
            var: 'VeIndex',
            version: '1.19.0',
            path: 'lib/index.min.js'
          },
          {
            name: 'xlsx',
            var: 'XLSX',
            version: '0.16.6',
            path: 'dist/xlsx.full.min.js'
          },
          {
            name: 'google-libphonenumber',
            var: 'libphonenumber',
            version: '3.2.12',
            path: 'dist/libphonenumber.min.js'
          },
          {
            name: 'cos-js-sdk-v5',
            var: 'COS',
            version: '0.5.27',
            path: 'dist/cos-js-sdk-v5.min.js'
          },
          {
            name: 'moment',
            var: 'moment',
            version: '2.27.0',
            path: 'moment.min.js'
          },
          {
            name: 'localforage',
            var: 'localforage',
            version: '1.9.0',
            path: 'dist/localforage.min.js'
          },
          {
            name: 'nprogress',
            var: 'NProgress',
            version: '0.2.0',
            path: 'nprogress.min.js'
          },
          {
            name: 'simple-crypto-js',
            var: 'SimpleCrypto',
            version: '3.0.0',
            path: 'dist/SimpleCrypto.min.js'
          }
        ],
        prodUrl: 'https://cdn.jsdelivr.net/npm/:name@:version/:path'
      })
    ]
  },
  chainWebpack(config) {
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  }
}

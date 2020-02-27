'use strict'
const path = require('path')
const MomentLocalesPlugin = require('moment-locales-webpack-plugin')
const WebpackCdnPlugin = require('webpack-cdn-plugin')
const defaultSettings = require('./src/settings.js')

function resolve(dir) {
  return path.join(__dirname, dir)
}

const isDev = process.env.NODE_ENV === 'development'
const moment = require('moment')
process.env.VUE_APP_VERSION = require('./package.json').version + '.' + moment().format('MMDD-HHmm')

const nameGatSn = process.env.VUE_APP_HOST === 'GAT-SN' ? defaultSettings.titleGatSn : ''
const nameGatZy = process.env.VUE_APP_HOST === 'GAT-ZY' ? defaultSettings.titleGatZy : ''
const name = nameGatSn || nameGatZy || defaultSettings.title || 'Smart Mall Dashboard' // page title
process.env.VUE_APP_NAME = name

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
  productionSourceMap: false,
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: name,
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
            version: '2.6.11',
            path: 'dist/vue.min.js'
          },
          {
            name: 'vue-router',
            var: 'VueRouter',
            version: '3.1.6',
            path: 'dist/vue-router.min.js'
          },
          {
            name: 'vuex',
            var: 'Vuex',
            version: '3.1.2',
            path: 'dist/vuex.min.js'
          },
          {
            name: 'element-ui',
            var: 'ELEMENT',
            version: '2.13.0',
            path: 'lib/index.js'
          },
          {
            name: 'axios',
            var: 'axios',
            version: '0.19.1',
            path: 'dist/axios.min.js'
          },
          {
            name: 'echarts',
            var: 'echarts',
            version: '4.6.0',
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
            version: '0.15.5',
            path: 'dist/xlsx.full.min.js'
          },
          {
            name: 'google-libphonenumber',
            var: 'libphonenumber',
            version: '3.2.6',
            path: 'dist/libphonenumber.min.js'
          },
          {
            name: 'cos-js-sdk-v5',
            var: 'COS',
            version: '0.5.22',
            path: 'dist/cos-js-sdk-v5.min.js'
          },
          {
            name: 'moment',
            var: 'moment',
            version: '2.24.0',
            path: 'moment.min.js'
          },
          {
            name: 'localforage',
            var: 'localforage',
            version: '1.7.3',
            path: 'dist/localforage.min.js'
          },
          {
            name: 'nprogress',
            var: 'NProgress',
            version: '0.2.0',
            path: 'nprogress.min.js'
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

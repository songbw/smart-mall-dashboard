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
process.env.VUE_APP_VERSION = require('./package.json').version + '.' + moment().format('MMDD')

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
            version: '2.6.10',
            path: 'dist/vue.min.js'
          },
          {
            name: 'vue-router',
            var: 'VueRouter',
            version: '3.1.3',
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
            version: '0.19.0',
            path: 'dist/axios.min.js'
          },
          {
            name: 'echarts',
            var: 'echarts',
            version: '4.5.0',
            path: 'dist/echarts.min.js'
          },
          {
            name: 'v-charts',
            var: 'echarts',
            version: '1.19.0',
            path: 'lib/index.min.js'
          },
          {
            name: 'xlsx',
            var: 'XLSX',
            version: '0.15.3',
            path: 'dist/xlsx.min.js'
          },
          {
            name: 'libphonenumber-js',
            var: 'libphonenumber',
            version: '1.7.29',
            path: 'bundle/libphonenumber-max.js'
          },
          {
            name: 'cos-js-sdk-v5',
            var: 'COS',
            version: '0.5.22',
            path: 'dist/cos-js-sdk-v5.min.js'
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

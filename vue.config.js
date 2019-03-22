process.env.VUE_APP_UPLOAD_URL = 'http://115.159.100.38:8080/upload/relative'
process.env.VUE_APP_AUTH_BASE_URL = 'http://115.159.100.38:8081/'
process.env.VUE_APP_USER_BASE_URL = 'http://115.159.100.38:8082/seller/'
process.env.VUE_APP_BASE_URL = 'http://115.159.100.38:8080/'

module.exports = {
  productionSourceMap: false,
  pluginOptions: {
    i18n: {
      locale: 'zh-CN',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  chainWebpack: config => {
    const svgRule = config.module.rule('svg')

    // clear all existing loaders.
    // if you don't do this, the loader below will be appended to
    // existing loaders of the rule.
    svgRule.uses.clear()

    // add replacement loader(s)
    svgRule.use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .tap(options => {
        return Object.assign({}, options, { symbolId: 'icon-[name]' })
      })
  },
  pwa: {
    workboxOptions: {
      importWorkboxFrom: 'local'
    }
  }
}

import Vue from 'vue'
import { getCosStsApi } from '@/api/app'

const COS = require('cos-js-sdk-v5')

const cos = new COS({
  getAuthorization: function (options, callback) {
    getCosStsApi().then(data => {
      callback({
        TmpSecretId: data.credentials && data.credentials.tmpSecretId,
        TmpSecretKey: data.credentials && data.credentials.tmpSecretKey,
        XCosSecurityToken: data.credentials && data.credentials.sessionToken,
        ExpiredTime: data.expiredTime
      })
    }).catch(e => {
      console.warn('Get cos sts error:' + e)
    })
  }
})

Vue.$cos = cos

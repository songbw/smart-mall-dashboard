import isEmpty from 'lodash/isEmpty'
import { getCosUrlApi } from '@/api/app'
import {
  storage_platform_id,
  default_app_id,
  role_vendor_name,
  platform_renter_id,
  vendor_status_approved
} from '@/utils/constants'
import { storageSetItem } from '@/utils/storage'
import {
  getProfileApi,
  getAppConfigListApi,
  getRenterListApi,
  getCompanyListOfRenterApi
} from '@/api/vendor'

const invalidAppIdList = ['test']

const getVendorAppIdList = (platformList, vendor) => {
  let appIdList = []
  let excludeAppIdList = []
  if (!isEmpty(vendor.appId)) {
    appIdList = vendor.appId.split(',')
  }
  if (!isEmpty(vendor.excludeAppId)) {
    excludeAppIdList = vendor.excludeAppId.split(',')
  }
  if (appIdList.length > 0) {
    return appIdList
  } else {
    return platformList.map(item => item.appId)
      .filter(appId => !excludeAppIdList.includes(appId))
  }
}

async function getVendorPlatformList(platformList) {
  let appIdList = []
  try {
    const { company } = await getProfileApi()
    appIdList = getVendorAppIdList(platformList, company)
  } catch (e) {
    console.warn('App store get vendor app list:' + e)
  }
  return appIdList
}

const state = {
  sidebar: {
    opened: true
  },
  ready: false,
  platformId: default_app_id,
  needSettings: true,
  cosUrl: `https://iwallet-1258175138.image.myqcloud.com`,
  platformList: [],
  vendorAppIdList: [], // The app id list of the login user
  renterList: [],
  vendorList: []
}

const mutations = {
  TOGGLE_SIDEBAR: state => {
    state.sidebar.opened = !state.sidebar.opened
  },
  CLOSE_SIDEBAR: state => {
    state.sidebar.opened = false
  },
  SET_READY: state => {
    state.ready = true
  },
  SET_COS_URL: (state, url) => {
    state.cosUrl = url
  },
  SET_PLATFORM_APP_LIST: (state, list) => {
    state.platformList = list.filter(
      item => !invalidAppIdList.includes(item.appId))
  },
  SET_VENDOR_APP_LIST: (state, vendorList) => {
    state.vendorAppIdList = vendorList.filter(
      appId => !invalidAppIdList.includes(appId))
    if (!state.vendorAppIdList.includes(state.platformId)) {
      state.platformId = state.vendorAppIdList[0]
    }
  },
  SET_PLATFORM_ID: (state, platformId) => {
    state.platformId = platformId
  },
  SET_NEED_SETTINGS: (state, need) => {
    state.needSettings = need
  },
  SET_RENTER_LIST: (state, list) => {
    state.renterList = list
  },
  SET_VENDOR_LIST: (state, list) => {
    state.vendorList = list
  }
}

const actions = {
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }) {
    commit('CLOSE_SIDEBAR')
  },
  async getCosUrl({ commit }) {
    try {
      const { data } = await getCosUrlApi()
      if ('cdnUrl' in data && !isEmpty(data.cdnUrl)) {
        commit('SET_COS_URL', data.cdnUrl)
      } else if ('baseUrl' in data && !isEmpty(data.baseUrl)) {
        commit('SET_COS_URL', data.baseUrl)
      }
    } catch (e) {
      console.warn('Store app cos url error:' + e)
    }
  },
  async getPlatformList({ commit, state, rootState }, force = false) {
    if (state.platformList.length > 0 && !force) {
      return
    }
    let vendorAppIdList = []
    const { user, vendor } = rootState
    const role = user.role
    const renterId = vendor.renter.id
    const { code, data } = await getAppConfigListApi(
      renterId && renterId !== platform_renter_id ? { renterId } : null
    )
    if (code === 200) {
      const platformList = data.map(
        item => ({ appId: item.appId, name: item.appName, renterId: item.renterId }))
      if (role === role_vendor_name) {
        vendorAppIdList = await getVendorPlatformList(platformList)
      } else {
        vendorAppIdList = platformList.map(item => item.appId)
      }
      commit('SET_PLATFORM_APP_LIST', platformList)
      commit('SET_VENDOR_APP_LIST', vendorAppIdList)
    }
  },
  async setPlatformId({ commit }, appId) {
    await storageSetItem(storage_platform_id, appId)
    commit('SET_PLATFORM_ID', appId)
  },
  async getRenterList({ commit, state }, force = false) {
    if (state.renterList.length > 0 && !force) {
      return
    }
    let renterList = []
    try {
      const params = {
        page: 1,
        limit: 1000,
        status: vendor_status_approved
      }
      const { code, data } = await getRenterListApi(params)
      if (code === 200) {
        renterList = data.rows.map(item => ({
          companyId: item.companyId,
          renterName: item.renterName,
          renterId: item.renterId
        }))
        commit('SET_RENTER_LIST', renterList)
      }
    } catch (e) {
      console.warn('App get renter list error:' + e)
    }
  },
  async getVendorList({ commit, state, rootState, dispatch }, force = false) {
    if (state.vendorList.length > 0 && !force) {
      return
    }
    try {
      const params = {
        page: 1,
        limit: 1000,
        status: vendor_status_approved
      }
      const platformList = state.platformList
      const { vendor } = rootState
      const renterId = vendor.renter.id
      if (renterId !== platform_renter_id) {
        params.renterId = this.renterId
      }
      if (platformList.length === 0) {
        await dispatch('getPlatformList')
      }
      const { code, data } = await getCompanyListOfRenterApi(params)
      if (code === 200) {
        const vendorList = data.rows.map(item => ({
          companyId: item.companyId,
          companyName: item.companyName,
          invoiceType: item.invoiceType,
          taxpayerType: item.taxpayerType,
          appIdList: getVendorAppIdList(platformList, item),
          renterIdList: Array.isArray(item.renterList) ? item.renterList.map(renter => renter.renterId) : []
        }))
        commit('SET_VENDOR_LIST', vendorList)
      }
    } catch (e) {
      console.warn(`App get vendor list error: ${e}`)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

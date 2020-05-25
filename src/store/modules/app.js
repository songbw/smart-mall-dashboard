import isEmpty from 'lodash/isEmpty'
import { getCosUrlApi } from '@/api/app'
import { storage_platform_id, default_app_id } from '@/utils/constants'
import { storageSetItem } from '@/utils/storage'
import { getAppPlatformListApi } from '@/api/products'
import { getProfileApi } from '@/api/vendor'

const invalidAppIdList = ['test']

async function getVendorPlatformList() {
  let appIdList = []
  let excludeAppIdList = []
  try {
    const { company } = await getProfileApi()
    if (!isEmpty(company.appId)) {
      appIdList = company.appId.split(',')
    }
    if (!isEmpty(company.excludeAppId)) {
      excludeAppIdList = company.excludeAppId.split(',')
    }
  } catch (e) {
    console.warn('App store get vendor app list:' + e)
  }
  return { appIdList, excludeAppIdList }
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
  vendorPlatformList: [] // The app id list of the login user
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
  SET_PLATFORM_LIST: (state, list) => {
    state.platformList = list.filter(
      item => !invalidAppIdList.includes(item.appId))
  },
  SET_VENDOR_LIST: (state, vendorList) => {
    state.vendorPlatformList = vendorList.filter(
      appId => !invalidAppIdList.includes(appId))
    if (!state.vendorPlatformList.includes(state.platformId)) {
      state.platformId = state.vendorPlatformList[0]
    }
  },
  SET_PLATFORM_ID: (state, platformId) => {
    state.platformId = platformId
  },
  SET_NEED_SETTINGS: (state, need) => {
    state.needSettings = need
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
  async getPlatformList({ commit }) {
    const { code, data } = await getAppPlatformListApi(
      { pageNo: 1, pageSize: 100 })
    if (code === 200) {
      const platformList = data.list.map(
        item => ({ appId: item.appId, name: item.name }))
      const { appIdList, excludeAppIdList } = await getVendorPlatformList()
      let vendorList = []
      if (appIdList.length > 0) {
        vendorList = appIdList
      } else {
        vendorList = platformList.map(item => item.appId)
          .filter(appId => !excludeAppIdList.includes(appId))
      }
      commit('SET_PLATFORM_LIST', platformList)
      commit('SET_VENDOR_LIST', vendorList)
    }
  },
  async setPlatformId({ commit }, appId) {
    await storageSetItem(storage_platform_id, appId)
    commit('SET_PLATFORM_ID', appId)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

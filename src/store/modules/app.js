import isEmpty from 'lodash/isEmpty'
import { getCosUrlApi } from '@/api/app'
import { storage_platform_id } from '@/utils/constants'
import { storageSetItem } from '@/utils/storage'
import { getAppPlatformListApi } from '@/api/products'

const state = {
  sidebar: {
    opened: true
  },
  ready: false,
  platformId: 'test',
  needSettings: true,
  cosUrl: `https://iwallet-1258175138.file.myqcloud.com`,
  platformList: [
  ]
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
    state.platformList = list
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
    const { code, data } = await getAppPlatformListApi({ pageNo: 1, pageSize: 100 })
    if (code === 200) {
      const appList = data.list.map(item => ({ appId: item.appId, name: item.name }))
      commit('SET_PLATFORM_LIST', appList)
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

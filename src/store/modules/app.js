import isEmpty from 'lodash/isEmpty'
import { getCosUrlApi } from '@/api/app'
import {
  storage_platform_id,
  default_app_id,
  role_vendor_name,
  platform_renter_id,
  vendor_status_approved, invalid_renter_id
} from '@/utils/constants'
import { storageRemoveItem, storageSetItem } from '@/utils/storage'
import {
  getProfileApi,
  getAppConfigListApi,
  getRenterListApi,
  getCompanyListOfRenterApi
} from '@/api/vendor'
import { RenterPermissions, VendorPermissions } from '@/utils/role-permissions'

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

async function getVendorPlatformList() {
  let appIdList = []
  let platformList = []
  try {
    const { company, renterList } = await getProfileApi()
    for (const renter of renterList.filter(item => item.renterId !== platform_renter_id)) {
      const { code, data } = await getAppConfigListApi({ renterId: renter.renterId })
      if (code === 200) {
        const renterAppList = data.map(
          item => ({ appId: item.appId, name: item.appName, renterId: item.renterId }))
        platformList = [...platformList, ...renterAppList]
      }
    }
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
  platformLoading: false,
  platformList: [],
  vendorAppIdList: [], // The app id list of the login user
  renterListLoading: false,
  renterList: [],
  vendorListLoading: false,
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
    if (state.vendorAppIdList.length > 0 && !state.vendorAppIdList.includes(state.platformId)) {
      state.platformId = state.vendorAppIdList[0]
    }
    if (state.vendorAppIdList.length === 0) {
      state.platformId = default_app_id
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
  },
  SET_DATA_LOADING: (state, data) => {
    if ('platformLoading' in data) {
      state.platformLoading = data.platformLoading
    }
    if ('renterListLoading' in data) {
      state.renterListLoading = data.renterListLoading
    }
    if ('vendorListLoading' in data) {
      state.vendorListLoading = data.vendorListLoading
    }
  },
  RESET_APP_DATA: (state) => {
    state.platformLoading = false
    state.platformList = []
    state.vendorAppIdList = []
    state.renterListLoading = false
    state.renterList = []
    state.vendorListLoading = false
    state.vendorList = []
    state.platformId = default_app_id
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
    if (state.platformLoading || (state.platformList.length > 0 && !force)) {
      return
    }
    let vendorAppIdList = []
    const { user, vendor } = rootState
    const role = user.role
    const renterId = vendor.renter.id
    if (renterId === invalid_renter_id) {
      return
    }
    commit('SET_DATA_LOADING', { platformLoading: true })
    try {
      if (role === role_vendor_name) {
        vendorAppIdList = await getVendorPlatformList()
        commit('SET_PLATFORM_APP_LIST', vendorAppIdList)
        commit('SET_VENDOR_APP_LIST', vendorAppIdList)
      } else {
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
      }
    } catch (e) {
      console.warn('App state get platform list error:' + e)
    } finally {
      commit('SET_DATA_LOADING', { platformLoading: false })
    }
  },
  async setPlatformId({ commit }, appId) {
    await storageSetItem(storage_platform_id, appId)
    commit('SET_PLATFORM_ID', appId)
  },
  async getRenterList({ commit, state, rootState }, force = false) {
    if (state.renterListLoading || (state.renterList.length > 0 && !force)) {
      return
    }
    const { user } = rootState
    const permissions = user.permissions
    if (!permissions.includes(RenterPermissions.view)) {
      return
    }
    let renterList = []
    try {
      commit('SET_DATA_LOADING', { renterListLoading: true })
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
    } finally {
      commit('SET_DATA_LOADING', { renterListLoading: false })
    }
  },
  async getVendorList({ commit, state, rootState, dispatch }, force = false) {
    if (state.vendorListLoading || (state.vendorList.length > 0 && !force)) {
      return
    }
    try {
      const params = {
        page: 1,
        limit: 1000,
        status: vendor_status_approved
      }
      const platformList = state.platformList
      const { user, vendor } = rootState
      const permissions = user.permissions
      if (!permissions.includes(VendorPermissions.view)) {
        return
      }
      commit('SET_DATA_LOADING', { vendorListLoading: true })
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
    } finally {
      commit('SET_DATA_LOADING', { vendorListLoading: false })
    }
  },
  async resetAppData({ commit }) {
    await storageRemoveItem(storage_platform_id)
    commit('RESET_APP_DATA')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

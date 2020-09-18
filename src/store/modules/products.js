import { product_state_all, vendor_status_approved } from '@/utils/constants'
import { getCompanyListOfRenterApi } from '@/api/vendor'

const queryTemplate = {
  offset: 1,
  limit: 20,
  query: '',
  skuid: '',
  brand: '',
  mpu: '',
  state: product_state_all,
  vendorId: '',
  renterId: '',
  firstCategoryId: null,
  secondCategoryId: null,
  thirdCategoryId: null,
  mpuPrefix: null
}

const state = {
  search: {
    ...queryTemplate
  },
  vendors: []
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    state.search = { ...state.search, ...params }
  },
  RESET_SEARCH_DATA: state => {
    state.search = { ...queryTemplate }
  },
  SET_FIRST_CATEGORY_ID: (state, params) => {
    state.search.firstCategoryId = params.firstCategoryId
  },
  SET_SECOND_CATEGORY_ID: (state, params) => {
    state.search.secondCategoryId = params.secondCategoryId
  },
  SET_THIRD_CATEGORY_ID: (state, params) => {
    state.search.thirdCategoryId = params.thirdCategoryId
  },
  SET_VENDOR_OPTIONS: (state, options) => {
    state.vendors = options
  }
}

const actions = {
  async getVendorList({ commit }) {
    try {
      const params = {
        page: 1,
        limit: 1000,
        status: vendor_status_approved
      }
      this.listLoading = true
      let vendors = []
      const { code, data } = await getCompanyListOfRenterApi(params)
      if (code === 200) {
        vendors = data.rows.map(row => {
          return {
            value: row.companyId.toString(),
            label: row.companyName,
            invoiceType: row.invoiceType,
            taxpayerType: row.taxpayerType,
            renterList: Array.isArray(row.renterList) ? row.renterList : []
          }
        })
      }
      commit('SET_VENDOR_OPTIONS', vendors)
    } catch (e) {
      console.warn('Product get vendor list error:' + e)
    } finally {
      this.listLoading = false
    }
  }
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
}

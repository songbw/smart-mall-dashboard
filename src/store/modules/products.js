import { product_state_all, vendor_status_approved } from '@/utils/constants'
import { getVendorListApi } from '@/api/vendor'

const queryTemplate = {
  offset: 1,
  limit: 20,
  query: '',
  skuid: '',
  brand: '',
  mpu: '',
  state: product_state_all,
  vendorId: '',
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
      const data = await getVendorListApi(params)
      const vendors = data.rows.map(row => {
        return {
          value: row.company.id.toString(),
          label: row.company.name,
          invoiceType: row.company.invoiceType,
          taxpayerType: row.company.taxpayerType
        }
      })
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

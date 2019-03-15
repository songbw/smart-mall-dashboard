import { getProductList, searchProductInfo } from '@/api/products'

const products = {
  state: {
    productsTotal: 0,
    productsData: []
  },
  mutations: {
    setProductsNum(state, total) {
      state.productsTotal = total
    },
    setProductsData(state, items) {
      state.productsData = items
    }
  },
  actions: {
    GetProductsData({ commit }, params) {
      return new Promise((resolve, reject) => {
        getProductList(params).then(response => {
          const data = response.result
          commit('setProductsNum', data.total)
          commit('setProductsData', data.list)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    SearchProductsData({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchProductInfo(params).then(response => {
          const data = response.result
          commit('setProductsNum', data.total)
          commit('setProductsData', data.list)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default products

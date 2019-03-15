import { getBrandList, updateBrandInfo, searchBrandInfo } from '@/api/brands'

const brands = {
  state: {
    brandsTotal: 0,
    brandsData: []
  },
  mutations: {
    setBrandsNum(state, total) {
      state.brandsTotal = total
    },
    setBrandsData(state, items) {
      state.brandsData = items
    }
  },
  actions: {
    GetBrandsData({ commit }, params) {
      return new Promise((resolve, reject) => {
        getBrandList(params).then(response => {
          const data = response.result
          commit('setBrandsNum', data.total)
          commit('setBrandsData', data.list)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    SearchBrandsData({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchBrandInfo(params).then(response => {
          const data = response.result
          commit('setBrandsNum', data.total)
          commit('setBrandsData', data.list)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    UpdateBrandsData({ state }, params) {
      return new Promise((resolve, reject) => {
        updateBrandInfo(params).then(response => {
          const data = response.result
          const brandId = params.brandId
          const brand = state.brandsData.find(item => item.brandId === brandId)
          if (brand) {
            brand.brandLogo = params.brandLogo
          }
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default brands

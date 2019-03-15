import {
  getAggregationPagesApi,
  createAggregationPageApi,
  updateAggregationPageApi,
  deleteAggregationPageApi,
  searchAggregationPagesApi,
  getAggregationPageByIdApi,
  updateAggregationPageContentApi
} from '@/api/aggregations'

import { bannerType, serviceType, gridType, promotionType, goodsType } from '@/utils/templateType'

const pako = require('pako')

const emptyAggregationPage = {
  id: -1,
  name: '',
  homePage: false,
  effectiveDate: '',
  backgroundColor: '#FFFFFF',
  content: []
}

const aggregations = {
  state: {
    aggregationTemplateIndex: -1,
    aggregationTotalNum: 0,
    aggregation: emptyAggregationPage,
    aggregationList: []
  },
  mutations: {
    setAggregationList(state, data) {
      state.aggregationList = data.list
      state.aggregationTotalNum = data.total
    },
    resetTemplatePage(state) {
      state.aggregation = Object.assign({}, emptyAggregationPage, { content: [] })
      state.aggregationTemplateIndex = -1
    },
    setCurrentAggregation(state, index) {
      if (index < state.aggregationList.length) {
        state.aggregation = state.aggregationList[index]
        if (state.aggregation.content.length > 1) {
          state.aggregationTemplateIndex = 0
        } else {
          state.aggregationTemplateIndex = -1
        }
      } else {
        state.aggregation = { ...emptyAggregationPage }
        state.aggregationTemplateIndex = -1
      }
    },
    setTemplateID(state, id) {
      state.aggregation.id = id
    },
    setTemplateAggregation(state, params) {
      state.aggregation.name = params.name
      state.aggregation.homePage = params.homePage
      state.aggregation.effectiveDate = params.effectiveDate
      state.aggregation.backgroundColor = params.backgroundColor
      if (params.hasOwnProperty('content') && params.content !== null) {
        state.aggregation.content = params.content
        if (params.content.length > 0) {
          state.aggregationTemplateIndex = 0
        }
      }
    },
    addTemplateContent(state, template) {
      state.aggregation.content.push(template)
    },
    deleteTemplateContent(state, index) {
      state.aggregation.content.splice(index, 1)
    },
    sortTemplateContent(state, params) {
      const up = params.up
      const index = params.index
      const item = state.aggregation.content.splice(index, 1)[0]
      const newIndex = up ? (index - 1) : (index + 1)
      state.aggregation.content.splice(newIndex, 0, item)
    },
    setCurrentTemplateIndex(state, index) {
      state.aggregationTemplateIndex = index
    },
    sortItemInTemplateContent(state, params) {
      let distance = 1
      if (params.hasOwnProperty('distance')) {
        distance = params.distance
      }
      const up = params.up
      const index = params.index
      const newIndex = up ? (index - distance) : (index + distance)
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      const item = template.data.list.splice(index, 1)[0]
      template.data.list.splice(newIndex, 0, item)
    },
    deleteItemInTemplateContent(state, index) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      const length = template.data.list.length
      if (index >= 0 && index < length) {
        template.data.list.splice(index, 1)
      }
    },
    setListInTemplateContent(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (params.index >= 0) {
        template.data.list.splice(params.index, 1)
        const item = Object.assign({}, params.value)
        template.data.list.splice(params.index, 0, item)
      } else {
        const item = Object.assign({}, params.value)
        template.data.list.push(item)
      }
    },
    setTemplateBannerSettings(state, margin) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      template.data.settings.marginBottom = margin
    },
    setTemplateGridSettings(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === gridType) {
        template.data.settings = { ...params }
      }
    },
    changeTemplateGridListContent(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === gridType) {
        const index = params.index
        if (index === -1) {
          template.data.list.push(params.value)
        } else {
          template.data.list[index].count = params.value.count
          template.data.list[index].grids = params.value.grids
        }
      }
    },
    removeTemplateGridListContent(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === gridType) {
        const index = params.index
        if (index !== -1) {
          template.data.list.splice(index, 1)
        }
      }
    },
    setTemplateGoodsSettings(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === goodsType) {
        template.data.settings = { ...params }
      }
    },
    changeTemplateGoodsListContent(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === goodsType) {
        const index = params.index
        if (index === -1) {
          template.data.list.push(params.value)
        } else {
          template.data.list[index].title = params.value.title
          template.data.list[index].skus = params.value.skus
        }
      }
    },
    sortTemplateGoodsListContent(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === goodsType) {
        const up = params.up
        const index = params.index
        const item = template.data.list.splice(index, 1)[0]
        const newIndex = up ? (index - 1) : (index + 1)
        template.data.list.splice(newIndex, 0, item)
      }
    },
    removeTemplateGoodsListContent(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === goodsType) {
        const index = params.index
        if (index !== -1) {
          template.data.list.splice(index, 1)
        }
      }
    },
    setTemplateServiceSettings(state, margin) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      template.data.settings.marginBottom = margin
    },
    setTemplatePromotionSettings(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === promotionType) {
        template.data.settings = { ...params }
      }
    },
    changeTemplatePromotionListContent(state, params) {
      const template = state.aggregation.content[state.aggregationTemplateIndex]
      if (template.type === promotionType) {
        const len = template.data.list.length
        template.data.list.splice(0, len)
        params.forEach(item => {
          template.data.list.push(Object.assign({}, item))
        })
      }
    }
  },
  actions: {
    getAggregationPages({ commit }, params) {
      return new Promise((resolve, reject) => {
        getAggregationPagesApi(params).then(response => {
          const data = response.result
          data.list.forEach(item => {
            if (item.content === null) {
              item.content = []
            } else {
              const jsonString = pako.inflate(item.content, { to: 'string' })
              item.content = JSON.parse(jsonString)
            }
          })
          commit('setAggregationList', data)
          resolve(data.list.length)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getAggregationPageById({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        if (params.id === state.aggregation.id &&
          state.aggregation.content !== null &&
          state.aggregation.content.length > 0) {
          commit('setCurrentTemplateIndex', 0)
          resolve(state.aggregation)
        } else {
          getAggregationPageByIdApi(params).then(response => {
            const data = response.result
            const jsonString = pako.inflate(data.content, { to: 'string' })
            data.content = JSON.parse(jsonString)
            if (data.id === state.aggregation.id) {
              commit('setTemplateAggregation', data)
            }
            resolve(data)
          }).catch(error => {
            reject(error)
          })
        }
      })
    },
    createAggregationPage({ commit }, params) {
      return new Promise((resolve, reject) => {
        createAggregationPageApi(params).then(response => {
          const id = response.aggregationId
          commit('setTemplateID', id)
          commit('setTemplateAggregation', params)
          resolve(id)
        }).catch(error => {
          reject(error)
        })
      })
    },
    updateAggregationPage({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        updateAggregationPageApi(params).then(() => {
          commit('setTemplateAggregation', params)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    deleteAggregationPage({ commit }, params) {
      return new Promise((resolve, reject) => {
        deleteAggregationPageApi(params).then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    searchAggregationPages({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchAggregationPagesApi(params).then((response) => {
          const data = response.result
          data.list.forEach(item => {
            if (item.content === null) {
              item.content = []
            } else {
              const jsonString = pako.inflate(item.content, { to: 'string' })
              item.content = JSON.parse(jsonString)
            }
          })
          commit('setAggregationList', data)
          resolve(data.list.length)
        }).catch(error => {
          reject(error)
        })
      })
    },
    saveAggregationPageContent({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        if (state.aggregation.id !== -1) {
          const binString = pako.deflate(JSON.stringify(state.aggregation.content), { to: 'string' })
          updateAggregationPageContentApi({
            id: state.aggregation.id,
            content: binString
          }).then(() => {
            commit('resetTemplatePage')
            resolve()
          }).catch(error => {
            reject(error)
          })
        }
      })
    },
    addAggregationTemplate({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        commit('addTemplateContent', params)
        resolve(state.aggregation.content.length)
      })
    },
    deleteAggregationTemplate({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        commit('deleteTemplateContent', params)
        resolve(state.aggregation.content.length)
      })
    },
    sortAggregationTemplate({ commit }, params) {
      return new Promise((resolve, reject) => {
        commit('sortTemplateContent', params)
        resolve(params.up ? (params.index - 1) : (params.index + 1))
      })
    },
    sortAggregationBannerTemplate({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        const template = state.aggregation.content[state.aggregationTemplateIndex]
        if (template.type === bannerType) {
          commit('sortItemInTemplateContent', params)
          resolve(params.up ? (params.index - 1) : (params.index + 1))
        } else {
          reject()
        }
      })
    },
    sortAggregationServiceTemplate({ commit, state }, params) {
      return new Promise((resolve, reject) => {
        const template = state.aggregation.content[state.aggregationTemplateIndex]
        if (template.type === serviceType) {
          commit('sortItemInTemplateContent', params)
          resolve(params.up ? (params.index - 1) : (params.index + 1))
        } else {
          reject()
        }
      })
    }
  }
}

export default aggregations

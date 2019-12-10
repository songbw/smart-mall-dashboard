import {
  createAggregationApi,
  getAggregationByIdApi,
  updateAggregationApi,
  updateAggregationContentApi,
  getAggregationGroupsApi,
  createAggregationGroupApi,
  updateAggregationGroupApi,
  deleteAggregationGroupApi
} from '@/api/aggregations'
import moment from 'moment'

const templateKeys = [
  'id', 'status', 'name', 'homePage', 'effectiveDate', 'backgroundColor', 'header', 'groupId', 'appId'
]

const template = {
  id: -1,
  status: 0,
  name: '',
  homePage: -1,
  effectiveDate: '',
  backgroundColor: '#FFFFFF',
  groupId: 0,
  header: null,
  appId: null,
  content: []
}

const state = {
  search: {
    name: '',
    status: -1,
    homePage: -1,
    offset: 1,
    limit: 20,
    order: 'desc'
  },
  aggregation: { ...template },
  contentIndex: 0,
  groups: [],
  groupId: -1
}

const mutations = {
  SET_SEARCH_DATA: (state, params) => {
    state.search = { ...state.search, ...params }
  },
  RESET_CURRENT_DATA: state => {
    state.aggregation = { ...template }
    state.aggregation.content = []
    state.aggregation.groupId = state.groupId > 0 ? state.groupId : 0
  },
  SET_CURRENT_DATA: (state, params) => {
    templateKeys.forEach(key => {
      if (key in params) {
        state.aggregation[key] = params[key]
      }
    })
    if ('content' in params && params.content !== null) {
      state.aggregation.content = params.content
      if (params.content.length > 0) {
        state.aggregationTemplateIndex = 0
      }
    }
  },
  SET_CONTENT_INDEX: (state, index) => {
    state.contentIndex = index
  },
  SORT_CONTENT: (state, params) => {
    const up = params.up
    const index = params.index
    const item = state.aggregation.content.splice(index, 1)[0]
    const newIndex = up ? (index - 1) : (index + 1)
    state.aggregation.content.splice(newIndex, 0, item)
  },
  ADD_CONTENT: (state, template) => {
    state.aggregation.content.push(template)
  },
  DELETE_CONTENT: (state, index) => {
    state.aggregation.content.splice(index, 1)
  },
  SET_LIST_IN_CONTENT(state, params) {
    const template = state.aggregation.content[state.contentIndex]
    if (params.index >= 0) {
      if (params.index < template.data.list.length) {
        template.data.list.splice(params.index, 1)
        const item = { ...params.value }
        template.data.list.splice(params.index, 0, item)
      }
    } else {
      const item = { ...params.value }
      template.data.list.push(item)
    }
  },
  SORT_ITEM_IN_CONTENT: (state, params) => {
    let distance = 1
    if ('distance' in params) {
      distance = params.distance
    }
    const up = params.up
    const index = params.index
    const newIndex = up ? (index - distance) : (index + distance)
    const template = state.aggregation.content[state.contentIndex]
    const item = template.data.list.splice(index, 1)[0]
    template.data.list.splice(newIndex, 0, item)
  },
  DELETE_ITEM_IN_CONTENT: (state, index) => {
    const template = state.aggregation.content[state.contentIndex]
    const length = template.data.list.length
    if (index >= 0 && index < length) {
      template.data.list.splice(index, 1)
    }
  },
  CLEAR_ITEMS_IN_CONTENT: (state) => {
    const template = state.aggregation.content[state.contentIndex]
    const len = template.data.list.length
    template.data.list.splice(0, len)
  },
  SET_CONTENT_SETTINGS: (state, params) => {
    const template = state.aggregation.content[state.contentIndex]
    template.data.settings = { ...params }
  },
  SET_GOODS_LIST: (state, params) => {
    const template = state.aggregation.content[state.contentIndex]
    const index = params.index
    if (index === -1) {
      template.data.list.push(params.value)
    } else {
      if ('title' in params.value) {
        template.data.list[index].title = params.value.title
      }
      if ('skus' in params.value) {
        template.data.list[index].skus = params.value.skus
      }
    }
  },
  SET_GRID_LIST: (state, params) => {
    const template = state.aggregation.content[state.contentIndex]
    const index = params.index
    if (index === -1) {
      template.data.list.push(params.value)
    } else {
      template.data.list[index].count = params.value.count
      template.data.list[index].grids = params.value.grids
    }
  },
  SET_PROMOTION_LIST: (state, params) => {
    const template = state.aggregation.content[state.contentIndex]
    const len = template.data.list.length
    template.data.list.splice(0, len)
    params.forEach(item => {
      template.data.list.push({ ...item })
    })
  },
  SET_PROMOTION_LIST_CONTENT: (state, params) => {
    const template = state.aggregation.content[state.contentIndex]
    const len = template.data.list.length
    if (params.index < len) {
      template.data.list[params.index].intro = params.intro
    }
  },
  SET_COUPON_LIST: (state, params) => {
    const template = state.aggregation.content[state.contentIndex]
    const len = template.data.list.length
    template.data.list.splice(0, len)
    params.forEach(item => {
      template.data.list.push({ ...item })
    })
  },
  SET_GROUP_LIST: (state, list) => {
    state.groups = list
  },
  SET_GROUP_ID: (state, id) => {
    state.groupId = id
  }
}

const actions = {
  async getPageById({ commit }, params) {
    const { code, data } = await getAggregationByIdApi(params)
    if (code === 200 && data.result) {
      const page = {}
      templateKeys.forEach(key => {
        if (key in data.result) {
          page[key] = data.result[key]
        }
      })
      page.content = JSON.parse(data.result.content)
      commit('SET_CURRENT_DATA', page)
      return page.id
    } else {
      return -1
    }
  },
  async createPage({ commit }, params) {
    const { data } = await createAggregationApi(params)
    const id = data.aggregationId
    commit('SET_CURRENT_DATA', { id, ...params, content: [] })
    return id
  },
  async updatePage({ commit }, params) {
    await updateAggregationApi(params)
    commit('SET_CURRENT_DATA', { ...params })
  },
  async savePageContent({ state }) {
    if (state.aggregation.id !== -1) {
      await updateAggregationContentApi({
        id: state.aggregation.id,
        content: JSON.stringify(state.aggregation.content)
      })
    }
  },
  async getGroups({ commit }, params) {
    const { data } = await getAggregationGroupsApi(params)
    commit('SET_GROUP_LIST', data.result.list)
    return data.result.total
  },
  async createGroup({ commit, state }, params) {
    const { data } = await createAggregationGroupApi(params)
    const id = data.id
    const list = state.groups.concat([{ id: id, name: params.name }])
    commit('SET_GROUP_LIST', list)
  },
  async updateGroup({ commit, state }, params) {
    await updateAggregationGroupApi(params)
    const list = state.groups.map(
      group => group.id === params.id ? { ...params } : { ...group }
    )
    commit('SET_GROUP_LIST', list)
  },
  async deleteGroup({ commit, state }, params) {
    await deleteAggregationGroupApi(params)
    const list = state.groups.filter(group => group.id !== params.id)
    commit('SET_GROUP_LIST', list)
  },
  async clonePage({ commit }, params) {
    const id = params.id
    const { code, data } = await getAggregationByIdApi({ id })
    if (code === 200 && data.result) {
      const now = moment().format('YYYY-MM-DD')
      const clonePage = {
        appId: params.appId,
        name: params.name,
        homePage: data.result.homePage,
        backgroundColor: data.result.backgroundColor,
        header: data.result.header,
        effectiveDate: now,
        groupId: null
      }
      const cloneRes = await createAggregationApi(clonePage)
      if (cloneRes.code === 200) {
        const cloneId = cloneRes.data.aggregationId
        await updateAggregationContentApi({
          id: cloneId,
          content: data.result.content
        })
        return cloneId
      }
    }
    return -1
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

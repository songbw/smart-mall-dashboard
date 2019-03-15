import Cookies from 'js-cookie'
import { getCosUrlsApi } from '@/api/app'

const app = {
  state: {
    sidebar: {
      opened: !+Cookies.get('sidebarStatus'),
      withoutAnimation: false
    },
    cosUrl: 'http://iwallet-1258175138.file.myqcloud.com',
    device: 'desktop'
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        Cookies.set('sidebarStatus', 1)
      } else {
        Cookies.set('sidebarStatus', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
      state.sidebar.withoutAnimation = false
    },
    CLOSE_SIDEBAR: (state, withoutAnimation) => {
      Cookies.set('sidebarStatus', 1)
      state.sidebar.opened = false
      state.sidebar.withoutAnimation = withoutAnimation
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    SET_COS_URL: (state, url) => {
      state.cosUrl = url
    }
  },
  actions: {
    ToggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    CloseSideBar({ commit }, { withoutAnimation }) {
      commit('CLOSE_SIDEBAR', withoutAnimation)
    },
    ToggleDevice({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    GetCosUrl: ({ commit }) => {
      return new Promise((resolve, reject) => {
        getCosUrlsApi().then((response) => {
          if (response.hasOwnProperty('cdnUrl')) {
            commit('SET_COS_URL', response.cdnUrl)
          } else if (response.hasOwnProperty('baseUrl')) {
            commit('SET_COS_URL', response.baseUrl)
          }
          resolve()
        }).catch(err => {
          console.log('GetCosUrl:' + err)
          reject()
        })
      })
    }
  }
}

export default app

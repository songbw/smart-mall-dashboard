import {
  getCategoryInfo,
  getMainCategories,
  getSubCategories,
  updateCategoryInfo,
  searchCategoryInfo
} from '@/api/categories'

const categories = {
  state: {
    firstClassTotal: 0,
    allClassesDataLoaded: false,
    allClassesDataInLoading: false,
    allClassesData: []
  },
  getters: {
    firstClassCategories: state => {
      const categories = []
      state.allClassesData.forEach(item => {
        const copiedCat = Object.assign({}, item, { subs: [] })
        categories.push(copiedCat)
      })
      return categories
    },
    topTwoClassCategories: state => {
      const categories = []
      state.allClassesData.forEach(item => {
        const copiedCat = Object.assign({}, item, { subs: [] })
        if (item.subs && item.subs.length > 0) {
          item.subs.forEach(subItem => {
            const subCopied = Object.assign({}, subItem, { subs: [] })
            copiedCat.subs.push(subCopied)
          })
        }
        categories.push(copiedCat)
      })
      return categories
    },
    thirdClassCategoriesByID: state => category => {
      const firstClass = state.allClassesData.find(item => item.categoryId === category.parentId)
      if (firstClass) {
        const secondClass = firstClass.subs.find(item => item.categoryId === category.categoryId)
        return secondClass.subs
      } else {
        return []
      }
    },
    findCategoryByRelationID: state => relation => {
      const grandCategory = state.allClassesData.find(item => item.categoryId === relation.grandID)
      if (relation.parentID) {
        if (grandCategory) {
          const parentCategory = grandCategory.subs.find(item => item.categoryId === relation.parentID)
          if (relation.childID) {
            return parentCategory.subs.find(item => item.categoryId === relation.childID)
          } else {
            return parentCategory
          }
        } else {
          return null
        }
      } else {
        return grandCategory
      }
    }
  },
  mutations: {
    setFirstClassNum(state, total) {
      state.firstClassTotal = total
    },
    setAllClassesDataLoaded(state, loaded) {
      state.allClassesDataLoaded = loaded
    },
    setAllClassesDataInLoading(state, loading) {
      state.allClassesDataInLoading = loading
    },
    setFirstClassData(state, data) {
      const length = state.allClassesData.length
      const index = (data.pageNo - 1) * data.pageSize
      if (data.total > length && length <= index && data.list.length > 0) {
        state.allClassesData = state.allClassesData.concat(data.list)
      }
    },
    addAllSubClassData(state, category) {
      const firsClass = state.allClassesData.find(item => item.categoryId === category.categoryId)
      category.subs.forEach(sec => {
        sec.subs.forEach(third => {
          delete third.subs
        })
      })
      if (firsClass) {
        firsClass.subs = category.subs
      }
    }
  },
  actions: {
    getAllCategoryData({ dispatch, commit, state }, params) {
      commit('setAllClassesDataLoaded', false)
      commit('setAllClassesDataInLoading', true)
      return new Promise((resolve, reject, state) => {
        dispatch('getMainCategoryData', params).then(data => {
          commit('setFirstClassNum', data.total)
          commit('setFirstClassData', data)
          if (data.list.length > 0) {
            const promises = data.list.map(item => {
              const categoryParams = {
                id: item.categoryId,
                includeSub: true
              }
              return dispatch('getCategoryDataByID', categoryParams).then(category => {
                if (category.length > 0) {
                  commit('addAllSubClassData', category[0])
                }
              })
            })
            Promise.all(promises).then(() => {
              commit('setAllClassesDataLoaded', true)
              resolve(data.total)
            }).catch(error => {
              reject(error)
            }).finally(() => {
              commit('setAllClassesDataInLoading', false)
            })
          } else {
            commit('setAllClassesDataInLoading', false)
            resolve(0)
          }
        }).catch(errer => {
          commit('setAllClassesDataInLoading', false)
          reject(errer)
        })
      })
    },
    getMainCategoryData({ commit }, params) {
      return new Promise((resolve, reject) => {
        getMainCategories(params).then(response => {
          const data = response.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getSubCategoryData({ commit }, params) {
      return new Promise((resolve, reject) => {
        getSubCategories(params).then(response => {
          const data = response.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    getCategoryDataByID({ commit }, params) {
      return new Promise((resolve, reject) => {
        getCategoryInfo(params).then(response => {
          const data = response.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },
    updateCategoryInfoByID({ commit, getters }, info) {
      return new Promise((resolve, reject) => {
        updateCategoryInfo({ categoryId: info.categoryId, categoryIcon: info.categoryIcon }).then(response => {
          const categoryID = info.categoryId
          const parentID = info.parentId
          const grandID = info.grandId
          const classID = info.categoryClass
          let category = null
          switch (classID) {
            case '1': {
              category = getters.findCategoryByRelationID({ grandID: categoryID })
              break
            }
            case '2': {
              category = getters.findCategoryByRelationID({ grandID: parentID, parentID: categoryID })
              break
            }
            case '3': {
              category = getters.findCategoryByRelationID({ grandID: grandID, parentID: parentID, childID: categoryID })
              break
            }
          }
          if (category) {
            category.categoryIcon = info.categoryIcon
          }
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    searchCategoryDataInfo({ commit }, params) {
      return new Promise((resolve, reject) => {
        searchCategoryInfo(params).then(response => {
          const data = response.result
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    }
  }
}

export default categories

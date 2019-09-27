import Vue from 'vue'

export function getBulletinListApi(params) {
  return Vue.axios('bulletins').request({
    url: '/vendors/bulletin/find',
    method: 'get',
    params
  })
}

export function createBulletinApi(params) {
  return Vue.axios('bulletins').request({
    url: '/vendors/bulletin/create',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateBulletinApi(params) {
  return Vue.axios('bulletins').request({
    url: '/vendors/bulletin/update',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function updateBulletinStateApi(params) {
  return Vue.axios('bulletins').request({
    url: '/vendors/bulletin/state',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function deleteBulletinApi(params) {
  return Vue.axios('bulletins').request({
    url: '/vendors/bulletin/delete',
    method: 'delete',
    params
  })
}

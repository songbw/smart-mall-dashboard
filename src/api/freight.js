import Vue from 'vue'

export function getFreeShippingListApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminFreeShip/find',
    method: 'get',
    params
  })
}

export function createFreeShippingApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminFreeShip/create',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateFreeShippingApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminFreeShip/update',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function deleteFreeShippingApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminFreeShip/delete',
    method: 'delete',
    params
  })
}

export function deleteFreeShippingRegionApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminFreeShip/deleteRegions',
    method: 'delete',
    params
  })
}

export function addFreeShippingRegionApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminFreeShip/createRegions',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getFreeShippingDetailApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminFreeShip/findById',
    method: 'get',
    params
  })
}

export function getShippingPriceListApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminShip/find',
    method: 'get',
    params
  })
}

export function createShippingPriceApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminShip/create',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateShippingPriceApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminShip/update',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function deleteShippingPriceApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminShip/delete',
    method: 'delete',
    params
  })
}

export function getShippingPriceDetailApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminShip/findById',
    method: 'get',
    params
  })
}

export function deleteShippingPriceRegionApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminShip/deleteRegions',
    method: 'delete',
    params
  })
}

export function addShippingPriceRegionApi(params) {
  return Vue.axios('freights').request({
    url: '/freights/adminShip/createRegions',
    method: 'post',
    data: {
      ...params
    }
  })
}

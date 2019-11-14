import Vue from 'vue'

export function getMemberListApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/user/list',
    method: 'get',
    params
  })
}

export function getMemberProfileByIdApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/user/profile',
    method: 'get',
    params
  })
}

export function getMemberProfileByOpenIdApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/user',
    method: 'get',
    params
  })
}

export function getMemberBalanceApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/balance',
    method: 'get',
    params
  })
}

export function createMemberBalanceApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/balance',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function rechargeMemberBalanceApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/balance',
    method: 'put',
    data: {
      ...params
    }
  })
}

export function getMemberBalanceFlowApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/balance/detail/all',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getAllMemberBalancesApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/balance/all',
    method: 'post',
    data: {
      ...params
    }
  })
}

export function batchInitBalancesApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/balance/init',
    method: 'post',
    data: params
  })
}

export function getMemberAddressListApi(params) {
  return Vue.axios('members')({
    url: '/orders/admin/receiver/user',
    method: 'get',
    params
  })
}

export function getMemberCardListApi(params) {
  return Vue.axios('members')({
    url: '/wocs/woc/cardinfo/getcardlist',
    method: 'post',
    data: {
      ...params
    }
  })
}

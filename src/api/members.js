import Vue from 'vue'

export function getMembersApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/user/list',
    method: 'get',
    params
  })
}

export function getMemberProfileApi(params) {
  return Vue.axios('members')({
    url: '/ssoes/user/profile',
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

export function getMemberAddressListApi(params) {
  return Vue.axios('members')({
    url: '/orders/admin/receiver/user',
    method: 'get',
    params
  })
}

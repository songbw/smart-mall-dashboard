import Vue from 'vue'

export function getProfileApi() {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/profile',
    method: 'get'
  })
}

export function createProfileApi(data) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/profile',
    method: 'post',
    data
  })
}

export function updateProfileApi(data) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/profile',
    method: 'put',
    data
  })
}

export function submitProfileApi(data) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/status',
    method: 'put'
  })
}

export function getVendorListApi(params) {
  return Vue.axios('vendor').request({
    url: '/vendors/companies/list',
    method: 'get',
    params
  })
}

export function reviewVendorProfileApi(params) {
  const data = {
    status: params.status,
    comments: params.comments
  }
  return Vue.axios('vendor').request({
    url: `/vendors/companies/${params.id}/status`,
    method: 'put',
    data
  })
}

export function deleteVendorApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/companies/${params.id}`,
    method: 'delete'
  })
}

export function getVendorProfileByIdApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/vendors/companyById`,
    method: 'get',
    params
  })
}

export function getVendorUserListApi(params) {
  return Vue.axios('vendor').request({
    url: '/vendors/users/list',
    method: 'get',
    params
  })
}

export function setUserVendorApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/users/company`,
    method: 'put',
    data: {
      ...params
    }
  })
}

export function getVendorProfileApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/vendors/${params.id}`,
    method: 'get'
  })
}

export function createVendorUserApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/users`,
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateVendorUserApi(params) {
  const { userId, ...rest } = params
  return Vue.axios('vendor').request({
    url: `/vendors/users/${userId}`,
    method: 'put',
    data: {
      ...rest
    }
  })
}

export function deleteVendorUserApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/users/${params.id}`,
    method: 'delete'
  })
}

export function createVendorProfileApi(params) {
  return Vue.axios('vendor').request({
    url: `/vendors/companies/admin/profile`,
    method: 'post',
    data: {
      ...params
    }
  })
}

export function getVendorRolesApi() {
  return Vue.axios('vendor').request({
    url: `/vendors/users/roles/list`,
    method: 'get'
  })
}

export function createVendorRoleApi(params) {
  return Vue.axios('vendor').request({
    url: `vendors/users/roles`,
    method: 'post',
    data: {
      ...params
    }
  })
}

export function updateVendorRoleApi(params) {
  const { id, ...rest } = params
  return Vue.axios('vendor').request({
    url: `vendors/users/roles/${id}`,
    method: 'put',
    data: {
      ...rest
    }
  })
}

export function getRolePermissionsApi() {
  return Vue.axios('vendor').request({
    url: `/vendors/users/permissions/list`,
    method: 'get'
  })
}

export function updateRolePermissionApi(params) {
  const { id, ...rest } = params
  return Vue.axios('vendor').request({
    url: `vendors/users/permissions/${id}`,
    method: 'put',
    data: {
      ...rest
    }
  })
}

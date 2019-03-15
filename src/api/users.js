import request from '@/utils/userRequest'

export function getUserInfo(username) {
  return request({
    url: 'user/info',
    method: 'get',
    params: { username }
  })
}

export function userLogout(username) {
  return request({
    url: 'userLogout',
    method: 'post',
    data: {
      username: username,
      code: '0000'
    }
  })
}

export function userSearch(data) {
  return request({
    url: 'user/list',
    method: 'post',
    data: {
      loginName: data.loginName,
      zhName: data.zhName,
      enName: data.enName,
      email: data.email,
      sex: data.sex,
      phone: data.phone,
      createTimeStart: data.createTimeStart,
      createTimeEnd: data.createTimeEnd,
      updateTimeStart: data.updateTimeStart,
      updateTimeEnd: data.updateTimeEnd,
      pageIndex: data.pageIndex,
      pageSize: data.pageSize
    }
  })
}

export function deleteByName(username) {
  return request({
    url: 'user/deleteByName',
    method: 'post',
    data: {
      username: username,
      code: '',
      password: '',
      oldPassword: ''
    }
  })
}

export function getOrgList() {
  return request({
    url: 'role/org/listAll',
    method: 'get',
    params: { }
  })
}

export function getOrgTree() {
  return request({
    url: 'role/org/tree',
    method: 'get',
    params: { }
  })
}

export function getUserOrgList(id) {
  return request({
    url: 'role/org/userInTree',
    method: 'get',
    params: { id }
  })
}

export function userUpdate(data) {
  return request({
    url: 'user/update',
    method: 'post',
    data: {
      id: data.id,
      loginName: data.username,
      zhName: data.zhName,
      enName: data.enName,
      sex: data.sex,
      birth: data.birth,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: data.password,
      createTime: '',
      updateTime: '',
      createBy: '',
      updateBy: '',
      organizationId: data.organization,
      permissionIds: data.permissionIds
    }
  })
}

export function userInsert(data) {
  return request({
    url: 'user/insert',
    method: 'post',
    data: {
      id: null,
      loginName: data.username,
      zhName: data.zhName,
      enName: data.enName,
      sex: data.sex,
      birth: data.birth,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: data.password,
      createTime: '',
      updateTime: '',
      createBy: '',
      updateBy: '',
      organizationId: data.organization,
      permissionIds: data.permissionIds
    }
  })
}

export function getPermissionGroups() {
  return request({
    url: 'permission/group/list',
    method: 'get',
    params: { }
  })
}

export function addPermissionGroup(data) {
  return request({
    url: 'permission/group/insert',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      code: data.code,
      isFinal: 1
    }
  })
}

export function setPermissionGroup(data) {
  return request({
    url: 'permission/group/update',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      code: data.code,
      isFinal: 1
    }
  })
}

export function deletePermissionGroup(row) {
  return request({
    url: 'permission/group/delete',
    method: 'post',
    data: {
      id: row.id,
      name: row.name,
      description: row.description,
      code: row.code,
      isFinal: 1
    }
  })
}

export function getPermissions() {
  return request({
    url: 'permission/listAll',
    method: 'get',
    params: { }
  })
}

export function getRoles() {
  return request({
    url: 'role/listByUser',
    method: 'get',
    params: { }
  })
}

export function getPermissionIdByRole(id) {
  return request({
    url: 'permission/listByRole',
    method: 'get',
    params: {
      roleId: id
    }
  })
}
export function permissionSearch(data) {
  return request({
    url: 'permission/list',
    method: 'post',
    data: {
      data: {
        name: data.name,
        description: data.description,
        code: data.code,
        sysPermissionGroupId: data.groupId
      },
      pageIndex: data.pageIndex,
      pageSize: data.pageSize
    }
  })
}

export function permissionDelete(id) {
  return request({
    url: 'permission/delete',
    method: 'post',
    data: {
      id: id
    }
  })
}

export function permissionInsert(data) {
  return request({
    url: 'permission/insert',
    method: 'post',
    data: {
      name: data.name,
      description: data.description,
      code: data.code,
      sysPermissionGroupId: data.groupId
    }
  })
}

export function permissionUpdate(data) {
  return request({
    url: 'permission/update',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      code: data.code,
      sysPermissionGroupId: data.groupId
    }
  })
}

export function searchRole(data) {
  return request({
    url: 'role/listSpecial',
    method: 'post',
    data: {
      name: data.name,
      description: data.description,
      permissionGroups: data.permissionGroups,
      permissionCodes: data.permissions
    }
  })
}

export function deleteRole(data) {
  return request({
    url: 'role/deleteById',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      permissionGroups: data.permissionGroups,
      permissionCodes: data.permissions
    }
  })
}

export function insertRole(data) {
  return request({
    url: 'role/insert',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      permissionGroups: data.permissionIds,
      permissionCodes: data.codes
    }
  })
}

export function updateRole(data) {
  return request({
    url: 'role/update',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      description: data.description,
      permissionGroups: data.permissionIds,
      permissionCodes: data.codes
    }
  })
}

export function searchOrganization(data) {
  return request({
    url: 'role/org/listSpecial',
    method: 'post',
    data: {
      data: {
        id: data.id,
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        roleIds: data.roleIds
      },
      pageIndex: data.pageIndex,
      pageSize: data.pageSize
    }
  })
}

export function deleteOrganization(data) {
  return request({
    url: 'role/org/delete',
    method: 'post',
    data: {
      id: data.id,
      name: data.name,
      fullName: data.fullName,
      description: data.description,
      parentId: data.parentId,
      rank: data.rank,
      roleIds: data.roleIds
    }
  })
}

export function updateOrganization(data) {
  return request({
    url: 'role/org/update',
    method: 'post',
    data: {
        id: data.id,
        name: data.name,
        fullName: data.fullName,
        description: data.description,
        parentId: data.parentId,
        rank: data.rank,
        roleIds: data.roleIds
    }
  })
}

export function insertOrganization(data) {
  return request({
    url: 'role/org/insert',
    method: 'post',
    data: {
      name: data.name,
      fullName: data.fullName,
      description: data.description,
      parentId: data.parentId,
      isFinal: data.isFinal,
      roleIds: data.roleIds
    }
  })
}

export function searchLog(data) {
  return request({
    url: 'log/search',
    method: 'post',
    data: {
      data: {
        user: data.user,
        param: data.param,
        method: data.method,
        url: data.url,
        createTimeStart: data.createTimeStart,
        createTimeEnd: data.createTimeEnd
      },
      pageIndex: data.pageIndex,
      pageSize: data.pageSize
    }
  })
}

export function deleteLog(id) {
  return request({
    url: 'log/deleteById',
    method: 'post',
    data: {
      id: id
    }
  })
}

export function deleteLogList(ids) {
  return request({
    url: 'log/deleteByIdList',
    method: 'post',
    data: {
      idList: ids
    }
  })
}

export function shrinkLog() {
  return request({
    url: 'log/shrink',
    method: 'post',
    data: {
    }
  })
}


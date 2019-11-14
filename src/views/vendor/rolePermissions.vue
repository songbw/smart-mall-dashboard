<template>
  <div>
    <el-table
      v-loading="listLoading"
      :data="rolePermissions"
      border
      fit
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限描述" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="权限代码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasEditPermission"
        label="操作"
        align="center"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import {
  getRolePermissionsApi,
  updateRolePermissionApi
} from '@/api/vendor'
import { RolePermissions } from '@/utils/role-permissions'

export default {
  name: 'RolePermissions',
  data() {
    return {
      listLoading: false,
      rolePermissions: []
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(RolePermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(RolePermissions.update)
    }
  },
  created() {
    this.getRolePermissions()
  },
  methods: {
    async getRolePermissions() {
      if (this.hasViewPermission) {
        this.listLoading = true
        try {
          const { list } = await getRolePermissionsApi()
          if (Array.isArray(list) && list.length > 0) {
            this.rolePermissions = list
          }
        } catch (e) {
          console.warn('Get role permissions error:' + e)
        } finally {
          this.listLoading = false
        }
      }
    },
    async handleEdit(row) {
      try {
        const { value } = await this.$prompt('请输入角色权限描述', '修改角色权限', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        if (!isEmpty(value.trim())) {
          await updateRolePermissionApi({ id: row.id, description: value.trim() })
          this.getRolePermissions()
        }
      } catch (e) {
        console.warn('Vendor role edit error ' + e)
      }
    }
  }
}
</script>

<style scoped>

</style>

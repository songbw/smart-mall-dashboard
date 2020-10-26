<template>
  <div>
    <div v-if="hasCreatePermission" style="margin-bottom: 10px">
      <el-button type="primary" @click="dialogCreationVisible = true">创建角色</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="vendorRoles"
      border
      fit
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色描述" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色权限" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.permissionsDesc }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasEditPermission"
        label="操作"
        align="center"
        width="240"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.row)"
          >
            编辑角色
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleEditPermissions(scope.row)"
          >
            修改权限
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="dialogCreationVisible"
      title="创建角色"
    >
      <el-form ref="roleForm" :model="roleForm" :rules="roleRules" label-width="120px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" autocomplete="off" maxlength="50" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" autocomplete="off" maxlength="50" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelCreation">取消</el-button>
        <el-button type="primary" @click="handleConfirmCreation">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="dialogPermissionVisible"
      title="修改权限"
      width="850px"
    >
      <el-form ref="roleForm" :model="permissionForm" :rules="permissionRules" label-width="120px">
        <el-form-item label="角色描述">
          <span>{{ permissionForm.description }}</span>
        </el-form-item>
        <el-form-item label="角色权限" prop="permissions">
          <el-transfer
            v-model="permissionForm.permissions"
            :titles="['未添加权限', '已添加权限']"
            :button-texts="['删除', '添加']"
            :props="{key: 'id',label: 'name'}"
            :data="permissionOptions"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelPermissions">取消</el-button>
        <el-button type="primary" @click="handleConfirmPermissions">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import {
  getVendorRolesApi,
  createVendorRoleApi,
  updateVendorRoleApi,
  getRolePermissionsApi
} from '@/api/vendor'
import { RolePermissions } from '@/utils/role-permissions'

export default {
  name: 'VendorRoles',
  data() {
    return {
      listLoading: false,
      vendorRoles: [],
      permissionList: [],
      dialogCreationVisible: false,
      dialogPermissionVisible: false,
      roleForm: {
        name: '',
        description: ''
      },
      roleRules: {
        name: [{
          required: true, validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入角色名称'))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }],
        description: [{
          required: true, validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入角色描述'))
            } else {
              callback()
            }
          },
          trigger: 'change'
        }]
      },
      permissionForm: {
        id: null,
        description: '',
        permissions: []
      },
      permissionRules: {}
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasCreatePermission() {
      return this.userPermissions.includes(RolePermissions.create)
    },
    hasViewPermission() {
      return this.userPermissions.includes(RolePermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(RolePermissions.update)
    },
    permissionOptions() {
      return this.dialogPermissionVisible ? this.permissionList : []
    }
  },
  created() {
    this.prepareData()
  },
  methods: {
    async prepareData() {
      if (this.hasViewPermission) {
        await this.getRolePermissions()
        await this.getVendorRoles()
      }
    },
    async getRolePermissions() {
      this.listLoading = true
      try {
        const { list } = await getRolePermissionsApi()
        if (Array.isArray(list) && list.length > 0) {
          this.permissionList = list
        }
      } catch (e) {
        console.warn('Get role permissions error:' + e)
      } finally {
        this.listLoading = false
      }
    },
    async getVendorRoles() {
      this.listLoading = true
      try {
        const { list } = await getVendorRolesApi()
        if (Array.isArray(list) && list.length > 0) {
          this.vendorRoles = list.map(role => {
            const { permissions, ...others } = role
            let permissionsDesc = ''
            let permissionList = []
            if (!isEmpty(permissions) && this.permissionList.length > 0) {
              const permissionIds = permissions.split(',')
                .filter(item => isEmpty(item.trim()) === false)
                .map(item => Number.parseInt(item))
              permissionList = this.permissionList.filter(permission => permissionIds.includes(permission.id))
              permissionsDesc = permissionList.reduce(
                (desc, permission) => isEmpty(desc) ? permission.name : desc + ',' + permission.name, '')
            }
            return { ...others, permissionsDesc, permissions: permissionList }
          })
        }
      } catch (e) {
        console.warn('Get vendor roles error :' + e)
      } finally {
        this.listLoading = false
      }
    },
    handleCancelCreation() {
      this.dialogCreationVisible = false
      this.roleForm.name = ''
      this.roleForm.description = ''
      this.$refs.roleForm.clearValidate()
    },
    handleConfirmCreation() {
      this.$refs.roleForm.validate(async (valid) => {
        if (valid) {
          this.dialogCreationVisible = false
          try {
            await createVendorRoleApi(this.roleForm)
            this.getVendorRoles()
            this.roleForm.name = ''
            this.roleForm.description = ''
          } catch (e) {
            console.warn('Create vendor role error:' + e)
          }
        }
      })
    },
    async handleEdit(row) {
      try {
        const { value } = await this.$prompt('请输入角色描述名称', '修改角色', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        if (!isEmpty(value.trim())) {
          await updateVendorRoleApi({ id: row.id, description: value.trim() })
          this.getVendorRoles()
        }
      } catch (e) {
        console.warn('Vendor role edit error ' + e)
      }
    },
    handleEditPermissions(row) {
      this.permissionForm.id = row.id
      this.permissionForm.description = row.description
      this.permissionForm.permissions = row.permissions.map(item => item.id)
      this.dialogPermissionVisible = true
    },
    handleCancelPermissions() {
      this.permissionForm.permissions = []
      this.dialogPermissionVisible = false
    },
    async handleConfirmPermissions() {
      try {
        this.dialogPermissionVisible = false
        await this.$confirm(`将修改此角色${this.permissionForm.description}的权限, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const permissions = this.permissionForm.permissions.join(',')
        this.permissionForm.permissions = []
        await updateVendorRoleApi({ id: this.permissionForm.id, permissions })
        this.getVendorRoles()
      } catch (e) {
        console.warn('Vendor role edit error ' + e)
      }
    }
  }
}
</script>

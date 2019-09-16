<template>
  <div class="app-container">
    <div v-if="isAdminUser" style="margin-bottom: 10px">
      <el-button type="primary" @click="dialogCreationVisible = true">创建角色</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="vendorRoles"
      border
      fit
      style="width: 60%;"
    >
      <el-table-column label="角色编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="角色描述" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="isAdminUser"
        label="操作"
        align="center"
        width="100"
        class-name="small-padding fixed-width"
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
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="dialogCreationVisible"
      title="创建角色"
    >
      <el-form ref="roleForm" :model="roleForm" :rules="roleRules" label-width="120px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" autocomplete="off" maxlength="10" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" autocomplete="off" maxlength="10" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelCreation">取消</el-button>
        <el-button type="primary" @click="handleConfirmCreation">确定</el-button>
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
  updateVendorRoleApi
} from '@/api/vendor'

export default {
  name: 'VendorRoles',
  data() {
    return {
      listLoading: false,
      vendorRoles: [],
      dialogCreationVisible: false,
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
      }
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser'
    })
  },
  created() {
    this.getVendorRoles()
  },
  methods: {
    async getVendorRoles() {
      this.listLoading = true
      try {
        const { list } = await getVendorRolesApi()
        if (Array.isArray(list) && list.length > 0) {
          this.vendorRoles = list
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
      this.$refs.roleForm.validate(async(valid) => {
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
    }
  }
}
</script>

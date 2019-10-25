<template>
  <div class="app-container">
    <el-form inline>
      <el-form-item label="登录名">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="电话号码">
        <el-input v-model="queryPhone" placeholder="输入电话号码" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getUsersData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div style="margin-bottom: 20px">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreateUser">
        创建新用户
      </el-button>
    </div>
    <el-table
      ref="vendorTable"
      v-loading="dataLoading"
      :data="userData"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="60">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录名" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.loginName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话号码" align="center" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户角色" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ getRoleDescription(scope.row.role) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="公司名称" align="center">
        <template slot-scope="scope">
          <span class="el-link el-link--primary is-underline" @click="handleViewVendorInfo(scope.$index)">
            {{ scope.row.company ? scope.row.company.name: '未填写公司' }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="400">
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEditUserVendor(scope.$index)"
          >
            修改公司
          </el-button>
          <el-button size="mini" type="info" @click="handleEditUserPhone(scope.$index)">
            修改电话
          </el-button>
          <el-button
            :disabled="scope.row.role === 'admin'"
            size="mini"
            type="success"
            @click="handleEditUserRole(scope.$index)"
          >
            修改角色
          </el-button>
          <el-button
            :disabled="scope.row.role === 'admin'"
            size="mini"
            type="danger"
            @click="handleDeleteUser(scope.$index)"
          >
            删除用户
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="userTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getUsersData"
    />
    <vendor-detail
      :dialog-visible="vendorInfoDialogVisible"
      :company="currentVendor"
      @onConfirmed="vendorInfoDialogVisible = false"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="vendorEditDialogVisible"
      title="修改用户公司"
      width="30%"
    >
      <el-form ref="vendorForm" v-loading="vendorLoading" :model="vendorForm" :rules="vendorRules" label-width="80px">
        <el-form-item label="登录名">
          <el-input :value="vendorForm.loginName" readonly />
        </el-form-item>
        <el-form-item label="企业列表" prop="companyId">
          <el-select :value="vendorForm.companyId" placeholder="请选择企业名称" @change="onVendorSelected">
            <el-option
              v-for="item in vendorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelSetVendor">取消</el-button>
        <el-button type="primary" @click="handleSetUserVendor">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="userDialogVisible"
      title="创建商户管理员"
      width="30%"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        label-width="80px"
      >
        <el-form-item label="登录名" prop="loginName">
          <el-input
            :value="userForm.loginName"
            placeholder="请输入登录名"
            maxlength="20"
            @input="onLoginNameChanged"
          />
        </el-form-item>
        <el-form-item label="初始密码" prop="password">
          <el-input
            v-model="userForm.password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirm">
          <el-input
            v-model="userForm.confirm"
            type="password"
            placeholder="再次输入密码"
          />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="userForm.phone"
            type="tel"
            placeholder="输入手机号码"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleUserDialogCancel">取消</el-button>
        <el-button type="primary" @click="handleUserDialogConfirm">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="phoneEditDialogVisible"
      title="修改用户电话"
      width="30%"
    >
      <el-form ref="phoneForm" :model="phoneForm" :rules="phoneRules" label-width="80px">
        <el-form-item label="登录名">
          <el-input :value="phoneForm.loginName" readonly />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input
            v-model="phoneForm.phone"
            type="tel"
            placeholder="输入手机号码"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelSetPhone">取消</el-button>
        <el-button type="primary" @click="handleSetUserPhone">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="roleEditDialogVisible"
      title="修改用户角色"
      width="30%"
    >
      <el-form ref="roleForm" v-loading="roleLoading" :model="roleForm" :rules="roleRules" label-width="80px">
        <el-form-item label="登录名">
          <el-input :value="roleForm.loginName" readonly />
        </el-form-item>
        <el-form-item label="角色列表" prop="role">
          <el-select v-model="roleForm.role" placeholder="请选择角色">
            <el-option
              v-for="item in roleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelSetRole">取消</el-button>
        <el-button type="primary" @click="handleSetUserRole">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import VendorDetail from './detail'
import {
  getVendorUserListApi,
  getVendorListApi,
  setUserVendorApi,
  createVendorUserApi,
  updateVendorUserApi,
  deleteVendorUserApi,
  getVendorRolesApi
} from '@/api/vendor'
import {
  vendor_status_approved
} from '@/utils/constants'
import {
  validUserName,
  validPhone
} from '@/utils/validate'

export default {
  name: 'UserManager',
  filters: {
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  components: { Pagination, VendorDetail },
  data() {
    const validateUsername = (rule, value, callback) => {
      if (validUserName(value) === false) {
        callback(new Error('请输入3-20个以字母开头的用户名'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error('请输入长度不少于6位的密码'))
      } else if (value === this.userForm.username) {
        callback(new Error('请输入与用户名不一致的密码'))
      } else {
        callback()
      }
    }
    const validateConfirm = (rule, value, callback) => {
      if (value.length < 6 || value !== this.userForm.password) {
        callback(new Error('请确保输入同样密码'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!isEmpty(value) && validPhone(value) === false) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
    return {
      dataLoading: false,
      queryName: '',
      queryPhone: '',
      queryOffset: 1,
      queryLimit: 20,
      userData: [],
      userTotal: 0,
      vendorInfoDialogVisible: false,
      currentVendor: {
        name: '',
        licenceUrl: null,
        address: '',
        industry: '',
        createTime: null,
        updateTime: null,
        comments: '',
        status: 0
      },
      userDialogVisible: false,
      vendorLoading: false,
      vendorEditDialogVisible: false,
      vendorForm: {
        userId: null,
        loginName: '',
        companyId: null
      },
      vendorRules: {
        companyId: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择对应的企业'))
            } else {
              callback()
            }
          }
        }]
      },
      userForm: {
        userId: null,
        loginName: '',
        phone: '',
        password: '',
        confirm: ''
      },
      userRules: {
        loginName: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        confirm: [{ required: true, trigger: 'blur', validator: validateConfirm }],
        phone: [{ required: false, trigger: 'blur', validator: validatePhone }]
      },
      phoneEditDialogVisible: false,
      phoneForm: {
        userId: null,
        loginName: '',
        phone: ''
      },
      phoneRules: {
        phone: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (validPhone(value) === false) {
              callback(new Error('请输入正确的手机号码'))
            } else {
              callback()
            }
          }
        }]
      },
      vendorOptions: [],
      roleEditDialogVisible: false,
      roleOptions: [],
      roleLoading: false,
      roleForm: {
        userId: null,
        loginName: '',
        role: null
      },
      roleRules: {
        role: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择对应的角色'))
            } else {
              callback()
            }
          }
        }]
      }
    }
  },
  created() {
    this.getUsersData()
    this.getVendorList()
  },
  methods: {
    async getUsersData() {
      try {
        if (this.roleOptions.length === 0) {
          await this.getVendorRoleList()
        }
        const params = {
          page: this.queryOffset,
          limit: this.queryLimit
        }
        if (!isEmpty(this.queryPhone)) {
          params.phone = this.queryPhone
        }
        if (!isEmpty(this.queryName)) {
          params.name = this.queryName
        }
        this.dataLoading = true
        const data = await getVendorUserListApi(params)
        this.userData = data.rows
        this.userTotal = data.total
      } catch (e) {
        console.warn('Get vendor user list error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    handleViewVendorInfo(index) {
      if (this.userData[index].company) {
        this.currentVendor = this.userData[index].company
        this.vendorInfoDialogVisible = true
      }
    },
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 100,
          status: vendor_status_approved
        }
        this.vendorLoading = true
        const data = await getVendorListApi(params)
        this.vendorOptions = data.rows.map(row => {
          return {
            value: row.company.id,
            label: row.company.name
          }
        })
      } catch (e) {
        console.warn('Vendor user manager get vendor list error:' + e)
      } finally {
        this.vendorLoading = false
      }
    },
    handleEditUserVendor(index) {
      if (this.vendorOptions.length === 0) {
        this.getVendorList()
      }
      this.vendorEditDialogVisible = true
      this.vendorForm.companyId = null
      this.vendorForm.userId = this.userData[index].id
      this.vendorForm.loginName = this.userData[index].loginName
    },
    handleEditUserPhone(index) {
      this.phoneForm.userId = this.userData[index].id
      this.phoneForm.loginName = this.userData[index].loginName
      this.phoneForm.phone = ''
      this.phoneEditDialogVisible = true
    },
    handleEditUserRole(index) {
      this.roleForm.userId = this.userData[index].id
      this.roleForm.loginName = this.userData[index].loginName
      this.roleForm.role = null
      this.roleEditDialogVisible = true
    },
    onVendorSelected(value) {
      this.vendorForm.companyId = value
    },
    handleCancelSetVendor() {
      this.vendorEditDialogVisible = false
      this.$refs.vendorForm.clearValidate()
    },
    async handleSetUserVendor() {
      try {
        const valid = await this.$refs.vendorForm.validate()
        if (!valid) {
          return
        }
      } catch (e) {
        console.warn('handleSetUserVendor error:' + e)
        return
      }
      if (this.vendorForm.companyId !== null && this.vendorForm.userId !== null) {
        this.vendorEditDialogVisible = false
        try {
          const name = this.vendorOptions.find(item => item.value === this.vendorForm.companyId).label
          await this.$confirm(`将此用户添加为公司${name}的管理员, 是否继续?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          await setUserVendorApi({ userId: this.vendorForm.userId, companyId: this.vendorForm.companyId })
          this.getUsersData()
          this.$message.success('修改用户企业成功！')
        } catch (e) {
          console.warn('Vendor user manager set company error:' + e)
          this.$message.error('修改用户企业失败，请联系管理员！')
        }
      }
    },
    handleCreateUser() {
      this.userForm.userId = null
      this.userForm.loginName = ''
      this.userForm.phone = ''
      this.userForm.password = ''
      this.userForm.confirm = ''
      this.userDialogVisible = true
    },
    onLoginNameChanged(value) {
      this.userForm.loginName = trim(value)
    },
    handleUserDialogCancel() {
      this.$refs.userForm.clearValidate()
      this.userDialogVisible = false
    },
    async handleUserDialogConfirm() {
      try {
        const valid = await this.$refs.userForm.validate()
        if (valid) {
          this.handleStartCreateUser()
        }
      } catch (e) {
        console.log(`handleUserDialogConfirm:${e}`)
      }
    },
    async handleStartCreateUser() {
      try {
        const params = {
          loginName: this.userForm.loginName,
          password: this.userForm.password,
          roleId: 2 // Vendor role
        }
        if (!isEmpty(this.userForm.phone)) {
          params.phone = this.userForm.phone
        }
        await createVendorUserApi(params)
        this.userDialogVisible = false
        this.getUsersData()
      } catch (e) {
        console.warn('Create user error: ' + e)
        const msg = this.getErrorMessage(e)
        if (msg) {
          this.$message.error(msg)
        }
      }
    },
    getErrorMessage(error) {
      if (error.response) {
        const status = error.response.status
        if (status >= 400) {
          const data = error.response.data
          const errno = Number.parseInt(data.error)
          if (!Number.isNaN(errno)) {
            return data.message + '，请确认后重试！'
          }
        } else if (status >= 500) {
          return '服务平台出现问题，请联系管理员！'
        }
      }
      return null
    },
    handleCancelSetPhone() {
      this.$refs.phoneForm.clearValidate()
      this.phoneEditDialogVisible = false
    },
    async handleSetUserPhone() {
      try {
        const valid = await this.$refs.phoneForm.validate()
        if (valid) {
          this.phoneEditDialogVisible = false
          await updateVendorUserApi({
            userId: this.phoneForm.userId,
            phone: this.phoneForm.phone
          })
          this.$message.success('修改用户电话成功！')
          this.getUsersData()
        }
      } catch (e) {
        console.log(`handleUserDialogConfirm:${e}`)
      }
    },
    async handleDeleteUser(index) {
      try {
        const name = this.userData[index].loginName
        await this.$confirm(`删除用户${name}，将导致对应的商户无法管理, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteVendorUserApi({ id: this.userData[index].id })
        this.getUsersData()
      } catch (e) {
        console.warn('Delete user:' + e)
      }
    },
    getRoleDescription(role) {
      const find = this.roleOptions.find(option => option.value === role)
      return find ? find.label : ''
    },
    async getVendorRoleList() {
      try {
        this.roleLoading = true
        const { list } = await getVendorRolesApi()
        if (Array.isArray(list) && list.length > 0) {
          this.roleOptions = list.map(item => ({ id: item.id, value: item.name, label: item.description }))
        }
      } catch (e) {
        console.warn('Get vendor role list error:' + e)
      } finally {
        this.roleLoading = false
      }
    },
    handleCancelSetRole() {
      this.roleEditDialogVisible = false
      this.$refs.roleForm.clearValidate()
    },
    handleSetUserRole() {
      this.$refs.roleForm.validate(async valid => {
        if (valid) {
          this.roleEditDialogVisible = false
          try {
            const roleId = this.roleOptions.find(option => option.value === this.roleForm.role).id
            await updateVendorUserApi({
              userId: this.roleForm.userId,
              roleId
            })
            this.$message.success('修改用户角色成功！')
            this.getUsersData()
          } catch (e) {
            console.warn('Vendor update role error:' + e)
            this.$message.warning('修改用户角色失败，请联系管理员！')
          }
        }
      })
    }
  }
}
</script>

<style scoped>

</style>

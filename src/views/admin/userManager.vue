<template>
  <div class="app-container">
    <el-form inline>
      <el-form-item label="登录名">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="电话号码">
        <el-input v-model="queryPhone" placeholder="输入电话号码" clearable />
      </el-form-item>
      <el-form-item v-if="queryVendorRole || queryRenterRole" label="公司名称">
        <vendor-selection
          :vendor-id="queryCompanyId"
          :company-type="queryVendorRole ? 'vendor' : 'renter'"
          @changed="onVendorChanged"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getUsersData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>

    <div style="margin-bottom: 20px">
      <el-tabs v-if="queryVendorRole" v-model="tabVendorRole" type="card" @tab-click="onVendorTabChanged">
        <el-tab-pane label="商户管理员" :name="vendorAdminRole">
          <el-button v-if="hasEditPermission" type="primary" icon="el-icon-plus" @click="handleCreateUser">
            新建管理员
          </el-button>
        </el-tab-pane>
        <el-tab-pane label="商户操作员" :name="vendorOperatorRole">
          <el-button v-if="hasEditPermission" type="primary" icon="el-icon-plus" @click="handleCreateUser">
            新建操作员
          </el-button>
        </el-tab-pane>
      </el-tabs>
      <el-button v-else-if="hasEditPermission" type="primary" icon="el-icon-plus" @click="handleCreateUser">
        {{ queryWatcherRole ? '新建观察员' : '新建管理员' }}
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
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="登录名" align="center" width="200">
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
      <el-table-column label="所属公司" align="center">
        <template slot-scope="scope">
          <span> {{ scope.row.company ? scope.row.company.name : '未填写公司' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="hasEditPermission" label="操作" align="center" width="320">
        <template slot-scope="scope">
          <el-button
            :disabled="!scope.row.ownVendor"
            type="warning"
            size="mini"
            @click="handleEditUserVendor(scope.$index)"
          >
            修改公司
          </el-button>
          <el-button
            :disabled="!scope.row.ownVendor"
            size="mini"
            type="info"
            @click="handleEditUserPhone(scope.$index)"
          >
            修改电话
          </el-button>
          <el-button
            :disabled="scope.row.role === platformAdminRole || !scope.row.ownVendor"
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
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="vendorEditDialogVisible"
      title="修改用户公司"
    >
      <el-form ref="vendorForm" v-loading="vendorLoading" :model="vendorForm" :rules="vendorRules" label-width="6rem">
        <el-form-item label="登录名">
          <span>{{ vendorForm.loginName }}</span>
        </el-form-item>
        <el-form-item label="企业列表" prop="companyId">
          <vendor-selection
            :vendor-id="vendorForm.companyId"
            :company-type="queryVendorRole ? vendorAdminRole : renterAdminRole"
            @changed="onVendorSelected"
          />
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
      :title="queryWatcherRole ? '新建观察员' : '新建管理员'"
    >
      <el-form
        ref="userForm"
        :model="userForm"
        :rules="userRules"
        label-width="6rem"
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
        <el-form-item label="企业列表" prop="companyId">
          <vendor-selection
            :vendor-id="userForm.companyId"
            :company-type="queryVendorRole ? vendorAdminRole : renterAdminRole"
            @changed="onUserVendorSelected"
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
    >
      <el-form ref="phoneForm" :model="phoneForm" :rules="phoneRules" label-width="6rem">
        <el-form-item label="登录名">
          <span>{{ phoneForm.loginName }}</span>
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
    >
      <el-form ref="roleForm" v-loading="roleLoading" :model="roleForm" :rules="roleRules" label-width="6rem">
        <el-form-item label="登录名">
          <span>{{ roleForm.loginName }}</span>
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
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination/index'
import VendorSelection from '@/components/VendorSelection/index'
import {
  createVendorUserApi,
  deleteVendorUserApi,
  getVendorRolesApi,
  getVendorUserListApi,
  setUserVendorApi,
  updateVendorUserApi
} from '@/api/vendor'
import {
  platform_renter_id,
  role_admin_name,
  role_renter_name,
  role_vendor_name,
  role_vendor_op_name,
  role_watcher_name
} from '@/utils/constants'
import { validPhone, validUserName } from '@/utils/validate'
import { RenterPermissions, VendorPermissions } from '@/utils/role-permissions'

export default {
  name: 'UserManager',
  filters: {
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  components: { Pagination, VendorSelection },
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
      if (isEmpty(value) || validPhone(value) === false) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    }
    const validateCompany = (rule, value, callback) => {
      if (value === null || value === '') {
        callback(new Error('请选择对应的企业'))
      } else {
        callback()
      }
    }
    return {
      platformAdminRole: role_admin_name,
      renterAdminRole: role_renter_name,
      vendorAdminRole: role_vendor_name,
      watcherAdminRole: role_watcher_name,
      vendorOperatorRole: role_vendor_op_name,
      tabVendorRole: role_vendor_name,
      dataLoading: false,
      routerName: '',
      vendorRoleId: -1,
      renterRoleId: -1,
      adminRoleId: -1,
      queryName: '',
      queryPhone: '',
      vendorAdminRoleId: null,
      vendorOpRoleId: null,
      queryRoleId: null,
      queryCompanyId: null,
      queryOffset: 1,
      queryLimit: 20,
      userData: [],
      userTotal: 0,
      userDialogVisible: false,
      vendorLoading: false,
      vendorEditDialogVisible: false,
      vendorForm: {
        userId: null,
        loginName: '',
        companyId: null
      },
      vendorRules: {
        companyId: [{ required: true, trigger: 'change', validator: validateCompany }]
      },
      userForm: {
        userId: null,
        loginName: '',
        phone: '',
        password: '',
        confirm: '',
        companyId: null
      },
      userRules: {
        loginName: [{ required: true, trigger: 'change', validator: validateUsername }],
        password: [{ required: true, trigger: 'change', validator: validatePassword }],
        confirm: [{ required: true, trigger: 'change', validator: validateConfirm }],
        phone: [{ required: true, trigger: 'change', validator: validatePhone }],
        companyId: [{ required: true, trigger: 'change', validator: validateCompany }]
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
  computed: {
    ...mapGetters({
      renterId: 'renterId',
      userPermissions: 'userPermissions',
      vendorList: 'vendorList'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(VendorPermissions.userView)
    },
    hasEditPermission() {
      return this.userPermissions.includes(VendorPermissions.userUpdate)
    },
    hasRenterPermission() {
      return this.userPermissions.includes(RenterPermissions.view)
    },
    queryVendorRole() {
      return this.routerName === 'VendorAdminManager'
    },
    queryRenterRole() {
      return this.routerName === 'RenterAdminManager'
    },
    queryAdminRole() {
      return this.routerName === 'PlatformAdminManager'
    },
    queryWatcherRole() {
      return this.routerName === 'WatcherAdminManager'
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      this.routerName = this.$route.name
      await this.getVendorRoleList()
      await this.getVendorList()
      await this.getUsersData()
    },
    async getVendorList() {
      this.dataLoading = true
      await this.$store.dispatch('app/getVendorList', true)
      this.dataLoading = false
    },
    async getUsersData() {
      if (this.hasViewPermission) {
        await this.handleGetUsersData()
      } else {
        this.$message.warning('没有查看商户管理员的权限，请联系管理员！')
      }
    },
    async handleGetUsersData() {
      let list = []
      let total = 0
      if (this.queryRoleId === null) {
        this.$message.warning('获取管理员角色失败，请联系管理员！')
        return
      }
      try {
        const params = {
          page: this.queryOffset,
          limit: this.queryLimit,
          roleId: this.queryRoleId
        }
        if (this.queryVendorRole && !this.hasRenterPermission) {
          params.renterId = this.renterId
        }
        if (!isEmpty(this.queryPhone)) {
          params.phone = this.queryPhone
        }
        if (!isEmpty(this.queryName)) {
          params.name = this.queryName
        }
        if (this.queryCompanyId !== null) {
          params.companyId = this.queryCompanyId
        }
        this.dataLoading = true
        const data = await getVendorUserListApi(params)
        if (data && Array.isArray(data.rows)) {
          list = data.rows.map(item => {
            const companyId = item.company ? item.company.id : -1
            const companyInfo = companyId >= 0 ? this.vendorList.find(vendor => vendor.companyId === companyId) : null
            const hasPlatformRenter = companyInfo && companyInfo.renterIdList
              ? companyInfo.renterIdList.includes(platform_renter_id)
              : true

            return { ...item, ownVendor: this.renterId === platform_renter_id ? true : !hasPlatformRenter }
          })
          total = data.total
        }
      } catch (e) {
        console.warn('Get vendor user list error:' + e)
      } finally {
        this.dataLoading = false
      }
      this.userData = list
      this.userTotal = total
    },
    onVendorChanged(id) {
      this.queryCompanyId = isEmpty(id) ? null : id
    },
    onVendorTabChanged(tab) {
      this.queryRoleId = tab.name === role_vendor_name ? this.vendorRoleId : this.vendorOpRoleId
      this.getUsersData()
    },
    handleEditUserVendor(index) {
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
          await this.$confirm(`将此用户添加为此公司的管理员, 是否继续?`, '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          this.dataLoading = true
          await setUserVendorApi({ userId: this.vendorForm.userId, companyId: this.vendorForm.companyId })
          await this.getUsersData()
          this.$message.success('修改用户企业成功！')
        } catch (e) {
          console.warn('Vendor user manager set company error:' + e)
          this.$message.error('修改用户企业失败，请联系管理员！')
        } finally {
          this.dataLoading = false
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
    onUserVendorSelected(value) {
      this.userForm.companyId = value
    },
    handleUserDialogCancel() {
      this.$refs.userForm.clearValidate()
      this.userDialogVisible = false
    },
    async handleUserDialogConfirm() {
      try {
        const valid = await this.$refs.userForm.validate()
        if (valid) {
          await this.handleStartCreateUser()
        }
      } catch (e) {
        console.log(`handleUserDialogConfirm:${e}`)
      }
    },
    async handleStartCreateUser() {
      try {
        this.dataLoading = true
        this.userDialogVisible = false
        const params = {
          loginName: this.userForm.loginName,
          password: this.userForm.password,
          roleId: this.queryRoleId
        }
        if (!isEmpty(this.userForm.phone)) {
          params.phone = this.userForm.phone
        }
        const user = await createVendorUserApi(params)
        await setUserVendorApi({ userId: user.id, companyId: this.userForm.companyId })
        await this.getUsersData()
      } catch (e) {
        console.warn('Create user error: ' + e)
        const msg = this.getErrorMessage(e)
        if (msg) {
          this.$message.error(msg)
        }
      } finally {
        this.dataLoading = false
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
          } else {
            return data && data.msg ? data.msg : null
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
          if (this.queryVendorRole) {
            const vendorRole = this.roleOptions.find(item => item.value === role_vendor_name)
            this.vendorRoleId = vendorRole ? vendorRole.id : null
            const vendorOpRole = this.roleOptions.find(item => item.value === role_vendor_op_name)
            this.vendorOpRoleId = vendorOpRole ? vendorOpRole.id : null
            this.queryRoleId = this.tabVendorRole === role_vendor_name ? this.vendorRoleId : this.vendorOpRoleId
          } else if (this.queryRenterRole) {
            const renterRole = this.roleOptions.find(item => item.value === role_renter_name)
            this.queryRoleId = renterRole ? renterRole.id : null
          } else if (this.queryAdminRole) {
            const adminRole = this.roleOptions.find(item => item.value === role_admin_name)
            this.queryRoleId = adminRole ? adminRole.id : null
          } else if (this.queryWatcherRole) {
            const watcherRole = this.roleOptions.find(item => item.value === role_watcher_name)
            this.queryRoleId = watcherRole ? watcherRole.id : null
          }
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

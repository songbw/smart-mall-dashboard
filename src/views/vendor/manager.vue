<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="名称" class="form-item">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="状态" class="form-item">
        <el-select :value="queryStatus" @change="onQueryStatusChanged">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getVendorData">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="hasEditPermission" style="margin-bottom: 20px">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreateVendor">
        创建新商户
      </el-button>
    </div>
    <el-table
      ref="vendorTable"
      v-loading="dataLoading"
      :data="vendorData"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.company.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.company.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.company.status | vendorStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发票类型" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.company.invoiceType | vendorInvoice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" :width="hasEditPermission ? '360' : '100'">
        <template slot-scope="scope">
          <el-button
            type="default"
            size="mini"
            @click="handleViewVendor(scope.$index)"
          >
            查看
          </el-button>
          <el-button
            type="primary"
            size="mini"
            @click="handleEditVendor(scope.$index)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.company.status === statusReviewing"
            type="info"
            size="mini"
            @click="handleApproveVendor(scope.$index)"
          >
            批准
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.company.status === statusReviewing"
            type="warning"
            size="mini"
            @click="handleRejectVendor(scope.$index)"
          >
            拒绝
          </el-button>
          <el-button
            v-if="hasEditPermission &&
              scope.row.company.status !== statusApproved &&
              scope.row.company.status !== statusLocked"
            type="warning"
            size="mini"
            @click="handleDeleteVendor(scope.$index)"
          >
            删除
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.company.status === statusApproved"
            type="danger"
            size="mini"
            @click="handleLockVendor(scope.$index)"
          >
            冻结
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.company.status === statusLocked"
            type="success"
            size="mini"
            @click="handleUnlockVendor(scope.$index)"
          >
            恢复
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="vendorTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getVendorData"
    />
    <vendor-detail
      :dialog-visible="detailVisible"
      :company="currentVendor.company"
      :users="currentVendor.users || []"
      @onConfirmed="detailVisible = false"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="vendorDialogVisible"
      title="创建商户"
    >
      <el-form
        ref="vendorForm"
        :model="vendorProfile"
        :rules="vendorRules"
        label-position="right"
        label-width="100px"
      >
        <el-form-item label="商户名" prop="name">
          <el-input v-model="vendorProfile.name" maxlength="30" />
        </el-form-item>
        <el-form-item label="商户地址" prop="address">
          <el-input
            v-model="vendorProfile.address"
            class="item-input"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="发票类型" prop="invoiceType">
          <el-select
            v-model="vendorProfile.invoiceType"
            placeholder="请选择发票类型"
            class="item-input"
          >
            <el-option
              v-for="item in invoiceOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商户行业" prop="industry">
          <el-select
            v-model="vendorIndustry"
            multiple
            placeholder="请选择行业类型"
            class="item-input"
          >
            <el-option
              v-for="item in industryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="运营平台" prop="appId">
          <el-checkbox-group v-model="vendorAppId">
            <el-checkbox v-for="platform in platformAppList" :key="platform.appId" :label="platform.appId">
              {{ platform.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleDialogCancel">取消</el-button>
        <el-button type="primary" @click="handleDialogConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import VendorDetail from './detail'
import {
  getVendorListApi,
  deleteVendorApi,
  lockVendorApi,
  unlockVendorApi,
  reviewVendorProfileApi,
  createVendorProfileApi,
  updateVendorProfileApi
} from '@/api/vendor'
import {
  vendor_status_reviewing,
  vendor_status_approved,
  vendor_status_rejected,
  vendor_status_locked,
  VendorStatusOptions,
  VendorInvoiceOptions
} from '@/utils/constants'
import { IndustryDefinitions } from './constants'
import { VendorPermissions } from '@/utils/role-permissions'

export default {
  name: 'VendorManager',
  components: { Pagination, VendorDetail },
  filters: {
    vendorStatus: (status) => {
      const item = VendorStatusOptions.find(vendor => vendor.value === status)
      return item ? item.label : ''
    },
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    },
    vendorInvoice: type => {
      if (type !== null) {
        const item = VendorInvoiceOptions.find(invoice => invoice.value === type)
        return item ? item.label : ''
      } else {
        return ''
      }
    }
  },
  data() {
    const validateName = (rule, value, callback) => {
      if (!isEmpty(value)) {
        callback()
      } else {
        callback(new Error('请输入商户名'))
      }
    }
    const validateAddress = (rule, value, callback) => {
      if (!isEmpty(value)) {
        callback()
      } else {
        callback(new Error('请输入商户地址'))
      }
    }
    const validateInvoice = (rule, value, callback) => {
      if (value !== null) {
        callback()
      } else {
        callback(new Error('请选择发票类型'))
      }
    }
    const validateAppId = (rule, value, callback) => {
      if (!isEmpty(value)) {
        callback()
      } else {
        callback(new Error('请选择运营平台'))
      }
    }
    const validateIndustry = (rule, value, callback) => {
      if (!isEmpty(value)) {
        callback()
      } else {
        callback(new Error('请选择商户类型'))
      }
    }
    return {
      statusReviewing: vendor_status_reviewing,
      statusApproved: vendor_status_approved,
      statusLocked: vendor_status_locked,
      statusOptions: [{
        value: -1,
        label: '全部'
      }].concat(VendorStatusOptions),
      industryOptions: IndustryDefinitions,
      invoiceOptions: VendorInvoiceOptions,
      detailVisible: false,
      dataLoading: false,
      vendorData: [],
      vendorTotal: 0,
      queryName: '',
      queryStatus: -1,
      queryOffset: 1,
      queryLimit: 20,
      currentVendor: {
        company: {},
        users: []
      },
      vendorDialogVisible: false,
      vendorId: -1,
      vendorProfile: {
        name: null,
        address: null,
        industry: null,
        invoiceType: null,
        appId: null
      },
      vendorRules: {
        name: [{ required: true, trigger: 'blur', validator: validateName }],
        address: [{ required: true, trigger: 'blur', validator: validateAddress }],
        invoiceType: [{ required: true, trigger: 'blur', validator: validateInvoice }],
        appId: [{ required: true, trigger: 'blur', validator: validateAppId }],
        industry: [{ required: true, trigger: 'blur', validator: validateIndustry }]
      }
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      queryData: 'couponQuery',
      platformAppList: 'platformAppList'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(VendorPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(VendorPermissions.update)
    },
    vendorAppId: {
      get() {
        const appId = this.vendorProfile.appId
        if (appId) {
          return appId.split(',')
        } else {
          return []
        }
      },
      set(values) {
        this.vendorProfile.appId = values.join(',')
      }
    },
    vendorIndustry: {
      get() {
        const industry = this.vendorProfile.industry
        if (industry) {
          return industry.split(';')
        } else {
          return []
        }
      },
      set(values) {
        this.vendorProfile.industry = values.join(';')
      }
    }
  },
  created() {
    this.prepareData()
  },
  methods: {
    async prepareData() {
      await this.getAppPlatformList()
      await this.getVendorData()
    },
    async getAppPlatformList() {
      try {
        this.dataLoading = true
        if (this.platformAppList.length === 0) {
          await this.$store.dispatch('app/getPlatformList')
        }
      } catch (e) {
        console.warn('Get platform list error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getVendorData() {
      if (this.hasViewPermission) {
        try {
          this.dataLoading = true
          const params = {
            page: this.queryOffset,
            limit: this.queryLimit
          }
          if (this.queryStatus > 0) {
            params.status = this.queryStatus
          }
          if (!isEmpty(this.queryName)) {
            params.name = this.queryName
          }
          const data = await getVendorListApi(params)
          this.vendorData = data.rows
          this.vendorTotal = data.total
        } catch (e) {
          console.warn(`Vendor Manager: ${e}`)
        } finally {
          this.dataLoading = false
        }
      } else {
        this.$message.warning('没有查看商户的权限，请联系管理员！')
      }
    },
    handleViewVendor(index) {
      this.currentVendor = this.vendorData[index]
      this.detailVisible = true
    },
    async handleApproveVendor(index) {
      try {
        const name = this.vendorData[index].company.name
        await this.$confirm(`批准公司：${name}，此公司将可以进行发布商品等操作, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.handleReviewVendor(this.vendorData[index].company.id, vendor_status_approved, 'Approved')
      } catch (e) {
        console.warn('Vendor manager approve:' + e)
      }
    },
    async handleRejectVendor(index) {
      try {
        const { value } = await this.$prompt('请输入审核意见', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        this.handleReviewVendor(this.vendorData[index].company.id, vendor_status_rejected, value)
      } catch (e) {
        console.warn('Vendor manager reject:' + e)
      }
    },
    async handleReviewVendor(id, status, comments) {
      try {
        await reviewVendorProfileApi({ id, status, comments })
        this.$message.success('更新企业信息成功！')
        this.getVendorData()
      } catch (_) {
        this.$message.warning('更新企业信息失败，请稍后重试！')
      }
    },
    async handleDeleteVendor(index) {
      try {
        const name = this.vendorData[index].company.name
        await this.$confirm(`删除公司：${name}，此公司将需要重新申请审核, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteVendorApi({ id: this.vendorData[index].company.id })
        this.getVendorData()
      } catch (e) {
        console.warn('Vendor manager delete:' + e)
      }
    },
    async handleLockVendor(index) {
      try {
        const name = this.vendorData[index].company.name
        await this.$confirm(`冻结公司：${name}，此公司的管理员将无法登录, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await lockVendorApi({ id: this.vendorData[index].company.id })
        this.getVendorData()
      } catch (e) {
        console.warn('Vendor manager delete:' + e)
      }
    },
    async handleUnlockVendor(index) {
      try {
        const name = this.vendorData[index].company.name
        await this.$confirm(`恢复公司：${name}， 此公司需要重新批准审核, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await unlockVendorApi({ id: this.vendorData[index].company.id })
        this.getVendorData()
      } catch (e) {
        console.warn('Vendor manager delete:' + e)
      }
    },
    onQueryStatusChanged(value) {
      this.queryStatus = value
    },
    resetVendorForm() {
      this.vendorProfile.name = ''
      this.vendorProfile.address = ''
      this.vendorProfile.industry = ''
      this.vendorProfile.invoiceType = null
      this.vendorProfile.appId = null
    },
    handleCreateVendor() {
      this.resetVendorForm()
      this.vendorId = -1
      this.vendorDialogVisible = true
    },
    handleEditVendor(index) {
      const company = this.vendorData[index].company
      this.vendorId = company.id
      this.vendorProfile.name = company.name
      this.vendorProfile.address = company.address
      this.vendorProfile.industry = company.industry
      this.vendorProfile.invoiceType = company.invoiceType
      this.vendorProfile.appId = company.appId
      this.vendorDialogVisible = true
    },
    handleDialogCancel() {
      this.resetVendorForm()
      this.$refs.vendorForm.clearValidate()
      this.vendorDialogVisible = false
    },
    handleDialogConfirm() {
      this.$refs.vendorForm.validate(async(valid) => {
        if (valid) {
          if (this.vendorId >= 0) {
            this.confirmUpdateVendor()
          } else {
            this.confirmCreateVendor()
          }
        }
      })
    },
    async confirmCreateVendor() {
      try {
        const { id } = await createVendorProfileApi(this.vendorProfile)
        await reviewVendorProfileApi({ id, status: vendor_status_approved, comments: 'Approved' })
        this.vendorDialogVisible = false
        this.getVendorData()
        this.$message.success('商户创建成功！')
      } catch (e) {
        console.warn('Create vendor profile error:' + e)
        const msg = this.getErrorMessage(e)
        if (msg) {
          this.$message.error(msg)
        }
      }
    },
    async confirmUpdateVendor() {
      try {
        await updateVendorProfileApi({ id: this.vendorId, ...this.vendorProfile })
        this.vendorDialogVisible = false
        this.getVendorData()
        this.$message.success('商户更新成功！')
      } catch (e) {
        console.warn('Update vendor profile error:' + e)
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
    }
  }
}
</script>

<style scoped>

</style>

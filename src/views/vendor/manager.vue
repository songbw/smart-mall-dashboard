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
      <el-form-item v-if="hasViewRenterPermission" label="租户" class="form-item">
        <el-select v-model="queryRenterId" clearable>
          <el-option
            v-for="item in renterList"
            :key="item.renterId"
            :label="item.renterName"
            :value="item.renterId"
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
      style="width: 100%;"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.companyId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.companyName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | vendorStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发票类型" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.invoiceType | vendorInvoice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="纳税人类型" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.taxpayerType | vendorTaxpayer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建日期" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" :width="hasEditPermission ? '360' : '100'">
        <template slot-scope="scope">
          <el-button
            v-if="hasViewRenterPermission"
            type="default"
            size="mini"
            @click="handleViewVendor(scope.$index)"
          >
            租户设置
          </el-button>
          <el-button
            type="primary"
            size="mini"
            @click="handleEditVendor(scope.$index)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.status === statusReviewing"
            type="info"
            size="mini"
            @click="handleApproveVendor(scope.$index)"
          >
            批准
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.status === statusReviewing"
            type="warning"
            size="mini"
            @click="handleRejectVendor(scope.$index)"
          >
            拒绝
          </el-button>
          <el-button
            v-if="hasEditPermission &&
              scope.row.status !== statusApproved &&
              scope.row.status !== statusLocked"
            type="warning"
            size="mini"
            @click="handleDeleteVendor(scope.$index)"
          >
            删除
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.status === statusApproved"
            type="danger"
            size="mini"
            @click="handleLockVendor(scope.$index)"
          >
            冻结
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.status === statusLocked"
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
    <vendor-renter
      :dialog-visible="renterDialogVisible"
      :company="currentVendor"
      :renter-list="renterList"
      @onConfirmed="onRenterDialogConfirmed"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="vendorDialogVisible"
      :title="vendorId >= 0 ? '编辑商户' : '创建商户'"
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
        <el-form-item label="发票类型">
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
        <el-form-item label="纳税人类型">
          <el-select
            v-model="vendorProfile.taxpayerType"
            placeholder="请选择纳税人类型"
            class="item-input"
          >
            <el-option
              v-for="item in taxpayerOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import VendorRenter from './detail'
import {
  getCompanyListOfRenterApi,
  deleteVendorApi,
  lockVendorApi,
  unlockVendorApi,
  reviewVendorProfileApi,
  createVendorProfileApi,
  updateVendorProfileApi,
  getRenterListApi,
  addCompanyToRenterApi,
  delCompanyFromRenterApi
} from '@/api/vendor'
import {
  vendor_status_reviewing,
  vendor_status_approved,
  vendor_status_rejected,
  vendor_status_locked,
  VendorStatusOptions,
  VendorInvoiceOptions,
  VendorTaxpayerOptions,
  vendor_invoice_type_normal,
  vendor_taxpayer_type_general
} from '@/utils/constants'
import {
  VendorPermissions,
  RenterPermissions
} from '@/utils/role-permissions'

export default {
  name: 'VendorManager',
  components: { VendorRenter, Pagination },
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
    },
    vendorTaxpayer: type => {
      if (type !== null) {
        const item = VendorTaxpayerOptions.find(invoice => invoice.value === type)
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
    const validateTaxpayer = (rule, value, callback) => {
      if (value !== null) {
        callback()
      } else {
        callback(new Error('请选择纳税人类型'))
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
      invoiceOptions: VendorInvoiceOptions,
      taxpayerOptions: VendorTaxpayerOptions,
      renterDialogVisible: false,
      dataLoading: false,
      renterList: [],
      vendorData: [],
      vendorTotal: 0,
      queryName: '',
      queryStatus: -1,
      queryRenterId: '',
      queryOffset: 1,
      queryLimit: 20,
      currentVendor: null,
      vendorDialogVisible: false,
      vendorId: -1,
      vendorProfile: {
        name: null,
        address: null,
        industry: '',
        invoiceType: vendor_invoice_type_normal,
        taxpayerType: vendor_taxpayer_type_general,
        appId: '',
        excludeAppId: ''
      },
      vendorRules: {
        name: [{ required: true, trigger: 'blur', validator: validateName }],
        address: [{ required: true, trigger: 'blur', validator: validateAddress }],
        invoiceType: [{ required: true, trigger: 'blur', validator: validateInvoice }],
        taxpayerType: [{ required: true, trigger: 'blur', validator: validateTaxpayer }]
      }
    }
  },
  computed: {
    ...mapGetters({
      renterId: 'renterId',
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
    hasViewRenterPermission() {
      return this.userPermissions.includes(RenterPermissions.view)
    }
  },
  created() {
    this.prepareData()
  },
  methods: {
    async prepareData() {
      await this.getRenterList()
      await this.getVendorData()
    },
    async getRenterList() {
      if (this.hasViewRenterPermission) {
        let list = []
        try {
          this.dataLoading = true
          const params = {
            pageIndex: 1,
            pageSize: 1000,
            status: vendor_status_approved
          }
          const { code, data } = await getRenterListApi(params)
          if (code === 200) {
            list = data.rows
          }
        } catch (e) {
          console.warn(`Get renter list error: ${e}`)
        } finally {
          this.dataLoading = false
        }
        this.renterList = list
      }
    },
    async getVendorData() {
      if (this.hasViewPermission) {
        let list = []
        let total = 0
        try {
          this.dataLoading = true
          const params = {
            pageIndex: this.queryOffset,
            pageSize: this.queryLimit
          }
          if (this.queryStatus > 0) {
            params.status = this.queryStatus
          }
          if (!isEmpty(this.queryName)) {
            params.name = this.queryName
          }
          if (!isEmpty(this.queryRenterId)) {
            params.renterId = this.queryRenterId
          }
          const { code, data } = await getCompanyListOfRenterApi(params)
          if (code === 200) {
            list = data.rows
            total = data.total
          }
        } catch (e) {
          console.warn(`Vendor Manager: ${e}`)
        } finally {
          this.dataLoading = false
        }
        this.vendorData = list
        this.vendorTotal = total
      } else {
        this.$message.warning('没有查看商户的权限，请联系管理员！')
      }
    },
    handleViewVendor(index) {
      this.currentVendor = this.vendorData[index]
      this.renterDialogVisible = true
    },
    async handleApproveVendor(index) {
      try {
        const name = this.vendorData[index].companyName
        await this.$confirm(`批准公司：${name}，此公司将可以进行发布商品等操作, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.handleReviewVendor(this.vendorData[index].companyId, vendor_status_approved, 'Approved')
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
        await this.handleReviewVendor(this.vendorData[index].companyId, vendor_status_rejected, value)
      } catch (e) {
        console.warn('Vendor manager reject:' + e)
      }
    },
    async handleReviewVendor(id, status, comments) {
      try {
        await reviewVendorProfileApi({ id, status, comments })
        await this.getVendorData()
      } catch (_) {
        this.$message.warning('更新企业信息失败，请稍后重试！')
      }
    },
    async handleDeleteVendor(index) {
      try {
        const name = this.vendorData[index].companyName
        await this.$confirm(`删除公司：${name}，此公司将需要重新申请审核, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await deleteVendorApi({ id: this.vendorData[index].companyId })
        await this.getVendorData()
      } catch (e) {
        console.warn('Vendor manager delete:' + e)
      }
    },
    async handleLockVendor(index) {
      try {
        const name = this.vendorData[index].companyName
        await this.$confirm(`冻结公司：${name}，此公司的管理员将无法登录, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await lockVendorApi({ id: this.vendorData[index].companyId })
        await this.getVendorData()
      } catch (e) {
        console.warn('Vendor manager delete:' + e)
      }
    },
    async handleUnlockVendor(index) {
      try {
        const name = this.vendorData[index].companyName
        await this.$confirm(`恢复公司：${name}， 此公司需要重新批准审核, 是否继续?`, '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await unlockVendorApi({ id: this.vendorData[index].companyId })
        await this.getVendorData()
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
      this.vendorProfile.invoiceType = vendor_invoice_type_normal
      this.vendorProfile.taxpayerType = vendor_taxpayer_type_general
      this.vendorProfile.appId = ''
      this.vendorProfile.excludeAppId = ''
    },
    handleCreateVendor() {
      this.resetVendorForm()
      this.vendorId = -1
      this.vendorDialogVisible = true
    },
    handleEditVendor(index) {
      const vendor = this.vendorData[index]
      this.vendorId = vendor.companyId
      this.vendorProfile.name = vendor.companyName
      this.vendorProfile.address = vendor.address
      this.vendorProfile.industry = vendor.industry
      this.vendorProfile.invoiceType = vendor.invoiceType
      this.vendorProfile.taxpayerType = vendor.taxpayerType
      this.vendorProfile.appId = vendor.appId
      this.vendorProfile.excludeAppId = vendor.excludeAppId
      this.vendorDialogVisible = true
    },
    handleDialogCancel() {
      this.resetVendorForm()
      this.$refs.vendorForm.clearValidate()
      this.vendorDialogVisible = false
    },
    handleDialogConfirm() {
      this.$refs.vendorForm.validate(async (valid) => {
        if (valid) {
          if (this.vendorId >= 0) {
            await this.confirmUpdateVendor()
          } else {
            await this.confirmCreateVendor()
          }
        }
      })
    },
    async confirmCreateVendor() {
      try {
        const { id } = await createVendorProfileApi(this.vendorProfile)
        await reviewVendorProfileApi({ id, status: vendor_status_approved, comments: 'Approved' })
        await addCompanyToRenterApi({ companyId: id, renterId: this.renterId })
        this.vendorDialogVisible = false
        await this.getVendorData()
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
        await this.getVendorData()
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
    },
    async handleAddCompanyToRenter(params) {
      const { companyId, companyName, renterName, renterId } = params
      this.$confirm(`将商户：${companyName} 添加到租户：${renterName}， 是否继续?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.dataLoading = true
          const { code } = await addCompanyToRenterApi({ companyId, renterId })
          if (code === 200) {
            await this.getVendorData()
          }
        } catch (e) {
          console.warn('Add company to renter error:' + e)
          this.$message.warning('添加商户失败，请联系管理员！')
        } finally {
          this.dataLoading = false
        }
      }).catch(e => {
        console.debug(e)
      })
    },
    async handleDelCompanyToRenter(params) {
      const { companyId, companyName, renterName, renterId } = params
      this.$confirm(`将商户：${companyName} 从租户：${renterName} 中移除， 是否继续?`, '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.dataLoading = true
          const { code } = await delCompanyFromRenterApi({ companyId, renterId })
          if (code === 200) {
            await this.getVendorData()
          }
        } catch (e) {
          console.warn('Del company to renter error:' + e)
          this.$message.warning('移除商户失败，请联系管理员！')
        } finally {
          this.dataLoading = false
        }
      }).catch(e => {
        console.debug(e)
      })
    },
    onRenterDialogConfirmed(opData) {
      this.renterDialogVisible = false
      if (opData) {
        const { type, ...data } = opData
        if (type === 'add') {
          this.handleAddCompanyToRenter(data)
        } else {
          this.handleDelCompanyToRenter(data)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>

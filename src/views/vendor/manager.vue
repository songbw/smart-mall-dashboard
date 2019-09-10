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
    <div style="margin-bottom: 20px">
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
      <el-table-column label="编号" align="center" width="60">
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
      <el-table-column label="更新时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.company.updateTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="320">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleViewVendor(scope.$index)">
            查看
          </el-button>
          <el-button
            :disabled="scope.row.company.status !== statusReviewing"
            type="info"
            size="mini"
            @click="handleApproveVendor(scope.$index)"
          >
            批准
          </el-button>
          <el-button
            :disabled="scope.row.company.status !== statusReviewing"
            type="warning"
            size="mini"
            @click="handleRejectVendor(scope.$index)"
          >
            拒绝
          </el-button>
          <el-button
            :disabled="scope.row.company.status === statusApproved"
            type="danger"
            size="mini"
            @click="handleDeleteVendor(scope.$index)"
          >
            删除
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
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelCreateVendor">取消</el-button>
        <el-button type="primary" @click="confirmCreateVendor">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import VendorDetail from './detail'
import {
  getVendorListApi,
  deleteVendorApi,
  reviewVendorProfileApi,
  createVendorProfileApi
} from '@/api/vendor'
import {
  vendor_status_editing,
  vendor_status_reviewing,
  vendor_status_approved,
  vendor_status_rejected
} from '@/utils/constants'
import { IndustryDefinitions } from './constants'

const VendorStatus = [
  {
    value: vendor_status_editing,
    label: '编辑中'
  },
  {
    value: vendor_status_reviewing,
    label: '待审核'
  },
  {
    value: vendor_status_approved,
    label: '审核已通过'
  },
  {
    value: vendor_status_rejected,
    label: '审核有问题'
  }
]

export default {
  name: 'VendorManager',
  components: { Pagination, VendorDetail },
  filters: {
    vendorStatus: (status) => {
      const item = VendorStatus.find(vendor => vendor.value === status)
      return item ? item.label : ''
    },
    dateFormat: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
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
      statusOptions: [{
        value: -1,
        label: '全部'
      }].concat(VendorStatus),
      industryOptions: IndustryDefinitions,
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
      vendorProfile: {
        name: null,
        address: null,
        industry: null
      },
      vendorRules: {
        name: [{ required: true, trigger: 'blur', validator: validateName }],
        address: [{ required: true, trigger: 'blur', validator: validateAddress }],
        industry: [{ required: true, trigger: 'change', validator: validateIndustry }]
      }
    }
  },
  computed: {
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
    this.getVendorData()
  },
  methods: {
    async getVendorData() {
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
    onQueryStatusChanged(value) {
      this.queryStatus = value
    },
    handleCreateVendor() {
      this.vendorProfile.name = ''
      this.vendorProfile.address = ''
      this.vendorProfile.industry = ''
      this.vendorDialogVisible = true
    },
    cancelCreateVendor() {
      this.$refs.vendorForm.clearValidate()
      this.vendorDialogVisible = false
    },
    confirmCreateVendor() {
      this.$refs.vendorForm.validate(async(valid) => {
        if (valid) {
          try {
            const { id } = await createVendorProfileApi(this.vendorProfile)
            await reviewVendorProfileApi({ id, status: vendor_status_approved, comments: 'Approved' })
            this.vendorDialogVisible = false
            this.getVendorData()
          } catch (e) {
            console.warn('Create vendor profile error:' + e)
            const msg = this.getErrorMessage(e)
            if (msg) {
              this.$message.error(msg)
            }
          }
        }
      })
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

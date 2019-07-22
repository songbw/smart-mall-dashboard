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
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.company.status | vendorStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.company.updateTime | dateFormat }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280">
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
          <el-button type="danger" size="mini" @click="handleDeleteVendor(scope.$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="vendorTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      :page-sizes="[20, 40, 80, 100]"
      @pagination="getVendorData"
    />
    <vendor-detail
      :dialog-visible="detailVisible"
      :company="currentVendor.company"
      :users="currentVendor.users"
      @onConfirmed="detailVisible = false"
    />
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
  reviewVendorProfileApi
} from '@/api/vendor'
import {
  vendor_status_editing,
  vendor_status_reviewing,
  vendor_status_approved,
  vendor_status_rejected
} from '@/utils/constants'

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
    return {
      statusReviewing: vendor_status_reviewing,
      statusOptions: [{
        value: -1,
        label: '全部'
      }].concat(VendorStatus),
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
    }
  }
}
</script>

<style scoped>

</style>

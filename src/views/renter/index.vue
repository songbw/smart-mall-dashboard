<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="名称" class="form-item">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable @change="onQueryNameChanged" />
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
        <el-button type="primary" icon="el-icon-search" @click="getRenterList">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="hasEditPermission" style="margin-bottom: 20px">
      <el-button type="primary" icon="el-icon-plus" @click="onCreateClicked">
        新建新租户
      </el-button>
    </div>
    <el-table
      v-loading="dataLoading"
      :data="renterList"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="名称" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.renterName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统一社会信用码" align="left">
        <template slot-scope="scope">
          <span>{{ scope.row.uniformCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发票类型" align="left" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.invoiceType | vendorInvoice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="纳税人类型" align="left" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.taxpayerType | vendorTaxpayer }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="left" width="120">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | vendorStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" :width="hasEditPermission ? '360' : '100'">
        <template slot-scope="scope">
          <el-button
            type="default"
            size="mini"
            @click="onViewClicked(scope.$index)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasEditPermission"
            :disabled="scope.row.status === statusApproved"
            type="primary"
            size="mini"
            @click="onEditClicked(scope.$index)"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.status === statusReviewing"
            type="info"
            size="mini"
            @click="onApproveClicked(scope.$index)"
          >
            批准
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.status === statusReviewing"
            type="warning"
            size="mini"
            @click="onRejectClicked(scope.$index)"
          >
            驳回
          </el-button>
          <el-button
            v-if="hasEditPermission && scope.row.status === statusApproved"
            :disabled="scope.row.renterId === platformRenterId"
            type="danger"
            size="mini"
            @click="onLockClicked(scope.$index)"
          >
            冻结
          </el-button>
          <el-button
            v-if="hasEditPermission && (scope.row.status === statusLocked || scope.row.status === statusRejected)"
            type="success"
            size="mini"
            @click="onUnlockClicked(scope.$index)"
          >
            恢复
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="renterTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getRenterList"
    />
    <renter-form-dialog
      :dialog-visible="renterDialogVisible"
      :renter-data="currentRenter"
      @cancelled="renterDialogVisible = false"
      @confirmed="onRenterDataConfirmed"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import {
  platform_renter_id,
  vendor_status_approved,
  vendor_status_locked,
  vendor_status_rejected,
  vendor_status_reviewing,
  VendorInvoiceOptions,
  VendorStatusOptions,
  VendorTaxpayerOptions
} from '@/utils/constants'
import {
  createRenterApi,
  getRenterListApi,
  updateRenterApi,
  updateRenterStatusApi
} from '@/api/vendor'
import isEmpty from 'lodash/isEmpty'
import moment from 'moment'
import RenterFormDialog from '@/views/renter/renterFormDialog'
import { mapGetters } from 'vuex'
import { RenterPermissions } from '@/utils/role-permissions'

export default {
  name: 'RenterManagement',
  components: { RenterFormDialog, Pagination },
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
    return {
      platformRenterId: platform_renter_id,
      statusReviewing: vendor_status_reviewing,
      statusApproved: vendor_status_approved,
      statusRejected: vendor_status_rejected,
      statusLocked: vendor_status_locked,
      statusOptions: [{
        value: -1,
        label: '全部'
      }].concat(VendorStatusOptions),
      dataLoading: false,
      queryName: '',
      queryStatus: -1,
      queryOffset: 1,
      queryLimit: 20,
      renterList: [],
      renterTotal: 0,
      renterDialogVisible: false,
      currentRenter: null
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(RenterPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(RenterPermissions.update)
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      await this.getRenterList()
    },
    onQueryNameChanged(value) {
      if (!isEmpty(value)) {
        this.queryOffset = 1
      }
    },
    onQueryStatusChanged(value) {
      this.queryStatus = value
      this.queryOffset = 1
    },
    async getRenterList() {
      if (this.hasViewPermission) {
        let total = 0
        let list = []
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
            params.renterName = this.queryName
          }
          const { code, data } = await getRenterListApi(params)
          if (code === 200) {
            list = data.rows
            total = data.total
          }
        } catch (e) {
          console.warn(`Renter Manager: ${e}`)
        } finally {
          this.dataLoading = false
        }
        this.renterList = list
        this.renterTotal = total
      } else {
        this.$message.warning('没有查看租户的权限，请联系管理员！')
      }
    },
    onCreateClicked() {
      this.currentRenter = null
      this.renterDialogVisible = true
    },
    onViewClicked(index) {
      const renterId = this.renterList[index].renterId
      this.$router.push({
        name: 'RenterDetail',
        params: { renterId }
      })
    },
    onEditClicked(index) {
      this.currentRenter = this.renterList[index]
      this.renterDialogVisible = true
    },
    async onApproveClicked(index) {
      try {
        const name = this.renterList[index].renterName
        const renterId = this.renterList[index].renterId
        await this.$confirm(`此租户（${name}）将可以运营商城, 是否继续?`, '批准租户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.dataLoading = true
        await updateRenterStatusApi({ renterId, status: vendor_status_approved })
        await this.getRenterList()
      } catch (e) {
        console.warn('Renter manager approve:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async onRejectClicked(index) {
      try {
        const name = this.renterList[index].renterName
        const renterId = this.renterList[index].renterId
        await this.$confirm(`此租户（${name}）需要修改信息重新申请, 是否继续?`, '驳回租户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.dataLoading = true
        await updateRenterStatusApi({ renterId, status: vendor_status_rejected })
        await this.getRenterList()
      } catch (e) {
        console.warn('Renter manager reject:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async onLockClicked(index) {
      try {
        const name = this.renterList[index].renterName
        const renterId = this.renterList[index].renterId
        await this.$confirm(`此租户（${name}）的管理员将无法登录, 是否继续?`, '冻结租户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.dataLoading = true
        await updateRenterStatusApi({ renterId, status: vendor_status_locked })
        await this.getRenterList()
      } catch (e) {
        console.warn('Renter manager lock:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async onUnlockClicked(index) {
      try {
        const name = this.renterList[index].renterName
        const renterId = this.renterList[index].renterId
        await this.$confirm(`此租户（${name}）需要重新批准审核, 是否继续?`, '恢复租户', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.dataLoading = true
        await updateRenterStatusApi({ renterId, status: vendor_status_reviewing })
        await this.getRenterList()
      } catch (e) {
        console.warn('Renter manager unlock:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async handleCreateRenter(renterData) {
      try {
        this.dataLoading = true
        const { code, data, msg } = await createRenterApi(renterData)
        if (code === 200) {
          const { renterId } = data
          await updateRenterStatusApi({ renterId, status: vendor_status_approved })
          await this.getRenterList()
          await this.$store.dispatch('app/getRenterList', true)
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create renter error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async handleUpdateRenter(renterData) {
      try {
        this.dataLoading = true
        const { code, msg } = await updateRenterApi(renterData)
        if (code === 200) {
          await this.getRenterList()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Update renter error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    onRenterDataConfirmed(renterData) {
      this.renterDialogVisible = false
      if (this.currentRenter !== null) {
        const data = { ...this.currentRenter, ...renterData }
        this.handleUpdateRenter(data)
      } else {
        this.handleCreateRenter(renterData)
      }
    }
  }
}
</script>

<style scoped>

</style>

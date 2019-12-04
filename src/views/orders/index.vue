<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="主订单号">
        <el-input v-model="queryTradeNo" :clearable="true" placeholder="输入主订单后8位" />
      </el-form-item>
      <el-form-item label="子订单号">
        <el-input v-model="querySubOrderId" :clearable="true" placeholder="输入子订单编号" />
      </el-form-item>
      <el-form-item label="苏宁单号">
        <el-input v-model="queryAoyiId" :clearable="true" placeholder="输入苏宁订单号" />
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item label="电话号码">
        <el-input v-model="queryMobile" :clearable="true" placeholder="输入收货人电话号码" />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select :value="querySubStatus" @change="onQueryStatusChanged">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="hasVendorPermission" label="供应商名">
        <el-select :value="queryVendor" @change="onQueryVendorChanged">
          <el-option
            v-for="item in vendorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          >
            <span>{{ item.label }}</span>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item label="结算开始日期">
        <el-date-picker
          v-model="queryCompleteStartDate"
          placeholder="选择开始日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="结算结束日期">
        <el-date-picker
          v-model="queryCompleteEndDate"
          placeholder="选择结束日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
    </el-form>
    <el-form inline>
      <el-form-item label="支付开始日期">
        <el-date-picker
          v-model="queryPayStartDate"
          placeholder="选择开始日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="支付结束日期">
        <el-date-picker
          v-model="queryPayEndDate"
          placeholder="选择结束日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="handleSearchOrders">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div
      v-if="hasExportPermission || hasPayExportPermission"
      style="display: flex;justify-content: start;margin-bottom: 12px"
    >
      <el-tooltip v-if="hasExportPermission" content="导出所需时间段内已支付与已退款的订单列表">
        <el-button icon="el-icon-download" type="success" @click="handleShowExportDialog">
          导出流水订单
        </el-button>
      </el-tooltip>
      <el-tooltip v-if="hasExportPermission" content="导出所需时间段内已完成与已退款的订单列表">
        <el-button icon="el-icon-download" type="danger" @click="handleShowReconciliationDialog">
          导出结算订单
        </el-button>
      </el-tooltip>
      <el-tooltip v-if="hasPayExportPermission" content="根据支付类型导出所需时间段内已完成与已退款的交易列表">
        <el-button icon="el-icon-download" type="warning" @click="handleShowPaymentExportDialog">
          导出支付交易订单
        </el-button>
      </el-tooltip>
    </div>
    <el-table
      ref="ordersTable"
      v-loading="listLoading"
      :data="orderData"
      :fit="true"
      border
      style="width: 100%;"
    >
      <el-table-column align="center" label="主订单编号" width="120">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'ViewMainOrder', params: { mainId: scope.row.id }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row.tradeNo.substring(scope.row.tradeNo.length - 8) }}
          </router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="子订单编号" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.subOrderId }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="商品">
        <template slot-scope="scope">
          <order-product
            :count="scope.row.num"
            :image-url="scope.row.image"
            :mpu="scope.row.mpu"
            :name="scope.row.name"
            :price="scope.row.salePrice"
            :sku-id="scope.row.skuId"
            :merchant-name="scope.row.merchantName"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="收货人" width="160">
        <template slot-scope="scope">
          <div>
            <div class="text-item">{{ '姓名：' + scope.row.receiverName }}</div>
            <div class="text-item">{{ '电话：' + scope.row.mobile }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单时间" width="200">
        <template slot-scope="scope">
          <div>
            <div class="text-item">
              下单：<span>{{ scope.row.createdAt | timeFilter }}</span>
            </div>
            <div class="text-item">
              支付：<span>{{ scope.row.paymentAt | timeFilter }}</span>
            </div>
            <div class="text-item">
              结算：<span>{{ scope.row.completeTime | timeFilter }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单状态" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.subStatus | OrderStatus }}</span>
          <router-link
            v-if="scope.row.workOrderId"
            :to="{ name: 'ViewWorkOrder', params: { id: scope.row.workOrderId }}"
            class="el-link el-link--primary is-underline"
          >
            ({{ scope.row.workOrderStatus | workOrderStatus }})
          </router-link>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        class-name="small-padding fixed-width"
        label="操作"
        width="160"
      >
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleViewSubOrder(scope.row.subOrderId)"
          >
            查看
          </el-button>
          <el-button
            v-if="hasEditPermission"
            size="mini"
            type="info"
            @click="handleEditOrderRemark(scope.row.subId)"
          >
            备注
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :limit.sync="queryLimit"
      :page.sync="queryOffset"
      :total="orderTotal"
      @pagination="getOrderList"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="exportDialogVisible"
      :title="exportReconciliation ? '导出结算订单' : '导出订单'"
    >
      <el-form ref="exportForm" :model="exportForm" :rules="exportRules" label-width="7rem">
        <el-form-item label="开始日期" prop="payStartDate">
          <el-date-picker
            v-model="exportForm.payStartDate"
            placeholder="选择开始日期"
            type="date"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="payEndDate">
          <el-date-picker
            v-model="exportForm.payEndDate"
            placeholder="选择结束日期"
            type="date"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item v-if="exportPayment" label="支付类型" prop="payType">
          <el-select v-model="exportForm.payType">
            <el-option
              v-for="item in paymentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-else-if="hasVendorPermission" label="供应商名" prop="merchantId">
          <el-select v-model="exportForm.merchantId">
            <el-option
              v-for="item in vendorOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
              <span>{{ item.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelExport">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import OrderProduct from './OrderProduct'
import {
  exportOrdersApi,
  getOrderListApi,
  updateSubOrderApi,
  exportReconciliationApi,
  exportPaymentBillApi,
  exportVendorOrdersApi,
  exportVendorReconciliationApi
} from '@/api/orders'
import { getVendorListApi } from '@/api/vendor'
import { getWorkOrderListApi } from '@/api/workOrders'
import {
  SubOrderStatusDefinitions,
  vendor_status_approved,
  suborder_status_requested_service,
  WorkOrderStatusDefinition
} from '@/utils/constants'
import { OrderPermissions } from '@/utils/role-permissions'

const validateDates = (start, end) => {
  const format = 'YYYY-MM-DD'
  if (start && end) {
    const startDate = moment(start, format)
    const maxEndDate = moment(start, format).add(3, 'months')
    const endDate = moment(end, format)
    return endDate.isSameOrAfter(startDate) && endDate.isSameOrBefore(maxEndDate)
  } else {
    return false
  }
}
export default {
  name: 'Orders',
  components: { Pagination, OrderProduct },
  filters: {
    OrderStatus: status => {
      const find = SubOrderStatusDefinitions.find(option => option.value === status)
      return find ? find.label : status
    },
    timeFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() && momentDate.isAfter('2000-01-01', 'year') ? momentDate.format(format) : ''
    },
    workOrderStatus: status => {
      const find = WorkOrderStatusDefinition.find(option => option.value === status)
      return find ? find.label : status
    }
  },
  data() {
    return {
      statusOptions: [{
        value: -1,
        label: '全部'
      }].concat(SubOrderStatusDefinitions),
      paymentOptions: [{
        value: 'balance',
        label: '余额支付'
      }, {
        value: 'woa',
        label: '联机账户'
      }, {
        value: 'card',
        label: '惠民优选卡'
      }],
      vendorLoading: false,
      vendors: [],
      listLoading: false,
      orderData: [],
      orderTotal: 0,
      queryParams: null,
      exportPayment: false,
      exportReconciliation: false,
      exportDialogVisible: false,
      exportForm: {
        merchantId: -1,
        payStartDate: null,
        payEndDate: null,
        payType: null
      },
      exportRules: {
        payStartDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if ((value && this.exportForm.payEndDate === null) ||
              validateDates(this.exportForm.payStartDate, this.exportForm.payEndDate)) {
              callback()
            } else {
              callback(new Error('请选择合适导出的开始日期，区间最多3个月'))
            }
          }
        }],
        payEndDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if ((value && this.exportForm.payStartDate === null) ||
              validateDates(this.exportForm.payStartDate, this.exportForm.payEndDate)) {
              callback()
            } else {
              callback(new Error('请选择合适导出的结束日期， 区间最多3个月'))
            }
          }
        }],
        payType: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (this.exportPayment && value === null) {
              callback(new Error('请选择合适支付类型'))
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
      userPermissions: 'userPermissions',
      vendorApproved: 'vendorApproved',
      orderQuery: 'orderQuery',
      vendorId: 'vendorId'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(OrderPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(OrderPermissions.update)
    },
    hasExportPermission() {
      return this.userPermissions.includes(OrderPermissions.export)
    },
    hasPayExportPermission() {
      return this.userPermissions.includes(OrderPermissions.payExport)
    },
    hasVendorPermission() {
      return this.userPermissions.includes(OrderPermissions.vendor)
    },
    vendorOptions() {
      return this.vendorLoading ? [] : [{ value: -1, label: '全部' }].concat(this.vendors)
    },
    queryAoyiId: {
      get() {
        return this.orderQuery.aoyiId
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { aoyiId: trim(value) })
      }
    },
    queryTradeNo: {
      get() {
        return this.orderQuery.tradeNo
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { tradeNo: trim(value) })
      }
    },
    querySubOrderId: {
      get() {
        return this.orderQuery.subOrderId
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { subOrderId: trim(value) })
      }
    },
    queryMobile: {
      get() {
        return this.orderQuery.mobile
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { mobile: trim(value) })
      }
    },
    querySubStatus: {
      get() {
        return this.orderQuery.subStatus
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { subStatus: value })
      }
    },
    queryVendor: {
      get() {
        return this.vendorLoading ? null : this.orderQuery.merchantId
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { merchantId: value })
      }
    },
    queryPayStartDate: {
      get() {
        return this.orderQuery.payDateStart
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { payDateStart: value })
      }
    },
    queryPayEndDate: {
      get() {
        return this.orderQuery.payDateEnd
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { payDateEnd: value })
      }
    },
    queryCompleteStartDate: {
      get() {
        return this.orderQuery.completeDateStart
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { completeDateStart: value })
      }
    },
    queryCompleteEndDate: {
      get() {
        return this.orderQuery.completeDateEnd
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { completeDateEnd: value })
      }
    },
    queryOffset: {
      get() {
        return this.orderQuery.pageIndex
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { pageIndex: value })
      }
    },
    queryLimit: {
      get() {
        return this.orderQuery.pageSize
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { pageSize: value })
      }
    }
  },
  created() {
    this.getOrderList()
  },
  beforeRouteLeave(to, from, next) {
    const toGroup = to.meta.group || ''
    if (toGroup !== this.$route.meta.group) {
      this.$store.commit('orders/RESET_SEARCH_DATA')
    }
    next()
  },
  methods: {
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 1000,
          status: vendor_status_approved
        }
        this.vendorLoading = true
        const data = await getVendorListApi(params)
        this.vendors = data.rows.map(row => {
          return {
            value: row.company.id,
            label: row.company.name
          }
        })
      } catch (e) {
        console.warn('Orders get vendor list error:' + e)
      } finally {
        this.vendorLoading = false
      }
    },
    getVendorName(vendorId) {
      if (this.vendorOptions.length > 0 && vendorId != null) {
        const vendor = this.vendorOptions.find(option => option.value === vendorId)
        if (vendor) {
          return vendor.label
        } else {
          return ''
        }
      }
    },
    getSearchParams() {
      const params = {}
      const keys = ['aoyiId', 'tradeNo', 'subOrderId', 'mobile',
        'payDateStart', 'payDateEnd', 'completeDateStart', 'completeDateEnd']
      keys.forEach(key => {
        if (!isEmpty(this.orderQuery[key])) {
          params[key] = this.orderQuery[key]
        }
      })
      if (this.querySubStatus >= 0) {
        params.subStatus = this.querySubStatus
      }
      if (this.queryVendor >= 0) {
        params.merchantId = this.queryVendor
      }
      if (!isEqual(this.queryParams, params)) {
        this.queryParams = { ...params }
        this.queryOffset = 1
      }
      return { ...params, pageIndex: this.queryOffset, pageSize: this.queryLimit }
    },
    async getWorkOrder(subOrderId) {
      try {
        const params = { orderId: subOrderId, pageIndex: 1, pageSize: 1 }
        const data = await getWorkOrderListApi(params)
        if (data && data.total === 1) {
          return data.rows[0]
        }
      } catch (e) {
        console.warn('Work orders List error: ' + e)
      }
      return null
    },
    async getOrderList() {
      if (this.hasViewPermission) {
        try {
          if (this.vendorApproved) {
            if (this.vendors.length === 0) {
              await this.getVendorList()
            }
            this.listLoading = true
            const params = this.getSearchParams()
            const { code, data } = await getOrderListApi(params)
            if (code === 200) {
              this.orderTotal = data.result.total
              this.orderData = []
              for (const order of data.result.list) {
                const { subStatus, subOrderId, ...rest } = order
                const merchantName = this.getVendorName(order.merchantId)
                let workOrderId = null
                let workOrderStatus = null
                if (subStatus === suborder_status_requested_service) {
                  const workOrder = await this.getWorkOrder(subOrderId)
                  workOrderId = workOrder ? workOrder.id : null
                  workOrderStatus = workOrder ? workOrder.status : null
                }
                this.orderData.push({
                  subStatus, subOrderId, workOrderId, workOrderStatus, merchantName, ...rest
                })
              }
            }
          }
        } catch (e) {
          console.warn('Orders List error: ' + e)
        } finally {
          this.listLoading = false
        }
      } else {
        this.$message.warning('没有查看订单权限，请联系管理员！')
      }
    },
    handleViewMainOrder(orderId) {
      this.$router.push({
        name: 'ViewMainOrder',
        params: { mainId: orderId }
      })
    },
    handleViewSubOrder(subOrderId) {
      this.$router.push({
        name: 'ViewSubOrder',
        params: { subId: subOrderId }
      })
    },
    handleEditOrderRemark(id) {
      this.$prompt('请输入订单备注信息', '备注', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async({ value }) => {
        try {
          await updateSubOrderApi({ id, remark: value })
          this.$message.success('更新订单备注信息成功！')
        } catch (e) {
          this.$message.error('更新订单备注信息失败！')
        }
      }).catch(_ => {
        console.debug('Update order remark cancelled')
      })
    },
    onQueryStatusChanged(value) {
      this.querySubStatus = value
    },
    onQueryVendorChanged(value) {
      this.queryVendor = value
    },
    downloadBlobData(data, filename) {
      try {
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Download blob data error:' + e)
      }
    },
    handleSearchOrders() {
      this.getOrderList()
    },
    handleShowExportDialog() {
      this.exportForm.merchantId = -1
      this.exportReconciliation = false
      this.exportPayment = false
      this.exportDialogVisible = true
    },
    handleShowReconciliationDialog() {
      this.exportForm.merchantId = -1
      this.exportReconciliation = true
      this.exportPayment = false
      this.exportDialogVisible = true
    },
    handleShowPaymentExportDialog() {
      this.exportForm.payType = null
      this.exportReconciliation = false
      this.exportPayment = true
      this.exportDialogVisible = true
    },
    async handleExportOrders() {
      const format = 'YYYY-MM-DD'
      const startDate = moment(this.exportForm.payStartDate, format)
      const endDate = moment(this.exportForm.payEndDate, format)
      if (startDate.isAfter(endDate)) {
        this.$message.warning('导出订单的开始时间必须早于结束时间！')
        return
      }
      endDate.subtract(1, 'months')
      if (endDate.isAfter(startDate)) {
        this.$message.warning('导出订单的时间段不能大于一个自然月！')
        return
      }

      const params = {
        payStartDate: this.exportForm.payStartDate,
        payEndDate: this.exportForm.payEndDate
      }
      if (this.hasVendorPermission) {
        if (this.exportForm.merchantId > 0) {
          params.merchantId = this.exportForm.merchantId
        }
      } else {
        params.merchantId = this.vendorId
      }
      this.$refs.exportForm.resetFields()
      try {
        const data = this.hasVendorPermission
          ? await exportOrdersApi(params) : await exportVendorOrdersApi(params)
        const filename = `订单列表-${params.payStartDate}-${params.payEndDate}.xls`
        this.downloadBlobData(data, filename)
      } catch (e) {
        console.warn('Order export error:' + e)
        this.$message.warning('未找到有效的订单数据！')
      }
    },
    async handleExportReconciliation() {
      this.exportDialogVisible = false
      const params = {
        payStartDate: this.exportForm.payStartDate,
        payEndDate: this.exportForm.payEndDate
      }
      if (this.hasVendorPermission) {
        if (this.exportForm.merchantId > 0) {
          params.merchantId = this.exportForm.merchantId
        }
      } else {
        params.merchantId = this.vendorId
      }
      this.$refs.exportForm.resetFields()
      try {
        const data = this.hasVendorPermission
          ? await exportReconciliationApi(params) : await exportVendorReconciliationApi(params)
        const filename = `结算订单列表-${params.payStartDate}-${params.payEndDate}.xls`
        this.downloadBlobData(data, filename)
      } catch (e) {
        console.warn('Order export error:' + e)
        this.$message.warning('未找到有效的结算订单数据！')
      }
    },
    async handleExportPayment() {
      this.exportDialogVisible = false
      const params = {
        startDate: this.exportForm.payStartDate,
        endDate: this.exportForm.payEndDate,
        payType: this.exportForm.payType
      }
      this.$refs.exportForm.resetFields()
      try {
        const data = await exportPaymentBillApi(params)
        const payOption = this.paymentOptions.find(item => item.value === params.payType)
        const payLabel = payOption ? payOption.label : ''
        const filename = `${payLabel}-交易订单列表-${params.startDate}-${params.endDate}.xls`
        this.downloadBlobData(data, filename)
      } catch (e) {
        console.warn('Order export error:' + e)
        this.$message.warning('未找到有效的结算订单数据！')
      }
    },
    handleCancelExport() {
      this.$refs.exportForm.resetFields()
      this.exportDialogVisible = false
    },
    handleConfirmExport() {
      this.$refs.exportForm.validate(valid => {
        if (valid) {
          this.exportDialogVisible = false
          if (this.exportReconciliation) {
            this.handleExportReconciliation()
          } else if (this.exportPayment) {
            this.handleExportPayment()
          } else {
            this.handleExportOrders()
          }
        }
      })
    }
  }
}
</script>

<style scoped>
  .text-item {
    text-align: start
  }
</style>

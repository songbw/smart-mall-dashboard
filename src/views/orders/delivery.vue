<template>
  <div class="app-container">
    <el-tabs v-model="queryAppId" type="card" @tab-click="onAppIdChanged">
      <el-tab-pane
        v-for="item in appIdOptions"
        :key="item.appId"
        :label="item.name"
        :name="item.appId"
      />
    </el-tabs>
    <el-form inline>
      <el-form-item label="子订单编号">
        <el-input
          v-model="querySubOrderId"
          :clearable="true"
          placeholder="输入子订单编号"
          maxlength="100"
          style="width: 600px"
        />
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item label="收货人电话">
        <el-input v-model="queryMobile" :clearable="true" placeholder="输入收货人电话号码" maxlength="20" />
      </el-form-item>
      <el-form-item label="收货人姓名">
        <el-input v-model="queryName" :clearable="true" placeholder="输入收货人姓名" maxlength="20" />
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
    </el-form>
    <el-form :inline="true">
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
        <el-button icon="el-icon-search" type="primary" @click="getOrderList">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <el-form inline>
      <el-form-item>
        <el-button v-if="hasEditPermission" icon="el-icon-coin" type="info" @click="handleBatchDelivery">
          批量发货
        </el-button>
        <el-button
          v-if="hasExportPermission && hasVendorPermission"
          icon="el-icon-download"
          type="warning"
          :loading="exportingDailyDelivery"
          @click="handleExportDailyDeliverOrders"
        >
          导出每日概况
        </el-button>
        <el-button
          v-if="hasExportPermission && hasVendorPermission"
          icon="el-icon-download"
          type="warning"
          :loading="exportingOrderDelivery"
          @click="exportDialogVisible = true"
        >
          导出发货订单列表
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="ordersTable"
      v-loading="listLoading"
      :data="orderData"
      :fit="true"
      border
      style="width: 100%;"
    >
      <el-table-column align="center" label="主订单编号" width="100">
        <template slot-scope="scope">
          <router-link
            :to="{ name: 'ViewMainOrder', params: { mainId: scope.row.id }}"
            class="el-link el-link--primary is-underline"
          >
            {{ scope.row | orderIdFilter }}
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
            :price="scope.row.unitPrice"
            :sku-id="scope.row.skuId"
            :merchant-name="scope.row.merchantName"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="收货人">
        <template slot-scope="scope">
          <div>
            <div class="text-item">{{ '姓名：' + scope.row.receiverName }}</div>
            <div class="text-item">{{ '电话：' + scope.row.mobile }}</div>
            <div class="text-item">
              {{ '地址：' + scope.row.provinceName + ' ' + scope.row.cityName + ' ' + scope.row.countyName }}
            </div>
            <div class="text-item" style="margin-left: 2rem">{{ scope.row.address }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单时间" width="220">
        <template slot-scope="scope">
          <div>
            <div class="text-item">
              下单：<span>{{ scope.row.createdAt | timeFilter }}</span>
            </div>
            <div class="text-item">
              支付：<span>{{ scope.row.paymentAt | timeFilter }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单状态" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.subStatus | orderStatusFilter }}</span>
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        class-name="small-padding fixed-width"
        label="操作"
        width="120"
      >
        <template slot-scope="scope">
          <el-button
            v-if="querySubStatus !== statusDelivered"
            :disabled="!hasEditPermission"
            size="mini"
            type="primary"
            @click="handleDeliverSubOrder(scope.row)"
          >
            发货
          </el-button>
          <el-button
            v-else
            :disabled="!hasEditPermission"
            size="mini"
            type="primary"
            @click="handleDeliverSubOrder(scope.row)"
          >
            修改物流
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
    <import-dialog
      :dialog-visible="importDialogVisible"
      @canceled="importDialogVisible = false"
      @finished="onImportFinished"
    />
    <express-selection
      :dialog-visible="deliveryDialogVisible"
      :order-id="deliveryData.orderId"
      :sub-order-id="deliveryData.subOrderId"
      :sub-id="deliveryData.subId"
      :sub-order-status="deliveryData.subOrderStatus"
      @cancelled="handleCancelDeliver"
      @confirmed="handleSetDeliver"
    />
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="exportDialogVisible"
      title="导出订单发货列表"
    >
      <el-form ref="exportForm" :model="exportForm" :rules="exportRules" label-width="7rem">
        <el-form-item label="开始日期" prop="payDateStart">
          <el-date-picker
            v-model="exportForm.payDateStart"
            placeholder="选择开始日期"
            type="date"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="结束日期" prop="payDateEnd">
          <el-date-picker
            v-model="exportForm.payDateEnd"
            placeholder="选择结束日期"
            type="date"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="运营平台" prop="appId">
          <el-select v-model="exportForm.appId">
            <el-option
              v-for="item in appIdOptions"
              :key="item.appId"
              :label="item.name"
              :value="item.appId"
            >
              <span>{{ item.name }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="hasVendorPermission"
          label="供应商名"
          prop="merchantId"
        >
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
import Pagination from '@/components/Pagination'
import ExpressSelection from '@/components/ExpressSelection'
import OrderProduct from './OrderProduct'
import {
  getOrderListApi,
  exportVendorDeliverOrdersApi
} from '@/api/orders'
import { getVendorListApi } from '@/api/vendor'
import {
  suborder_status_waiting_deliver,
  suborder_status_delivered,
  SubOrderStatusDefinitions,
  vendor_status_approved
} from '@/utils/constants'
import ImportDialog from './ImportDialog'
import { OrderPermissions } from '@/utils/role-permissions'
import trim from 'lodash/trim'
import * as excel from '@/utils/Export2Excel'

const maxExportMonths = 3

const ExportOrderHeaders = [
  { field: 'subOrderId', label: '子订单编号' },
  { field: 'merchantName', label: '供应商' },
  { field: 'skuId', label: '商品SKU' },
  { field: 'name', label: '商品名称' },
  { field: 'num', label: '购买数量' },
  { field: 'receiverName', label: '收货人姓名' },
  { field: 'mobile', label: '收货人电话' },
  { field: 'provinceName', label: '省' },
  { field: 'cityName', label: '市' },
  { field: 'countyName', label: '区' },
  { field: 'address', label: '详细地址' }
]

const validateDates = (start, end, amount = 3) => {
  const format = 'YYYY-MM-DD'
  if (start && end) {
    const startDate = moment(start, format)
    const maxEndDate = moment(start, format).add(amount, 'months')
    const endDate = moment(end, format)
    return endDate.isSameOrAfter(startDate) && endDate.isSameOrBefore(maxEndDate)
  } else {
    return false
  }
}

export default {
  name: 'Orders',
  components: { Pagination, OrderProduct, ImportDialog, ExpressSelection },
  filters: {
    orderIdFilter: order => {
      return isEmpty(order.aoyiId)
        ? order.tradeNo ? order.tradeNo.substring(order.tradeNo.length - 8) : ''
        : order.aoyiId
    },
    orderStatusFilter: status => {
      const find = SubOrderStatusDefinitions.find(option => option.value === status)
      return find ? find.label : status
    },
    timeFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      statusDelivered: suborder_status_delivered,
      vendorLoading: false,
      vendorList: [],
      listLoading: false,
      queryParams: null,
      orderData: [],
      orderTotal: 0,
      merchantName: '',
      deliveryDialogVisible: false,
      importDialogVisible: false,
      exportingDailyDelivery: false,
      exportDialogVisible: false,
      exportingOrderDelivery: false,
      deliveryData: {
        orderId: null,
        subOrderId: null,
        subId: null,
        subOrderStatus: null
      },
      exportForm: {
        merchantId: -1,
        payDateStart: null,
        payDateEnd: null,
        appId: 'all'
      },
      exportRules: {
        payDateStart: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            const amount = maxExportMonths
            if ((value && this.exportForm.payDateEnd === null) ||
              validateDates(this.exportForm.payDateStart, this.exportForm.payDateEnd, amount)) {
              callback()
            } else {
              callback(new Error(`请选择合适导出的开始日期，区间最多${amount}个月`))
            }
          }
        }],
        payDateEnd: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            const amount = maxExportMonths
            if ((value && this.exportForm.payDateStart === null) ||
              validateDates(this.exportForm.payDateStart, this.exportForm.payDateEnd, amount)) {
              callback()
            } else {
              callback(new Error(`请选择合适导出的结束日期， 区间最多${amount}个月`))
            }
          }
        }],
        appId: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择对应运营平台'))
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
      platformAppList: 'platformAppList',
      validAppList: 'validAppList',
      orderQuery: 'orderDeliveryQuery'
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
    hasVendorPermission() {
      return this.userPermissions.includes(OrderPermissions.vendor)
    },
    statusOptions() {
      return SubOrderStatusDefinitions.filter(option =>
        option.value === suborder_status_waiting_deliver || option.value === suborder_status_delivered)
    },
    vendorOptions() {
      return this.vendorLoading ? [] : [{ value: -1, label: '全部' }].concat(this.vendorList)
    },
    appIdOptions() {
      if (this.showAllAppIdList) {
        return [{ appId: 'all', name: '全部' }].concat(this.platformAppList)
      } else {
        return this.validAppList
      }
    },
    showAllAppIdList() {
      return this.validAppList.length === this.platformAppList.length
    },
    queryAppId: {
      get() {
        return this.orderQuery.appId
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { appId: value })
      }
    },
    querySubOrderId: {
      get() {
        return this.orderQuery.subOrderId
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { subOrderId: trim(value) })
      }
    },
    queryMobile: {
      get() {
        return this.orderQuery.mobile
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { mobile: trim(value) })
      }
    },
    queryName: {
      get() {
        return this.orderQuery.receiverName
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { receiverName: trim(value) })
      }
    },
    querySubStatus: {
      get() {
        return this.orderQuery.subStatus
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { subStatus: value })
      }
    },
    queryPayStartDate: {
      get() {
        return this.orderQuery.payDateStart
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { payDateStart: value })
      }
    },
    queryPayEndDate: {
      get() {
        return this.orderQuery.payDateEnd
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { payDateEnd: value })
      }
    },
    queryOffset: {
      get() {
        return this.orderQuery.pageIndex
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { pageIndex: value })
      }
    },
    queryLimit: {
      get() {
        return this.orderQuery.pageSize
      },
      set(value) {
        this.$store.commit('orders/SET_DELIVERY_QUERY_DATA', { pageSize: value })
      }
    }
  },
  created() {
    this.prepareData()
  },
  methods: {
    async prepareData() {
      this.listLoading = true
      await this.getAppPlatformList()
      await this.getVendorList()
      await this.getOrderList()
      this.listLoading = false
    },
    async getAppPlatformList() {
      try {
        if (this.platformAppList.length === 0) {
          await this.$store.dispatch('app/getPlatformList')
        }
        if (!this.showAllAppIdList) {
          this.queryAppId = this.validAppList.length > 0 ? this.validAppList[0].appId : 'invalid'
        }
      } catch (e) {
        console.warn('Deliver get app list error:' + e)
      }
    },
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 1000,
          status: vendor_status_approved
        }
        this.vendorLoading = true
        const data = await getVendorListApi(params)
        this.vendorList = data.rows.map(row => {
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
      const params = {
        subStatus: this.querySubStatus
      }
      const keys = ['subOrderId', 'mobile', 'receiverName', 'payDateStart', 'payDateEnd']
      keys.forEach(key => {
        if (!isEmpty(this.orderQuery[key])) {
          params[key] = this.orderQuery[key]
        }
      })
      if (this.queryAppId !== 'all') {
        params.appId = this.queryAppId
      }
      if (!isEqual(this.queryParams, params)) {
        this.queryParams = { ...params }
        this.queryOffset = 1
      }
      return { ...params, pageIndex: this.queryOffset, pageSize: this.queryLimit }
    },
    async getOrderList() {
      if (this.hasViewPermission) {
        try {
          if (this.vendorApproved) {
            this.listLoading = true
            const params = this.getSearchParams()
            const { code, data } = await getOrderListApi(params)
            if (code === 200) {
              this.orderTotal = data.result.total
              this.orderData = data.result.list.map(item => (
                { ...item, merchantName: this.getVendorName(item.merchantId) }))
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
    handleDeliverSubOrder(row) {
      this.deliveryData.orderId = row.id
      this.deliveryData.subOrderId = row.subOrderId
      this.deliveryData.subId = row.subId
      this.deliveryData.subOrderStatus = row.subStatus
      this.deliveryDialogVisible = true
    },
    onQueryStatusChanged(value) {
      this.querySubStatus = value
      this.getOrderList()
    },
    handleCancelDeliver() {
      this.deliveryDialogVisible = false
    },
    handleSetDeliver() {
      this.deliveryDialogVisible = false
      this.getOrderList()
    },
    handleBatchDelivery() {
      this.importDialogVisible = true
    },
    onImportFinished() {
      this.importDialogVisible = false
      this.getOrderList()
    },
    onAppIdChanged(platform) {
      if (this.queryAppId !== platform.appId) {
        this.getOrderList()
      }
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
    async handleExportDailyDeliverOrders() {
      try {
        this.exportingDailyDelivery = true
        const data = await exportVendorDeliverOrdersApi()
        const now = moment().format('YYYY-MM-DD')
        const filename = `供应商发货概况-${now}.xls`
        this.downloadBlobData(data, filename)
      } catch (e) {
        console.warn('Export deliver order error:' + e)
      } finally {
        this.exportingDailyDelivery = false
      }
    },
    handleCancelExport() {
      this.exportDialogVisible = false
      this.$refs.exportForm.resetFields()
    },
    handleConfirmExport() {
      this.$refs.exportForm.validate(valid => {
        if (valid) {
          this.exportDialogVisible = false
          this.handleExportDeliveryOrders()
        }
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => v[j]))
    },
    handleExportToFile(orderList, filename) {
      const tHeaders = ExportOrderHeaders.map(header => header.label)
      const tFields = ExportOrderHeaders.map(header => header.field)
      const data = this.formatJson(tFields, orderList)
      excel.export_json_to_excel({
        header: tHeaders,
        data,
        filename
      })
    },
    async handleExportDeliveryOrders() {
      const params = {
        subStatus: suborder_status_waiting_deliver,
        payDateStart: this.exportForm.payDateStart,
        payDateEnd: this.exportForm.payDateEnd,
        pageIndex: 1,
        pageSize: 80
      }
      if (this.exportForm.appId !== 'all') {
        params.appId = this.exportForm.appId
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
        let deliveryList = []
        let pageIndex = 1
        let pageTotal = 1
        do {
          params.pageIndex = pageIndex
          const { code, data } = await getOrderListApi(params)
          if (code === 200) {
            pageTotal = data.result.pages
            const resultList = data.result.list.map(item => {
              const order = {}
              for (const header of ExportOrderHeaders) {
                if (header.field in item) {
                  order[header.field] = item[header.field]
                }
              }
              order.merchantName = this.getVendorName(item.merchantId)
              return order
            })
            deliveryList = deliveryList.concat(resultList)
          }
          pageIndex++
        } while (pageIndex <= pageTotal)
        const appOption = 'appId' in params ? this.platformAppList.find(item => item.appId === params.appId) : null
        const appLabel = appOption ? appOption.name + '-' : ''
        const vendorName = 'merchantId' in params ? this.getVendorName(params.merchantId) : null
        const vendorLabel = isEmpty(vendorName) ? '' : vendorName + '-'
        const filename = `${appLabel}${vendorLabel}待发货订单列表-${params.payDateStart}-${params.payDateEnd}`
        this.handleExportToFile(deliveryList, filename)
      } catch (e) {
        console.warn('Order export error:' + e)
        this.$message.warning('未找到有效的订单数据！')
      }
    }
  }
}
</script>

<style scoped>
  .text-item {
    text-align: start
  }
</style>

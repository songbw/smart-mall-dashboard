<template>
  <div class="app-container">
    <el-tabs v-model="orderQuery.appId" type="card" @tab-click="onAppIdChanged">
      <el-tab-pane
        v-for="item in appIdOptions"
        :key="item.appId"
        :label="item.name"
        :name="item.appId"
      />
    </el-tabs>
    <el-form :inline="true">
      <el-form-item label="收货人电话">
        <el-input v-model="orderQuery.mobile" :clearable="true" placeholder="输入收货人电话号码" />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select :value="orderQuery.subStatus" @change="onQueryStatusChanged">
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
          v-model="orderQuery.payDateStart"
          placeholder="选择开始日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="支付结束日期">
        <el-date-picker
          v-model="orderQuery.payDateEnd"
          placeholder="选择结束日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="getOrderList">
          搜索
        </el-button>
        <el-button v-if="hasEditPermission" icon="el-icon-coin" type="info" @click="handleBatchDelivery">
          批量发货
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
            :price="scope.row.salePrice"
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
      <el-table-column align="center" label="订单时间" width="200">
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
        width="80"
      >
        <template slot-scope="scope">
          <el-button
            :disabled="!hasEditPermission || orderQuery.subStatus === statusDelivered"
            size="mini"
            type="primary"
            @click="handleDeliverSubOrder(scope.row)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :limit.sync="orderQuery.pageSize"
      :page.sync="orderQuery.pageIndex"
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
      @cancelled="handleCancelDeliver"
      @confirmed="handleSetDeliver"
    />
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
  uploadLogisticsApi
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

const shouldShowAoyiId = process.env.VUE_APP_HOST === 'GAT-SN' // aoyiId is Suning Order Id

export default {
  name: 'Orders',
  components: { Pagination, OrderProduct, ImportDialog, ExpressSelection },
  filters: {
    orderIdFilter: order => {
      if (shouldShowAoyiId) {
        return order.aoyiId
      } else {
        return order.tradeNo ? order.tradeNo.substring(order.tradeNo.length - 8) : ''
      }
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
      orderQuery: {
        appId: 'all',
        mobile: '',
        subStatus: 1,
        payDateStart: null,
        payDateEnd: null,
        pageIndex: 1,
        pageSize: 20
      },
      orderData: [],
      orderTotal: 0,
      merchantName: '',
      deliveryDialogVisible: false,
      importDialogVisible: false,
      deliveryData: {
        orderId: null,
        subOrderId: null
      },
      deliveryRules: {
        comCode: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择物流公司'))
            } else {
              callback()
            }
          }
        }],
        logisticsId: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请输入物流单号'))
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
      platformAppList: 'platformAppList'
    }),
    hasViewPermission() {
      return this.userPermissions.includes(OrderPermissions.view)
    },
    hasEditPermission() {
      return this.userPermissions.includes(OrderPermissions.update)
    },
    statusOptions() {
      return SubOrderStatusDefinitions.filter(option =>
        option.value === suborder_status_waiting_deliver || option.value === suborder_status_delivered)
    },
    vendorOptions() {
      return this.vendorLoading ? [] : [{ value: -1, label: '全部' }].concat(this.vendorList)
    },
    appIdOptions() {
      return [{ appId: 'all', name: '全部' }].concat(this.platformAppList)
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
        subStatus: this.orderQuery.subStatus
      }
      const keys = ['mobile', 'payDateStart', 'payDateEnd']
      keys.forEach(key => {
        if (!isEmpty(this.orderQuery[key])) {
          params[key] = this.orderQuery[key]
        }
      })
      if (this.orderQuery.appId !== 'all') {
        params.appId = this.orderQuery.appId
      }
      if (!isEqual(this.queryParams, params)) {
        this.queryParams = { ...params }
        this.orderQuery.pageIndex = 1
      }
      return { ...params, pageIndex: this.orderQuery.pageIndex, pageSize: this.orderQuery.pageSize }
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
      this.deliveryDialogVisible = true
    },
    onQueryStatusChanged(value) {
      this.orderQuery.subStatus = value
      this.getOrderList()
    },
    handleCancelDeliver() {
      this.deliveryDialogVisible = false
    },
    async handleSetDeliver(express) {
      this.deliveryDialogVisible = false
      this.listLoading = true
      const params = {
        total: 1,
        logisticsList: [{ ...this.deliveryData, ...express }]
      }
      try {
        const { code } = await uploadLogisticsApi(params)
        if (code === 200) {
          this.$message.success('上传物流信息成功！')
          this.getOrderList()
        }
      } catch (e) {
        console.warn('Delivery upload logistics error:' + e)
        this.$message.error('上传物流信息失败，请联系管理员！')
      } finally {
        this.listLoading = false
      }
    },
    handleBatchDelivery() {
      this.importDialogVisible = true
    },
    onImportFinished() {
      this.importDialogVisible = false
      this.getOrderList()
    },
    onAppIdChanged(platform) {
      if (this.orderQuery.appId !== platform.appId) {
        this.getOrderList()
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

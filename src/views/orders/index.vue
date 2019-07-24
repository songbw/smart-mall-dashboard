<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="主订单号">
        <el-input v-model="queryTradeNo" placeholder="输入主订单后8位" clearable />
      </el-form-item>
      <el-form-item label="子订单号">
        <el-input v-model="querySubOrderId" placeholder="输入子订单编号" clearable />
      </el-form-item>
    </el-form>
    <el-form :inline="true">
      <el-form-item label="电话号码">
        <el-input v-model="queryMobile" placeholder="输入收货人电话号码" clearable />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select :value="queryStatus" @change="onQueryStatusChanged">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isAdminUser" label="供应商名">
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
      <el-form-item label="支付开始日期">
        <el-date-picker
          v-model="queryStartDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择开始日期"
        />
      </el-form-item>
      <el-form-item label="支付结束日期">
        <el-date-picker
          v-model="queryEndDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="选择结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getOrderList">
          搜索
        </el-button>
        <el-button type="success" icon="el-icon-download" @click="handleExportOrders">
          导出全部订单
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      ref="ordersTable"
      v-loading="listLoading"
      :data="orderData"
      border
      fit
      style="width: 100%;"
    >
      <el-table-column label="主订单编号" align="center" width="100">
        <template slot-scope="scope">
          <el-link :href="'/orders/viewMainOrder/' + scope.row.id" type="primary">
            {{ scope.row.tradeNo.substring(scope.row.tradeNo.length - 8) }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="子订单编号" align="center" width="200">
        <template slot-scope="scope">
          <el-link :href="'/orders/viewSubOrder/' + scope.row.subOrderId" type="primary">
            {{ scope.row.subOrderId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="商品" align="center">
        <template slot-scope="scope">
          <order-product
            :image-url="scope.row.image"
            :name="scope.row.name"
            :price="scope.row.unitPrice"
            :count="scope.row.num"
            :sku-id="scope.row.skuId"
            :mpu="scope.row.mpu"
          />
        </template>
      </el-table-column>
      <el-table-column label="收货人" align="center" width="160">
        <template slot-scope="scope">
          <div>
            <div class="text-item">{{ '姓名：' + scope.row.receiverName }}</div>
            <div class="text-item">{{ '电话：' + scope.row.mobile }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="订单时间" align="center" width="200">
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
      <el-table-column label="订单状态" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.status | OrderStatus }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleViewSubOrder(scope.row.subOrderId)"
          >
            查看
          </el-button>
          <el-button
            type="info"
            size="mini"
            @click="handleEditOrderRemark(scope.row.id)"
          >
            备注
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="orderTotal"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      :page-sizes="[10, 20, 40, 80]"
      @pagination="getOrderList"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import OrderProduct from './OrderProduct'
import {
  getOrderListApi,
  updateOrderRemarkApi,
  exportOrdersApi
} from '@/api/orders'
import {
  getVendorListApi
} from '@/api/vendor'
import { OrderStatusDefinitions, vendor_status_approved } from '@/utils/constants'

export default {
  name: 'Orders',
  components: { Pagination, OrderProduct },
  filters: {
    OrderStatus: status => {
      const find = OrderStatusDefinitions.find(option => option.value === status)
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
      statusOptions: [{
        value: -2,
        label: '全部'
      }].concat(OrderStatusDefinitions),
      vendors: [],
      listLoading: false,
      orderData: [],
      orderTotal: 0,
      merchantName: ''
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      vendorApproved: 'vendorApproved',
      orderQuery: 'orderQuery'
    }),
    vendorOptions() {
      return [{ value: -1, label: '全部' }].concat(this.vendors)
    },
    queryTradeNo: {
      get() {
        return this.orderQuery.tradeNo
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { tradeNo: value })
      }
    },
    querySubOrderId: {
      get() {
        return this.orderQuery.subOrderId
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { subOrderId: value })
      }
    },
    queryMobile: {
      get() {
        return this.orderQuery.mobile
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { mobile: value })
      }
    },
    queryStatus: {
      get() {
        return this.orderQuery.status
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { status: value })
      }
    },
    queryVendor: {
      get() {
        return this.orderQuery.merchantId
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { merchantId: value })
      }
    },
    queryStartDate: {
      get() {
        return this.orderQuery.payDateStart
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { payDateStart: value })
      }
    },
    queryEndDate: {
      get() {
        return this.orderQuery.payDateEnd
      },
      set(value) {
        this.$store.commit('orders/SET_SEARCH_DATA', { payDateEnd: value })
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
  methods: {
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 100,
          status: vendor_status_approved
        }
        this.listLoading = true
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
        this.listLoading = false
      }
    },
    getSearchParams() {
      const params = {
        pageIndex: this.queryOffset,
        pageSize: this.queryLimit
      }
      const keys = ['tradeNo', 'subOrderId', 'mobile', 'payDateStart', 'payDateEnd']
      keys.forEach(key => {
        if (!isEmpty(this.orderQuery[key])) {
          params[key] = this.orderQuery[key]
        }
      })
      if (this.queryStatus > -2) {
        params.status = this.queryStatus
      }
      return params
    },
    async getOrderList() {
      try {
        if (this.vendorApproved) {
          if (this.vendors.length === 0) {
            await this.getVendorList()
          }
          this.listLoading = true
          const params = this.getSearchParams()
          const { data } = await getOrderListApi(params)
          this.orderTotal = data.result.total
          this.orderData = data.result.list
        }
      } catch (e) {
        console.warn('Orders List error: ' + e)
      } finally {
        this.listLoading = false
      }
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
          await updateOrderRemarkApi({ id, remark: value })
          this.$message.success('更新订单备注信息成功！')
        } catch (e) {
          this.$message.error('更新订单备注信息失败！')
        }
      }).catch(_ => {
        console.debug('Update order remark cancelled')
      })
    },
    onQueryStatusChanged(value) {
      this.queryStatus = value
    },
    onQueryVendorChanged(value) {
      this.queryVendor = value
      const vendor = this.vendors.find(item => item.value === value)
      if (vendor) {
        this.merchantName = vendor.label
      } else {
        this.merchantName = ''
      }
    },
    async handleExportOrders() {
      if (this.queryStartDate === null || this.queryEndDate === null) {
        this.$message.warning('请先选择导出订单的时间段！')
        return
      }
      const format = 'YYYY-MM-DD'
      const startDate = moment(this.queryStartDate, format)
      const endDate = moment(this.queryEndDate, format)
      if (startDate.isAfter(endDate)) {
        this.$message.warning('导出订单的开始时间必须早于结束时间！')
        return
      }
      endDate.subtract(1, 'months')
      if (endDate.isAfter(startDate)) {
        this.$message.warning('导出订单的时间段不能大于一个自然月！')
        return
      }
      if (this.queryVendor < 1) {
        this.$message.warning('请先选择导出订单的供应商！')
        return
      }
      const params = {
        payStartDate: this.queryStartDate,
        payEndDate: this.queryEndDate,
        merchantId: this.queryVendor
      }
      try {
        const data = await exportOrdersApi(params)
        const blob = new Blob([data])
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        const filename = `Orders_${this.merchantName}_${this.queryStartDate}_${this.queryEndDate}.xls`
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (e) {
        console.warn('Order export error:' + e)
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

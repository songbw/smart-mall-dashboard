<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="主订单号">
        <el-input v-model="queryTradeNo" :clearable="true" placeholder="输入主订单后8位" />
      </el-form-item>
      <el-form-item label="子订单号">
        <el-input v-model="querySubOrderId" :clearable="true" placeholder="输入子订单编号" />
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
          placeholder="选择开始日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item label="支付结束日期">
        <el-date-picker
          v-model="queryEndDate"
          placeholder="选择结束日期"
          type="date"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="getOrderList">
          搜索
        </el-button>
        <el-button icon="el-icon-download" type="success" @click="handleExportOrders">
          批量导出订单
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
          <el-button type="text" @click="handleViewMainOrder(scope.row.id)">
            {{ scope.row.tradeNo.substring(scope.row.tradeNo.length - 8) }}
          </el-button>
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
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="订单状态" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.subStatus | OrderStatus }}</span>
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
            size="mini"
            type="info"
            @click="handleEditOrderRemark(scope.row.id)"
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import OrderProduct from './OrderProduct'
import { exportOrdersApi, getOrderListApi, updateOrderRemarkApi } from '@/api/orders'
import { getVendorListApi } from '@/api/vendor'
import { SubOrderStatusDefinitions, vendor_status_approved } from '@/utils/constants'

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
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      statusOptions: [{
        value: -1,
        label: '全部'
      }].concat(SubOrderStatusDefinitions),
      vendorLoading: false,
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
      return this.vendorLoading ? [] : [{ value: -1, label: '全部' }].concat(this.vendors)
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
          limit: 100,
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
      if (this.querySubStatus >= 0) {
        params.subStatus = this.querySubStatus
      }
      if (this.queryVendor >= 0) {
        params.merchantId = this.queryVendor
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
      this.querySubStatus = value
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

      const params = {
        payStartDate: this.queryStartDate,
        payEndDate: this.queryEndDate
      }
      if (this.queryVendor >= 0) {
        params.merchantId = this.queryVendor
      }
      this.getOrderList()
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

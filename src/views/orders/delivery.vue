<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="电话号码">
        <el-input v-model="orderQuery.mobile" clearable placeholder="输入收货人电话号码" />
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
      <el-table-column align="center" label="主订单编号" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.tradeNo.substring(scope.row.tradeNo.length - 8) }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="子订单编号" width="200">
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
            @click="handleDeliverSubOrder(scope.row.subOrderId)"
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import OrderProduct from './OrderProduct'
import { getOrderListApi } from '@/api/orders'
import { SubOrderStatusDefinitions } from '@/utils/constants'

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
        value: 1,
        label: '待发货'
      }, {
        value: 2,
        label: '已发货'
      }],
      listLoading: false,
      orderQuery: {
        mobile: '',
        subStatus: 1,
        payDateStart: null,
        payDateEnd: null,
        pageIndex: 1,
        pageSize: 20
      },
      orderData: [],
      orderTotal: 0,
      merchantName: ''
    }
  },
  computed: {
    ...mapGetters({
      vendorApproved: 'vendorApproved'
    })
  },
  created() {
    this.getOrderList()
  },
  methods: {
    getSearchParams() {
      const params = {
        subStatus: this.orderQuery.subStatus,
        pageIndex: this.orderQuery.pageIndex,
        pageSize: this.orderQuery.pageSize
      }
      const keys = ['mobile', 'payDateStart', 'payDateEnd']
      keys.forEach(key => {
        if (!isEmpty(this.orderQuery[key])) {
          params[key] = this.orderQuery[key]
        }
      })
      return params
    },
    async getOrderList() {
      try {
        if (this.vendorApproved) {
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
    handleDeliverSubOrder(subOrderId) {
    },
    onQueryStatusChanged(value) {
      this.orderQuery.subStatus = value
      this.getOrderList()
    }
  }
}
</script>

<style scoped>
  .text-item {
    text-align: start
  }
</style>

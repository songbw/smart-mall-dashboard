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
        <el-select v-model="queryStatus">
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
      </el-form-item>
    </el-form>
    <el-table
      ref="ordersTable"
      v-loading="listLoading"
      :data="orderData"
      border
      fit
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        align="center"
        width="55"
      />
      <el-table-column label="主订单编号" align="center" width="100">
        <template slot-scope="scope">
          <el-link :href="'#/orders/viewMainOrder/' + scope.row.id" type="primary">
            {{ scope.row.tradeNo.substring(scope.row.tradeNo.length - 8) }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="子订单编号" align="center" width="100">
        <template slot-scope="scope">
          <el-link :href="'#/orders/viewSubOrder/' + scope.row.subOrderId" type="primary">
            {{ scope.row.subOrderId.substring(scope.row.subOrderId.length - 3) }}
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
            @click="handleEditOrder(scope.row.id)"
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
  getOrderListApi
} from '@/api/orders'
import { OrderStatusDefinitions } from '@/utils/constants'

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
      listLoading: false,
      orderData: [],
      orderTotal: 0,
      orderSelection: []
    }
  },
  computed: {
    ...mapGetters({
      vendorApproved: 'vendorApproved',
      orderQuery: 'orderQuery'
    }),
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
    handleSelectionChange(selection) {
      this.orderSelection = selection
    },
    handleViewSubOrder(subOrderId) {
      this.$router.push({
        name: 'ViewSubOrder',
        params: { subId: subOrderId }
      })
    },
    handleEditOrder(subOrderId) {
    }
  }
}
</script>

<style scoped>
  .text-item {
    text-align: start
  }
</style>

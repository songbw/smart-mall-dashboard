<template>
  <div class="app-container">
    <el-form :inline="true">
      <el-form-item label="电话号码">
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
        <el-button icon="el-icon-coin" type="info" @click="handleBatchDelivery">
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
          <span>{{ scope.row.tradeNo.substring(scope.row.tradeNo.length - 8) }}</span>
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
          <span>{{ scope.row.subStatus | OrderStatus }}</span>
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
            :disabled="orderQuery.subStatus === 2"
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
    <el-dialog
      title="物流信息"
      :visible.sync="deliveryDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form
        ref="deliveryForm"
        v-loading="expressLoading"
        :model="deliveryData"
        :rules="deliveryRules"
        label-width="100px"
      >
        <el-form-item label="物流公司" prop="comCode">
          <el-select :value="deliveryData.comCode" placeholder="请选择物流公司" @change="onExpressSelected">
            <el-option
              v-for="item in expressOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" prop="logisticsId">
          <el-input v-model="deliveryData.logisticsId" placeholder="请输入对应物流公司单号" maxlength="30" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelDeliver">取消</el-button>
        <el-button type="primary" @click="handleSetDeliver">确定</el-button>
      </div>
    </el-dialog>
    <import-dialog
      :dialog-visible="importDialogVisible"
      @canceled="importDialogVisible = false"
      @finished="onImportFinished"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import Pagination from '@/components/Pagination'
import OrderProduct from './OrderProduct'
import {
  getOrderListApi,
  getExpressCompanyApi,
  uploadLogisticsApi
} from '@/api/orders'
import {
  suborder_status_waiting_deliver,
  suborder_status_delivered,
  SubOrderStatusDefinitions
} from '@/utils/constants'
import ImportDialog from './ImportDialog'

export default {
  name: 'Orders',
  components: { Pagination, OrderProduct, ImportDialog },
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
      expressOptions: [],
      listLoading: false,
      queryParams: null,
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
      merchantName: '',
      deliveryDialogVisible: false,
      expressLoading: false,
      importDialogVisible: false,
      deliveryData: {
        orderId: null,
        subOrderId: null,
        logisticsId: null,
        logisticsContent: null,
        comCode: null
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
      vendorApproved: 'vendorApproved'
    }),
    statusOptions() {
      return SubOrderStatusDefinitions.filter(option =>
        option.value === suborder_status_waiting_deliver || option.value === suborder_status_delivered)
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
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
      if (!isEqual(this.queryParams, params)) {
        this.queryParams = { ...params }
        this.orderQuery.pageIndex = 1
      }
      return { ...params, pageIndex: this.orderQuery.pageIndex, pageSize: this.orderQuery.pageSize }
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
    async getExpressList() {
      try {
        if (this.expressOptions.length === 0) {
          const params = { pageNo: 1, pageSize: 100 }
          this.expressLoading = true
          const { data } = await getExpressCompanyApi(params)
          this.expressOptions = data.result.list.map(item => {
            return {
              value: item.code,
              label: item.name
            }
          })
        }
      } catch (e) {
        console.warn('Delivery get express error: ' + e)
        this.$message.warning('获取物流公司列表失败，请联系管理员！')
      } finally {
        this.expressLoading = false
      }
    },
    handleDeliverSubOrder(row) {
      this.deliveryData.orderId = row.id
      this.deliveryData.subOrderId = row.subOrderId
      this.deliveryDialogVisible = true
      this.getExpressList()
    },
    onQueryStatusChanged(value) {
      this.orderQuery.subStatus = value
    },
    onExpressSelected(value) {
      this.deliveryData.comCode = value
      this.deliveryData.logisticsContent = this.expressOptions.find(option => option.value === value).label
    },
    handleCancelDeliver() {
      this.deliveryDialogVisible = false
      this.$refs.deliveryForm.clearValidate()
      Object.keys(this.deliveryData).forEach(key => {
        this.deliveryData[key] = null
      })
    },
    handleSetDeliver() {
      this.$refs.deliveryForm.validate(async(valid) => {
        if (valid) {
          this.expressLoading = true
          const params = {
            total: 1,
            logisticsList: [{ ...this.deliveryData }]
          }
          try {
            uploadLogisticsApi(params)
            this.$message.success('上传物流信息成功！')
          } catch (e) {
            console.warn('Delivery upload logistics error:' + e)
            this.$message.error('上传物流信息失败，请联系管理员！')
            this.getOrderList()
          } finally {
            this.expressLoading = false
            this.deliveryDialogVisible = false
          }
        }
      })
    },
    handleBatchDelivery() {
      this.importDialogVisible = true
    },
    onImportFinished() {
      this.importDialogVisible = false
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

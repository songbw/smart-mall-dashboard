<template>
  <div v-loading="dataLoading" class="app-container">
    <el-row :gutter="20" style="margin: 10px">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header" style="display: flex;justify-content: space-between;align-items: center">
            <span class="card-header-text">售后信息</span>
            <el-button type="primary">
              处理
            </el-button>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="售后状态:">
              <span>{{ workOrderData.status | workOrderStatus }}</span>
            </el-form-item>
            <el-form-item label="售后类型">
              <span>{{ workOrderData.typeName }}</span>
            </el-form-item>
            <el-form-item label="售后原因:">
              <span>{{ workOrderData.title }}</span>
            </el-form-item>
            <el-form-item label="售后描述:">
              <span>{{ workOrderData.description }}</span>
            </el-form-item>
            <el-form-item label="申请时间:">
              <span>{{ workOrderData.createTime | timeFilter }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin: 10px">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span class="card-header-text">订单信息</span>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="订单状态:">
              <span>{{ orderData.status | orderStatus }}</span>
            </el-form-item>
            <el-form-item label="主订单编号:">
              <span>{{ orderData.tradeNo }}</span>
            </el-form-item>
            <el-form-item label="子订单编号:">
              <span>{{ orderData.subOrderId }}</span>
            </el-form-item>
            <el-form-item label="下单时间:">
              <span>{{ orderData.createdAt | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="更新时间:">
              <span>{{ orderData.updatedAt | timeFilter }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span class="card-header-text">收货信息</span>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="OpenID:">
              <span>{{ orderData.openId }}</span>
            </el-form-item>
            <el-form-item label="收货人姓名:">
              <span>{{ orderData.receiverName }}</span>
            </el-form-item>
            <el-form-item label="收货人电话:">
              <span>{{ orderData.mobile }}</span>
            </el-form-item>
            <el-form-item label="收货省市:">
              <span>{{ `${province} ${city} ${country}` }}</span>
            </el-form-item>
            <el-form-item label="详细地址:">
              <span>{{ orderData.address }}</span>
            </el-form-item>
            <el-form-item label="收货邮编:">
              <span>{{ orderData.zip }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin: 10px">
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span class="card-header-text">商品信息</span>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item>
              <el-image :src="orderData.image" fit="contain" style="height: 200px" lazy />
            </el-form-item>
            <el-form-item label="商品SKU:">
              <span>{{ orderData.skuId }}</span>
            </el-form-item>
            <el-form-item label="商品名称:">
              <span>{{ orderData.name }}</span>
            </el-form-item>
            <el-form-item label="商品单价:">
              <span>{{ orderData.unitPrice }}</span>
            </el-form-item>
            <el-form-item label="购买数量:">
              <span>{{ orderData.num }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <div slot="header">
            <span class="card-header-text">支付信息</span>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="支付状态">
              <span>{{ orderData.payStatus | payFilter }}</span>
            </el-form-item>
            <el-form-item label="支付编号:">
              <span>{{ orderData.paymentNo }}</span>
            </el-form-item>
            <el-form-item label="支付时间:">
              <span>{{ orderData.paymentAt | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="支付金额:">
              <span>{{ orderData.amount }}</span>
            </el-form-item>
            <el-form-item label="运费:">
              <span>{{ orderData.servFee }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    <el-button type="primary" @click="goBack">返回</el-button>
  </div>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import {
  getOrderListApi,
  getAddressApi
} from '@/api/orders'
import {
  getWorkOrderByIdApi,
  getWorkOrderTypesApi
} from '@/api/workOrders'
import { orderStatus, paymentStatus } from '@/utils/constants'
import { WorkOrderStatus } from './constants'

export default {
  name: 'WorkOrderDetail',
  filters: {
    workOrderStatus: status => {
      const find = WorkOrderStatus.find(option => option.value === status)
      return find ? find.label : status
    },
    orderStatus: status => {
      const find = orderStatus.find(option => option.value === status)
      return find ? find.label : status
    },
    timeFilter(date) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    },
    invoiceFilter(state) {
      return state === '1' ? '需要' : '不需要'
    },
    payFilter: status => {
      const find = paymentStatus.find(option => option.value === status)
      return find ? find.label : status
    }
  },
  data() {
    return {
      dataLoading: false,
      province: '',
      city: '',
      country: '',
      typeOptions: [],
      orderData: {},
      workOrderData: {}
    }
  },
  created() {
    this.getWorkOrderData()
  },
  methods: {
    async getWorkOrderData() {
      try {
        this.dataLoading = true
        const id = this.$route.params.id
        await this.getTypeOptions()
        this.workOrderData = await getWorkOrderByIdApi({ id })
        const find = this.typeOptions.find(option => option.value === this.workOrderData.typeId)
        this.$set(this.workOrderData, 'typeName', find ? find.label : '')
        await this.getOrderData(this.workOrderData.orderId)
      } catch (e) {
        console.warn('Work order get error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getTypeOptions() {
      try {
        const data = await getWorkOrderTypesApi({ pageIndex: 1, pageSize: 100 })
        this.typeOptions = data.rows.map(row => {
          return {
            value: row.id,
            label: row.name
          }
        })
      } catch (e) {
        console.log('Get work order type error: ' + e)
      }
    },
    async getOrderData(subOrderId) {
      try {
        const { data } = await getOrderListApi({ pageIndex: 1, pageSize: 1, subOrderId })
        if (data.result.list.length > 0) {
          this.orderData = data.result.list[0]
          await this.getAddressData(this.orderData.provinceId)
        }
      } catch (e) {
        console.warn('Work order get order detail error:' + e)
      }
    },
    async getAddressData(id) {
      if (!isEmpty(id)) {
        try {
          const { data } = await getAddressApi({ level: '1' })
          const found = data.list.find(item => item.id === id)
          this.province = found ? found.name : ''
          await this.getCityData(this.orderData.cityId)
        } catch (e) {
          console.warn('Get order province error:' + e)
        }
      }
    },
    async getCityData(id) {
      if (!isEmpty(id)) {
        try {
          const { data } = await getAddressApi({ level: '2', pid: this.orderData.provinceId })
          const found = data.list.find(item => item.id === id)
          this.city = found ? found.name : ''
          await this.getCountryData(this.orderData.countyId)
        } catch (e) {
          console.warn('Get order province error:' + e)
        }
      }
    },
    async getCountryData(id) {
      if (!isEmpty(id)) {
        try {
          const { data } = await getAddressApi({ level: '3', pid: this.orderData.cityId })
          const found = data.list.find(item => item.id === id)
          this.country = found ? found.name : ''
        } catch (e) {
          console.warn('Get order province error:' + e)
        }
      }
    },
    goBack() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.push('/workOrders')
    }
  }
}
</script>

<style scoped>
  .card-header-text {
    font-size: 16px;
    font-weight: bold;
  }
</style>

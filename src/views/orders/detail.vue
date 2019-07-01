<template>
  <div v-loading="dataLoading" class="app-container">
    <el-row :gutter="20" style="margin: 10px">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <h3>订单信息</h3>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="订单状态:">
              <span>{{ orderData.status | statusFilter }}</span>
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
            <el-form-item label="支付编号:">
              <span>{{ orderData.paymentNo }}</span>
            </el-form-item>
            <el-form-item label="支付时间:">
              <span>{{ orderData.paymentAt | timeFilter }}</span>
            </el-form-item>
            <el-form-item label="金额:">
              <span>{{ orderData.amount }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <h3>收获人信息</h3>
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
            <el-form-item label="收获省市:">
              <span>{{ `${province} ${city} ${country}` }}</span>
            </el-form-item>
            <el-form-item label="详细地址:">
              <span>{{ orderData.address }}</span>
            </el-form-item>
            <el-form-item label="收获邮编:">
              <span>{{ orderData.zip }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin: 10px">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <h3>发票信息</h3>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="是否开票:">
              <span>{{ orderData.invoiceState | invoiceFilter }}</span>
            </el-form-item>
            <el-form-item label="发票抬头:">
              <span>{{ orderData.invoiceTitle }}</span>
            </el-form-item>
            <el-form-item label="发票内容:">
              <span>{{ orderData.invoiceContent }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <h3>物流信息</h3>
          </div>
          <el-form label-position="right" label-width="120">
            <el-form-item label="物流单号:">
              <span>{{ orderData.logisticsId }}</span>
            </el-form-item>
            <el-form-item label="物流内容:">
              <span>{{ orderData.logisticsContent }}</span>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin: 10px">
      <el-col :span="12">
        <el-card>
          <div slot="header">
            <h3>订单商品</h3>
            <el-image :src="orderData.image" fit="contain" style="height: 200px" lazy />
          </div>
          <el-form label-position="right" label-width="120">
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
import { orderStatus } from './constants'

export default {
  name: 'OrderDetail',
  filters: {
    statusFilter: status => {
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
    }
  },
  data() {
    return {
      dataLoading: false,
      province: '',
      city: '',
      country: '',
      orderData: {}
    }
  },
  created() {
    this.getOrderData()
  },
  methods: {
    async getOrderData() {
      const subOrderId = this.$route.params.subId
      try {
        this.dataLoading = true
        const { data } = await getOrderListApi({ pageIndex: 1, pageSize: 1, subOrderId })
        if (data.result.list.length > 0) {
          this.orderData = data.result.list[0]
          await this.getAddressData(this.orderData.provinceId)
        }
      } catch (e) {
        console.warn('Get order detail error:' + e)
      } finally {
        this.dataLoading = false
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
        : this.$router.push('/orders')
    }
  }
}
</script>

<style scoped>

</style>

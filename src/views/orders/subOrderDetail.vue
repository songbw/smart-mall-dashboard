<template>
  <div v-loading="dataLoading" class="app-container">
    <order-info
      :status="orderData.status"
      :trade-no="orderData.tradeNo"
      :sub-order-id="orderData.subOrderId"
      :created-at="orderData.createdAt"
      :updated-at="orderData.updatedAt"
    />
    <receiver-info
      :receiver-name="orderData.receiverName"
      :mobile="orderData.mobile"
      :province-name="orderData.provinceName"
      :city-name="orderData.cityName"
      :county-name="orderData.countyName"
      :address="orderData.address"
      :zip="orderData.zip"
    />
    <payment-info
      :pay-status="orderData.payStatus"
      :payment-no="orderData.paymentNo"
      :payment-at="orderData.paymentAt"
      :payment-total-fee="orderData.paymentTotalFee"
      :payment-amount="orderData.paymentAmount"
      :pay-type="orderData.payType"
      :refund-fee="orderData.refundFee"
      :coupon-id="orderData.couponId"
      :coupon-code="orderData.couponCode"
      :coupon-discount="orderData.couponDiscount"
    />
    <goods-info
      :sku-list="[orderData]"
    />
    <el-button type="primary" @click="goBack">返回</el-button>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import {
  getOrderListApi,
  getAddressApi
} from '@/api/orders'
import OrderInfo from './components/orderInfo'
import ReceiverInfo from './components/receiverInfo'
import PaymentInfo from './components/paymentInfo'
import GoodsInfo from './components/goodsInfo'

export default {
  name: 'OrderDetail',
  components: {
    OrderInfo,
    ReceiverInfo,
    PaymentInfo,
    GoodsInfo
  },
  data() {
    return {
      dataLoading: false,
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
      if (!isEmpty(id) && isEmpty(this.orderData.provinceName)) {
        try {
          const { data } = await getAddressApi({ level: '1' })
          const found = data.list.find(item => item.id === id)
          this.orderData.provinceName = found ? found.name : ''
        } catch (e) {
          console.warn('Get order province error:' + e)
        }
      }
      await this.getCityData(this.orderData.cityId)
    },
    async getCityData(id) {
      if (!isEmpty(id) && isEmpty(this.orderData.cityName)) {
        try {
          const { data } = await getAddressApi({ level: '2', pid: this.orderData.provinceId })
          const found = data.list.find(item => item.id === id)
          this.orderData.cityName = found ? found.name : ''
        } catch (e) {
          console.warn('Get order city error:' + e)
        }
      }
      await this.getCountryData(this.orderData.countyId)
    },
    async getCountryData(id) {
      if (!isEmpty(id) && isEmpty(this.orderData.countyName)) {
        try {
          const { data } = await getAddressApi({ level: '3', pid: this.orderData.cityId })
          const found = data.list.find(item => item.id === id)
          this.orderData.countyName = found ? found.name : ''
        } catch (e) {
          console.warn('Get order county error:' + e)
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

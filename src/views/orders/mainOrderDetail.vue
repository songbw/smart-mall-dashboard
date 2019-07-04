<template>
  <div v-loading="dataLoading" class="app-container">
    <order-info
      :status="orderData.status"
      :trade-no="orderData.tradeNo"
      :created-at="orderData.createdAt"
      :updated-at="orderData.updatedAt"
      :remark="orderData.remark"
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
      :sku-list="skuList"
    />
    <el-button type="primary" @click="goBack">返回</el-button>
  </div>
</template>

<script>
import {
  getMainOrderDetailApi
} from '@/api/orders'
import OrderInfo from './components/orderInfo'
import ReceiverInfo from './components/receiverInfo'
import PaymentInfo from './components/paymentInfo'
import GoodsInfo from './components/goodsInfo'

export default {
  name: 'MainOrderDetail',
  components: {
    OrderInfo,
    ReceiverInfo,
    PaymentInfo,
    GoodsInfo
  },
  data() {
    return {
      dataLoading: false,
      orderData: {},
      skuList: []
    }
  },
  created() {
    this.getOrderData()
  },
  methods: {
    async getOrderData() {
      const orderId = this.$route.params.mainId
      try {
        this.dataLoading = true
        const { data } = await getMainOrderDetailApi({ orderId, pageIndex: 1, pageSize: 100 })
        this.orderData = data.result
        this.skuList = this.orderData.skusPage.list
      } catch (e) {
        console.warn('Get main order detail error:' + e)
      } finally {
        this.dataLoading = false
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

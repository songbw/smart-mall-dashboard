<template>
  <div v-loading="dataLoading" class="app-container">
    <order-info
      :status="orderData.status"
      :trade-no="orderData.tradeNo"
      :merchant-name="merchantName"
      :created-at="orderData.createdAt"
      :updated-at="orderData.updatedAt"
      :remark="orderData.remark"
    />
    <receiver-info
      :receiver-name="orderData.receiverName"
      :mobile="orderData.mobile"
      :province-id="orderData.provinceId"
      :province-name="orderData.provinceName"
      :city-id="orderData.cityId"
      :city-name="orderData.cityName"
      :county-id="orderData.countyId"
      :county-name="orderData.countyName"
      :address="orderData.address"
      :zip="orderData.zip"
    />
    <payment-info
      :pay-status="orderData.payStatus"
      :payment-no="orderData.paymentNo"
      :out-trade-no="orderData.outTradeNo"
      :payment-at="orderData.paymentAt"
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
import {
  getOrderListApi
} from '@/api/orders'
import {
  getVendorProfileApi
} from '@/api/vendor'

import OrderInfo from '@/components/Order/orderInfo'
import ReceiverInfo from '@/components/Order/receiverInfo'
import PaymentInfo from '@/components/Order/paymentInfo'
import GoodsInfo from '@/components/Order/goodsInfo'

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
      merchantName: '',
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
          this.getMerchantName(this.orderData.merchantId)
        }
      } catch (e) {
        console.warn('Get order detail error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getMerchantName(id) {
      try {
        const { data } = await getVendorProfileApi({ id })
        if (data && data.company) {
          this.merchantName = data.company.name
        }
      } catch (e) {
        console.warn('Sub order detail vendor profile error:' + e)
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

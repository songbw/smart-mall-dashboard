<template>
  <div>
    <div>
      <span>收货人：{{ returnAddress.receiverName }} </span>
      <span>联系电话：{{ returnAddress.receiverPhone }}</span>
    </div>
    <div>
      <span>地址：</span>
      <span>{{ returnAddress.provinceName }} </span>
      <span>{{ returnAddress.cityName }} </span>
      <span>{{ returnAddress.countyName }} </span>
      <span>{{ returnAddress.address }}</span>
    </div>
    <div>邮政编码：{{ returnAddress.zipCode }}</div>
  </div>
</template>

<script>
export default {
  name: 'AddressInfo',
  props: {
    returnAddress: {
      type: Object,
      default: function() {
        return {}
      }
    }
  }
}
</script>

<style scoped>

</style>

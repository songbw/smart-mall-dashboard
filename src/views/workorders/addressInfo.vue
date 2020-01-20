<template>
  <div>
    <div>
      <span>收货人：{{ address.receiverName }} </span>
      <span>联系电话：{{ address.receiverPhone }}</span>
    </div>
    <div>
      <span>地址：</span>
      <span>{{ address.provinceName }} </span>
      <span>{{ address.cityName }} </span>
      <span>{{ address.countyName }} </span>
      <span>{{ address.address }}</span>
    </div>
    <div>邮政编码：{{ address.zipCode }}</div>
  </div>
</template>

<script>
export default {
  name: 'AddressInfo',
  props: {
    address: {
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

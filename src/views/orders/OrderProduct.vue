<template>
  <div class="prod-info">
    <div style="text-align: start">
      <el-link :href="'/goods/viewProduct/' + mpu" type="primary" target="_blank">
        {{ skuId }}
      </el-link>
    </div>
    <div style="text-align:start">
      <span>名称：{{ name }}</span>
    </div>
    <div style="text-align: start">
      <span>价格：{{ `￥ ${price}` }}</span>
    </div>
    <div style="text-align: start">
      <span>数量：{{ count }}</span>
    </div>
    <div style="text-align: start">
      <span>供应商：{{ merchantName }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderProduct',
  props: {
    imageUrl: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: ''
    },
    mpu: {
      type: String,
      default: ''
    },
    skuId: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    },
    merchantName: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
  .prod-info {
    display: flex;
    flex-direction: column;
  }
</style>

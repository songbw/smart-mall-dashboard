<template>
  <div v-loading="dataLoading" class="app-container">
    <el-steps v-if="viewOnly === false" :active="activeStep" finish-status="success" align-center>
      <el-step title="活动基本信息" />
      <el-step title="活动优惠信息" />
    </el-steps>
    <div>
      <custom-promotion
        v-if="activeStep === 0"
        class="creation-container"
        @cancelCreation="handlePrevStep"
        @onPromotionCreated="handlePromotionCreated"
      />
      <select-goods
        v-else-if="activeStep === 1"
        :view-only="viewOnly"
        class="goods-container"
        @prevStep="handlePrevStep"
        @onUpdateSuccess="handlePromotionUpdated"
      />
    </div>
  </div>
</template>

<script>
import CustomPromotion from './custom'
import SelectGoods from './selectGoods'

export default {
  name: 'PromotionCreate',
  components: { CustomPromotion, SelectGoods },
  data() {
    return {
      dataLoading: false,
      activeStep: 0,
      viewOnly: false
    }
  },
  created() {
    this.getPromotionData()
  },
  methods: {
    getPromotionData() {
      const id = Number.parseInt(this.$route.params.id)
      if (this.$route.name === 'ViewPromotion') {
        this.viewOnly = true
        this.activeStep = 1
      }

      if (Number.isSafeInteger(id) && id !== -1) {
        this.dataLoading = true
        this.$store.dispatch('promotions/findById', { id: id }).then(() => {
          this.dataLoading = false
        }).catch(err => {
          console.warn('getPromotionData:' + err)
          this.$message.warning('获取促销活动失败，请稍后重试！')
          this.dataLoading = false
        })
      } else {
        this.$store.commit('promotions/RESET_DATA')
      }
    },
    handlePrevStep() {
      if (this.activeStep > 0) {
        this.activeStep -= 1
      } else {
        window.history.length > 1
          ? this.$router.go(-1)
          : this.$router.replace({ name: 'Promotions' })
      }
    },
    handlePromotionCreated() {
      this.activeStep += 1
    },
    handlePromotionUpdated() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.replace({ name: 'Promotions' })
    }
  }
}
</script>

<style scoped>
  .creation-container {
    margin: 40px auto 0 auto;
    width: 40%;
  }

  .goods-container {
    margin: 40px auto 0 auto;
  }
</style>

<template>
  <div v-loading="dataLoading" class="app-container">
    <el-steps v-if="viewOnly === false" :active="activeStep" finish-status="success" align-center>
      <el-step title="活动基本信息" />
      <el-step title="活动优惠信息" />
    </el-steps>
    <div>
      <custom-promotion v-if="activeStep === 0" class="creation-container"
                        @cancelCreation="handlePrevStep"
                        @onPromotionCreated="handlePromotionCreated" />
      <select-goods v-else-if="activeStep === 1" :view-only="viewOnly"
                    class="goods-container"
                    @prevStep="handlePrevStep"
                    @onUpdateSuccess="handlePromotionUpdated" />
    </div>
  </div>
</template>

<script>
  import CustomPromotion from './customPromotion'
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
        if (this.$route.params.hasOwnProperty('viewOnly')) {
          this.viewOnly = this.$route.params.viewOnly
          if (this.viewOnly) {
            this.activeStep = 1
          }
        }
        if (id !== -1) {
          this.dataLoading = true
          this.$store.dispatch('findPromotionById', { id: id }).then(() => {
            this.$store.commit('setCurrentPromotion', id)
            this.dataLoading = false
          }).catch(err => {
            console.error('getPromotionData:' + err)
            this.dataLoading = false
          })
        }
      },
      handlePrevStep() {
        if (this.activeStep > 0) {
          this.activeStep -= 1
        } else {
          this.$router.replace({ name: 'promotionIndex' })
        }
      },
      handlePromotionCreated() {
        this.activeStep += 1
      },
      handlePromotionUpdated() {
        this.$router.replace({ name: 'promotionIndex' })
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

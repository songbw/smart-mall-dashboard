<template>
  <div v-loading="dataLoading" class="app-container">
    <el-steps v-if="viewOnly === false" :active="activeStep" finish-status="success" align-center>
      <el-step title="活动基本信息" />
      <el-step title="活动优惠信息" />
    </el-steps>
    <div v-if="promotionReady">
      <custom-promotion
        v-if="activeStep === 0"
        :promotion-data="promotionData"
        class="creation-container"
        @cancelCreation="handlePrevStep"
        @onPromotionCreated="handlePromotionCreated"
      />
      <select-goods
        v-else-if="activeStep === 1"
        :promotion-data="promotionData"
        :conflicted-skus="skuList"
        :view-only="viewOnly"
        class="goods-container"
        @prevStep="handlePrevStep"
        @onUpdateSuccess="handlePromotionUpdated"
        @clearConflictedSkus="handleResetConflicted"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import CustomPromotion from './custom'
import SelectGoods from './selectGoods'
import { getProductsByMpuListApi } from '@/api/products'

export default {
  name: 'PromotionCreate',
  components: { CustomPromotion, SelectGoods },
  data() {
    return {
      dataLoading: false,
      promotionReady: false,
      activeStep: 0,
      viewOnly: false,
      skuList: []
    }
  },
  computed: {
    ...mapGetters({
      promotionData: 'currentPromotion',
      conflictedMpus: 'conflictedMpus'
    })
  },
  created() {
    this.$store.commit('promotions/RESET_DATA')
    if (this.$route.name === 'CreatePromotion') {
      this.promotionReady = true
    } else {
      this.getPromotionData()
    }
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
        this.$store.dispatch('promotions/findById', { id: id }).then((res) => {
          if (res.code === 200) {
            this.promotionReady = true
          } else {
            this.$message.warning(res.msg)
          }
        }).catch(err => {
          console.warn('getPromotionData:' + err)
          this.$message.warning('获取促销活动失败，请稍后重试！')
        }).finally(() => {
          this.dataLoading = false
        })
      }
    },
    handlePrevStep() {
      if (this.activeStep > 0) {
        this.activeStep -= 1
      } else {
        this.gotoPromotionList()
      }
    },
    async handlePromotionCreated() {
      if (this.conflictedMpus.length > 0) {
        try {
          this.dataLoading = true
          const total = this.conflictedMpus.length
          const num = 50
          let begin = 0
          let end = begin + num
          do {
            const params = {
              mpuIdList: this.conflictedMpus.slice(begin, end).join(',')
            }
            begin = end
            end = begin + num
            const response = await getProductsByMpuListApi(params)
            const data = response.data.result
            if (Array.isArray(data) && data.length > 0) {
              this.skuList = this.skuList.concat(data)
            }
          } while (begin < total)
        } catch (e) {
          console.warn('Promotion conflicted mpu error:' + e)
        } finally {
          this.dataLoading = false
        }
      }
      this.activeStep += 1
    },
    handleResetConflicted() {
      this.$store.commit('promotions/SET_CONFLICTED_MPUS', [])
      this.skuList = []
    },
    handlePromotionUpdated() {
      this.gotoPromotionList()
    },
    gotoPromotionList() {
      window.history.length > 1
        ? this.$router.go(-1)
        : this.$router.replace({ name: 'Promotions' })
    }
  }
}
</script>

<style scoped>
  .creation-container {
    width: 600px;
    margin: 40px auto 0 auto;
  }

  .goods-container {
    margin: 40px auto 0 auto;
  }
</style>

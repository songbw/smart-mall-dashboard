<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step :title="$t('aggregation_creation_step_1_title')" />
          <el-step :title="$t('aggregation_creation_step_2_title')" />
          <el-step :title="$t('aggregation_creation_step_3_title')" />
        </el-steps>
      </el-header>
      <el-main v-loading="gettingInfo">
        <create-page v-if="activeStep === 0" class="creation-container"
                     @cancelCreation="handlePrevStep"
                     @createPage="handleCreatePage" />
        <custom-page v-else-if="activeStep === 1"
                     @prevStep="handlePrevStep"
                     @nextStep="handlePreviewPage" />
        <preview-page v-else-if="activeStep === 2"
                      :page-id="pageId"
                      @prevStep="handlePrevStep"
                      @onSaved="gotoPageList" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
  import CreatePage from './components/createPage'
  import CustomPage from './components/customPage'
  import PreviewPage from './components/previewPage'

  export default {
    components: { CreatePage, CustomPage, PreviewPage },
    data() {
      return {
        pageId: -1,
        gettingInfo: false,
        activeStep: 0
      }
    },
    created() {
      this.getPageInfo()
    },
    methods: {
      getPageInfo() {
        try {
          const id = Number.parseInt(this.$route.params.id)
          if (id !== null && id !== -1 && Number.isNaN(id) === false) {
            this.gettingInfo = true
            this.$store.dispatch('getAggregationPageById', { id: id }).then((response) => {
              this.pageId = id
              this.gettingInfo = false
            }).catch(() => {
              this.gettingInfo = false
            })
          }
        } catch (e) {
          console.log('getPageInfo' + e)
        }
      },
      handleCreatePage(id) {
        this.pageId = id
        this.activeStep = 1
      },
      handlePrevStep() {
        if (this.activeStep > 0) {
          this.activeStep -= 1
        } else {
          this.$router.replace({ name: 'pageIndex' })
        }
      },
      handlePreviewPage(pageInfo) {
        this.activeStep = 2
      },
      gotoPageList() {
        this.$router.replace({ name: 'pageIndex' })
      }
    }
  }
</script>

<style scoped>
  .creation-container {
    margin-left: auto;
    margin-right: auto;
    width: 50%;
  }
</style>


<template>
  <div class="app-container">
    <el-container v-loading="gettingInfo">
      <el-header>
        <el-steps :active="activeStep" finish-status="success" align-center>
          <el-step title="基本信息" />
          <el-step title="模块配置" />
          <el-step title="预览页面" />
        </el-steps>
      </el-header>
      <el-main>
        <create-page
          v-if="activeStep === 0"
          class="creation-container"
          @cancelCreation="handlePrevStep"
          @createPage="handleCreatePage"
        />
        <custom-page
          v-else-if="activeStep === 1"
          @prevStep="handlePrevStep"
          @nextStep="handlePreviewPage"
        />
        <preview-page
          v-else-if="activeStep === 2"
          :page-id="pageId"
          @prevStep="handlePrevStep"
          @onSaved="gotoPageList"
        />
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
    if (this.$route.name !== 'CreateAggregation') {
      this.getPageInfo()
    }
  },
  methods: {
    async getPageInfo() {
      try {
        const id = Number.parseInt(this.$route.params.id)
        if (!Number.isNaN(id) && id !== -1) {
          this.gettingInfo = true
          await this.$store.dispatch('aggregations/getPageById', { id: id })
          this.pageId = id
        }
      } catch (e) {
        console.log('getPageInfo' + e)
      }
      this.gettingInfo = false
    },
    handleCreatePage(id) {
      this.pageId = id
      this.activeStep = 1
    },
    handlePrevStep() {
      if (this.activeStep > 0) {
        this.activeStep -= 1
      } else {
        this.$router.replace({ name: 'Aggregations' })
      }
    },
    handlePreviewPage() {
      this.activeStep = 2
    },
    gotoPageList() {
      this.$router.replace({ name: 'Aggregations' })
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


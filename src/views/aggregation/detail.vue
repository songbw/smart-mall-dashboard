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
          :page-id="pageId"
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
    this.$store.commit('aggregations/RESET_CURRENT_DATA')
    if (this.$route.name !== 'CreateAggregation') {
      this.getPageInfo()
    }
  },
  methods: {
    async getPageInfo() {
      let suc = false
      try {
        const id = Number.parseInt(this.$route.params.id)
        if (!Number.isNaN(id) && id !== -1) {
          this.gettingInfo = true
          const pageId = await this.$store.dispatch('aggregations/getPageById', { id: id })
          if (pageId >= 0) {
            this.pageId = id
            suc = true
          }
        }
      } catch (e) {
        console.log('getPageInfo' + e)
      }
      this.gettingInfo = false
      if (!suc) {
        this.$message.warning('获取聚合页内容失败，请联系管理员！')
        this.gotoPageList()
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
        this.gotoPageList()
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

</style>


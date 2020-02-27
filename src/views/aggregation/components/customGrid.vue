<template>
  <div style="width: 100%">
    <el-container class="show-border">
      <el-form label-width="120px">
        <el-form-item label="开启头部">
          <el-switch v-model="showTitle" />
          <el-form v-if="showTitle" label-position="right" label-width="120px">
            <el-form-item label="文字位置">
              <el-radio-group v-model="titleTextAlign">
                <el-radio label="left">居左</el-radio>
                <el-radio label="center">居中</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="标题" required>
              <el-input v-model="titleTextValue" />
            </el-form-item>
            <el-form-item
              v-if="titleTextAlign === 'left'"
              label="开启文字链接"
            >
              <el-switch v-model="titleHasLink" />
            </el-form-item>
            <el-form-item
              v-if="titleTextAlign === 'left' && titleHasLink"
              label="标题"
            >
              <el-input v-model="titleLinkTitle" />
            </el-form-item>
            <el-form-item
              v-if="titleTextAlign === 'left' && titleHasLink"
              label="链接"
            >
              <image-target-link
                :target-index="currentTemplateIndex"
                :target-type="titleLinkType"
                :target-url="titleLinkUrl"
                :target-name="titleLinkUrlName"
                :app-id="pageAppId"
                @targetChanges="handleImageTargetChanges"
              />
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item label="下边距">
          <el-select v-model="marginBottom">
            <el-option label="0px" value="0" />
            <el-option label="10px" value="10" />
            <el-option label="20px" value="20" />
            <el-option label="30px" value="30" />
            <el-option label="40px" value="40" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-container>
    <el-container class="show-border" style="margin-top: 20px">
      <el-main>
        <grid-item
          v-for="(grid, index) in gridList"
          :key="index"
          :grid-info="grid"
          :grid-index="index"
          :app-id="pageAppId"
          @gridCountChanged="changeGridListCount"
          @gridImageChanged="changeGridListImage"
          @onRemove="removeGridList"
        />
      </el-main>
      <el-footer style="text-align: right;">
        <el-button :disabled="gridList.length >= 10" type="primary" @click="addGridList">
          添加宫格行
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GridItem from './gridItem'
import ImageTargetLink from './imageTargetLink'
import { gridType, gridSettings } from './templateType'

export default {
  name: 'CustomGrid',
  components: { GridItem, ImageTargetLink },
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      pageInfo: 'currentAggregation',
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    pageAppId() {
      return this.pageInfo.appId
    },
    gridInfo: function () {
      if (this.pageTemplateList[this.currentTemplateIndex].type === gridType) {
        return this.pageTemplateList[this.currentTemplateIndex].data
      } else {
        return {
          list: [],
          settings: { ...gridSettings }
        }
      }
    },
    gridList: {
      get() {
        return this.gridInfo.list
      }
    },
    titleForm: {
      get() {
        return {
          title: this.gridInfo.settings.title
        }
      }
    },
    showTitle: {
      get() {
        return this.gridInfo.settings.title.show
      },
      set(newValue) {
        const title = Object.assign({}, this.gridInfo.settings.title, { show: newValue })
        const settings = Object.assign({}, this.gridInfo.settings, { title: title })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    titleTextAlign: {
      get() {
        return this.gridInfo.settings.title.text.align
      },
      set(newValue) {
        const text = Object.assign({}, this.gridInfo.settings.title.text, { align: newValue })
        this.changeTitleText(text)
      }
    },
    titleTextValue: {
      get() {
        return this.gridInfo.settings.title.text.value
      },
      set(newValue) {
        const text = Object.assign({}, this.gridInfo.settings.title.text, { value: newValue })
        this.changeTitleText(text)
      }
    },
    titleHasLink: {
      get() {
        return this.gridInfo.settings.title.text.hasLink
      },
      set(newValue) {
        const text = Object.assign({}, this.gridInfo.settings.title.text, { hasLink: newValue })
        this.changeTitleText(text)
      }
    },
    titleLinkTitle: {
      get() {
        return this.gridInfo.settings.title.text.linkTitle
      },
      set(newValue) {
        const text = Object.assign({}, this.gridInfo.settings.title.text, { linkTitle: newValue })
        this.changeTitleText(text)
      }
    },
    titleLinkType: {
      get() {
        return this.gridInfo.settings.title.text.linkType
      },
      set(newValue) {
        const text = Object.assign({}, this.gridInfo.settings.title.text, { linkType: newValue })
        this.changeTitleText(text)
      }
    },
    titleLinkUrl: {
      get() {
        return this.gridInfo.settings.title.text.linkUrl
      },
      set(newValue) {
        const text = Object.assign({}, this.gridInfo.settings.title.text, { linkUrl: newValue })
        this.changeTitleText(text)
      }
    },
    titleLinkUrlName: {
      get() {
        return this.gridInfo.settings.title.text.linkUrlName
      },
      set(newValue) {
        const text = Object.assign({}, this.gridInfo.settings.title.text, { linkUrlName: newValue })
        this.changeTitleText(text)
      }
    },
    marginBottom: {
      get() {
        return this.gridInfo.settings.marginBottom
      },
      set(newValue) {
        const settings = Object.assign({}, this.gridInfo.settings, { marginBottom: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    }
  },
  methods: {
    changeTitleText(text) {
      const title = Object.assign({}, this.gridInfo.settings.title, { text: text })
      const settings = Object.assign({}, this.gridInfo.settings, { title: title })
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
    },
    async removeGridList(index) {
      try {
        await this.$confirm('是否要删除此宫格行？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
      } catch (e) {
        console.warn('Aggregation delete grid error:' + e)
      }
    },
    addGridList() {
      const grid = {
        count: 1,
        targetType: 'aggregation',
        grids: [{ imageUrl: null, targetType: 'blank', targetUrl: 'about:blank', targetName: '无链接' }]
      }
      this.$store.commit('aggregations/SET_GRID_LIST', { index: -1, value: grid })
    },
    changeGridListCount(index, value) {
      const newGrid = { targetType: 'aggregation' }
      newGrid.count = value
      newGrid.grids = []
      const delta = value - this.gridList[index].grids.length
      if (delta > 0) {
        this.gridList[index].grids.forEach(item => newGrid.grids.push(item))
        for (let i = 0; i < delta; i++) {
          newGrid.grids.push({ imageUrl: null, targetType: 'blank', targetUrl: 'about:blank', targetName: '无链接' })
        }
      } else if (delta < 0) {
        for (let i = 0; i < value; i++) {
          newGrid.grids.push(this.gridList[index].grids[i])
        }
      }
      this.$store.commit('aggregations/SET_GRID_LIST', { index: index, value: newGrid })
    },
    changeGridListImage(index, params) {
      const contentIndex = params.index
      const newItem = {
        imageUrl: params.value.imageUrl,
        targetType: params.value.targetType,
        targetUrl: params.value.targetUrl,
        targetName: params.value.targetName
      }
      const newGrid = { targetType: 'aggregation' }
      newGrid.count = this.gridList[index].count
      newGrid.grids = []
      this.gridList[index].grids.forEach(item => newGrid.grids.push(item))
      newGrid.grids.splice(contentIndex, 1)
      newGrid.grids.splice(contentIndex, 0, newItem)
      this.$store.commit('aggregations/SET_GRID_LIST', { index: index, value: newGrid })
    },
    handleSelectAggregationItem(item) {
      this.titleLinkUrlName = item.value
      this.titleLinkUrl = item.link
    },
    handleImageTargetChanges(target) {
      if ('type' in target) {
        this.titleLinkType = target.type
      }
      if ('name' in target) {
        this.titleLinkUrlName = target.name
      }
      if ('url' in target) {
        this.titleLinkUrl = target.url
      }
    }
  }
}
</script>

<style scoped>
  .show-border {
    border: 1px solid #eee;
  }

</style>

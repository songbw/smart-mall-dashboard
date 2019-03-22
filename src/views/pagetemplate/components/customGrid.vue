<template>
  <div style="width: 100%">
    <el-container class="show-border">
      <el-form label-width="120px">
        <el-form-item :label="$t('aggregation_customization_grid_header_title')">
          <el-switch v-model="showTitle" />
          <el-form v-if="showTitle" label-position="right" label-width="120px">
            <el-form-item :label="$t('aggregation_customization_grid_header_align')">
              <el-radio-group v-model="titleTextAlign">
                <el-radio label="center">{{ $t('aggregation_customization_grid_header_align_center') }}</el-radio>
                <el-radio label="left">{{ $t('aggregation_customization_grid_header_align_left') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('aggregation_customization_grid_header_value')" required>
              <el-input v-model="titleTextValue" />
            </el-form-item>
            <el-form-item v-if="titleTextAlign === 'left'"
                          :label="$t('aggregation_customization_grid_header_link')">
              <el-switch v-model="titleHasLink" />
            </el-form-item>
            <el-form-item v-if="titleTextAlign === 'left' && titleHasLink"
                          :label="$t('aggregation_customization_grid_header_value')">
              <el-input v-model="titleLinkTitle" />
            </el-form-item>
            <el-form-item v-if="titleTextAlign === 'left' && titleHasLink"
                          :label="$t('aggregation_customization_grid_header_link_url')">
              <image-target-link :target-index="currentTemplateIndex"
                                 :target-type="titleLinkType"
                                 :target-url="titleLinkUrl"
                                 :target-name="titleLinkUrlName"
                                 @targetChanges="handleImageTargetChanges" />
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item :label="$t('aggregation_customization_banner_margin_title')">
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
        <grid-item v-for="(grid, index) in gridList" :key="index" :grid-info="grid" :grid-index="index"
                   @gridCountChanged="changeGridListCount"
                   @gridImageChanged="changeGridListImage"
                   @onRemove="removeGridList" />
      </el-main>
      <el-footer style="text-align: right;">
        <el-button :disabled="gridList.length >= 10" type="primary" @click="addGridList">
          {{ $t('aggregation_customization_grid_add_btn_title') }}
        </el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import GridItem from './gridItem'
  import ImageTargetLink from './imageTargetLink'
  import { gridType } from '@/utils/templateType'

  export default {
    name: 'CustomGrid',
    components: { GridItem, ImageTargetLink },
    data() {
      return {}
    },
    computed: {
      ...mapGetters({
        pageTemplateList: 'currentAggregationContent',
        currentTemplateIndex: 'currentAggregationContentIndex'
      }),
      gridInfo: function () {
        if (this.pageTemplateList[this.currentTemplateIndex].type === gridType) {
          return this.pageTemplateList[this.currentTemplateIndex].data
        } else {
          return {
            list: [],
            settings:
              {
                title: {
                  show: false,
                  text: {
                    align: 'center',
                    value: '',
                    hasLink: false,
                    linkTitle: '',
                    linkType: 'aggregation',
                    linkUrl: '',
                    linkUrlName: ''
                  }
                },
                marginBottom: '0'
              }
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
          this.$store.commit('setTemplateGridSettings', settings)
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
          this.$store.commit('setTemplateGridSettings', settings)
        }
      }
    },
    methods: {
      changeTitleText(text) {
        const title = Object.assign({}, this.gridInfo.settings.title, { text: text })
        const settings = Object.assign({}, this.gridInfo.settings, { title: title })
        this.$store.commit('setTemplateGridSettings', settings)
      },
      removeGridList(index) {
        this.$store.commit('removeTemplateGridListContent', { index: index })
      },
      addGridList() {
        const grid = {
          count: 1,
          targetType: 'aggregation',
          grids: [{ imageUrl: null, targetType: 'blank', targetUrl: 'about:blank', targetName: '无链接' }]
        }
        this.$store.commit('changeTemplateGridListContent', { index: -1, value: grid })
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
        this.$store.commit('changeTemplateGridListContent', { index: index, value: newGrid })
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
        this.$store.commit('changeTemplateGridListContent', { index: index, value: newGrid })
      },
      queryAggregationSearch(queryString, cb) {
        // show all aggregation list with empty query string
        if (queryString && queryString.length > 0) {
          cb([])
        } else {
          this.$store.dispatch('searchAggregationPages', { offset: 1, limit: 100 }).then(res => {
            if (Array.isArray(res)) {
              const results = []
              res.forEach(item => {
                results.push({ value: item.name, link: 'aggregation://' + item.id })
              })
              cb(results)
            }
          }).catch(() => {
            cb([])
          })
        }
      },
      handleSelectAggregationItem(item) {
        this.titleLinkUrlName = item.value
        this.titleLinkUrl = item.link
      },
      handleImageTargetChanges(target) {
        if (target.hasOwnProperty('type')) {
          this.titleLinkType = target.type
        }
        if (target.hasOwnProperty('name')) {
          this.titleLinkUrlName = target.name
        }
        if (target.hasOwnProperty('url')) {
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

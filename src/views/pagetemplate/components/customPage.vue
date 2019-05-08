<template>
  <el-container>
    <el-header>
      <el-select v-model="optionSelected" :placeholder="$t('aggregation_customization_select_placeholder')">
        <el-option
          v-for="item in options"
          :key="item.name"
          :label="item.name"
          :value="item.type">
          <el-popover :title="item.name" placement="right" trigger="hover">
            <el-card :body-style="{ padding: '0px' }">
              <el-image :src="item.image" style="width: 128px;height: 128px" fit="contain" />
            </el-card>
            <div slot="reference">
              <span>{{ item.name }}</span>
            </div>
          </el-popover>
        </el-option>
      </el-select>
      <el-button type="primary" plain @click="handleAddTemplateType(optionSelected)">
        {{ $t('aggregation_customization_btn_add_title') }}
      </el-button>
    </el-header>
    <el-main class="show-border">
      <el-container>
        <el-aside class="show-border">
          <el-table ref="pageTemplateTable" :data="pageTemplateList" :show-header="false" highlight-current-row
                    style="width: 100%"
                    @current-change="handleTemplateCurrentChange">
            <el-table-column label="Type" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
                <img :src="templateImageUrl(scope.row.type)" class="aside-image">
              </template>
            </el-table-column>
            <el-table-column label="Operations">
              <template slot-scope="scope">
                <el-button :disabled="scope.$index === 0"
                           type="warning" icon="el-icon-caret-top" size="mini" circle
                           @click="handleSortUpTemplateType(scope.$index)" />
                <el-button :disabled="scope.$index === pageTemplateList.length - 1"
                           type="warning" icon="el-icon-caret-bottom" size="mini" circle
                           @click="handleSortDownTemplateType(scope.$index)" />
                <el-button type="primary" icon="el-icon-edit" size="mini" circle
                           @click="handleEditTemplateType(scope.$index)" />
                <el-button type="danger" icon="el-icon-delete" size="mini" circle
                           @click="handleDelTemplateType(scope.$index)" />
              </template>
            </el-table-column>
          </el-table>
        </el-aside>
        <el-container>
          <el-header class="show-border" height="40px">
            <el-button type="text" style="float: right;margin: auto">{{ currentTemplateTipTitle }}</el-button>
          </el-header>
          <el-main class="show-border">
            <div v-for="(pageTemplate, index) in pageTemplateList" :key="'page-template-' + index">
              <custom-banner
                v-if="currentTemplateIndex === index && pageTemplate.type === bannerType" />
              <custom-service
                v-if="currentTemplateIndex === index && pageTemplate.type === serviceType" />
              <custom-grid
                v-if="currentTemplateIndex === index && pageTemplate.type === gridType" />
              <custom-promotion
                v-if="currentTemplateIndex === index && pageTemplate.type === promotionType" />
              <custom-goods
                v-if="currentTemplateIndex === index && pageTemplate.type === goodsType" />
              <custom-hot-zone
                v-if="currentTemplateIndex === index && pageTemplate.type === hotZoneType" />
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-main>
    <el-footer align="center">
      <div class="footer-container">
        <el-button @click="$emit('prevStep')">{{ $t('confirm_button_prev_title') }}</el-button>
        <el-button type="primary" @click="previewPage">{{ $t('confirm_button_preview_save_title') }}</el-button>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import CustomBanner from './customBanner'
  import CustomService from './customService'
  import CustomGrid from './customGrid'
  import CustomPromotion from './customPromotion'
  import CustomGoods from './customGoods'
  import CustomHotZone from './customHotZone'
  import {
    bannerType,
    serviceType,
    gridType,
    promotionType,
    goodsType,
    hotZoneType
  } from '@/utils/templateType'

  const bannerImage = require('@/assets/images/banner.png')
  const serviceImage = require('@/assets/images/icon-grid.png')
  const goodsImage = require('@/assets/images/goods.png')
  const gridImage = require('@/assets/images/grid.png')
  const couponImage = require('@/assets/images/coupon.png')
  const hotZoneImage = require('@/assets/images/image.png')

  export default {
    name: 'CustomPage',
    components: {
      CustomBanner, CustomService, CustomGrid, CustomPromotion, CustomGoods, CustomHotZone
    },
    data() {
      return {
        optionSelected: null,
        bannerType: bannerType,
        serviceType: serviceType,
        gridType: gridType,
        promotionType: promotionType,
        goodsType: goodsType,
        hotZoneType: hotZoneType,
        options: [
          {
            type: bannerType,
            name: this.$t('aggregation_customization_banners_name'),
            tipTitle: this.$t('aggregation_customization_banners_name') +
              this.$t('aggregation_customization_tip_title'),
            image: bannerImage
          },
          {
            type: serviceType,
            name: this.$t('aggregation_customization_service_name'),
            tipTitle: this.$t('aggregation_customization_service_name') +
              this.$t('aggregation_customization_tip_title'),
            image: serviceImage
          },
          {
            type: gridType,
            name: this.$t('aggregation_customization_grid_name'),
            tipTitle: this.$t('aggregation_customization_grid_name') +
              this.$t('aggregation_customization_tip_title'),
            image: gridImage
          },
          {
            type: promotionType,
            name: this.$t('aggregation_customization_promotion_name'),
            tipTitle: this.$t('aggregation_customization_promotion_name') +
              this.$t('aggregation_customization_tip_title'),
            image: couponImage
          },
          {
            type: goodsType,
            name: this.$t('aggregation_customization_goods_name'),
            tipTitle: this.$t('aggregation_customization_goods_name') +
              this.$t('aggregation_customization_tip_title'),
            image: goodsImage
          },
          {
            type: hotZoneType,
            name: this.$t('aggregation_customization_hotzone_name'),
            tipTitle: this.$t('aggregation_customization_hotzone_name') +
              this.$t('aggregation_customization_tip_title'),
            image: hotZoneImage
          }
        ],
        currentTemplateTipTitle: ''
      }
    },
    computed: {
      ...mapGetters({
        pageTemplateList: 'currentAggregationContent',
        currentTemplateIndex: 'currentAggregationContentIndex'
      })
    },
    methods: {
      templateImageUrl(type) {
        const option = this.options.find(option => option.type === type)
        return option.image
      },
      previewPage() {
        this.$store.dispatch('saveAggregationPageContent').then(() => {
          this.$emit('nextStep', this.pageTemplateList)
        }).catch(error => {
          this.$message.warning(error)
        })
      },
      handleSortUpTemplateType(index) {
        const params = { up: true, index: index }
        this.$store.dispatch('sortAggregationTemplate', params).then((newIndex) => {
          this.setEditTemplateTypeIndex(newIndex)
        })
      },
      handleSortDownTemplateType(index) {
        this.$store.dispatch('sortAggregationTemplate', { up: false, index: index }).then((newIndex) => {
          this.setEditTemplateTypeIndex(newIndex)
        })
      },
      handleAddTemplateType(type) {
        const option = this.options.find(o => o.type === type)
        const item = Object.assign({}, { type: option.type, name: option.name })
        this.initTemplateTypeData(type, item)
        this.$store.dispatch('addAggregationTemplate', item).then((length) => {
          this.setEditTemplateTypeIndex(length - 1)
        })
      },
      handleEditTemplateType(index) {
        this.setEditTemplateTypeIndex(index)
      },
      handleDelTemplateType(index) {
        const length = this.pageTemplateList.length - 1
        if (index === this.currentTemplateIndex) {
          if (length > 0) {
            if (index > 0) {
              this.setEditTemplateTypeIndex(index - 1)
            } else {
              this.setEditTemplateTypeIndex(0)
            }
          } else {
            this.setEditTemplateTypeIndex(-1)
          }
        }
        this.$store.dispatch('deleteAggregationTemplate', index).then((len) => {
          this.$log.debug(`handleDelTemplateType:${index} len:${len}`)
        }).catch(e => {
          this.$log.warn('handleDelTemplateType:' + e)
        })
      },
      setEditTemplateTypeIndex(index) {
        if (index >= 0 && this.pageTemplateList.length > index) {
          const template = this.pageTemplateList[index]
          const option = this.options.find(item => item.type === template.type)
          this.currentTemplateTipTitle = option.tipTitle
          this.$refs.pageTemplateTable.setCurrentRow(template)
        } else {
          this.currentTemplateTipTitle = ''
        }
        this.$store.commit('setCurrentTemplateIndex', index)
      },
      initTemplateTypeData(type, template) {
        template.data = {}
        template.data.list = []
        template.data.settings = {}
        switch (type) {
          case bannerType:
            template.data.settings.marginBottom = '0'
            break
          case gridType:
            template.data.settings.title = {
              show: false,
              text: {
                align: 'center',
                value: '',
                hasLink: false,
                linkType: 'aggregation',
                linkTitle: '',
                linkUrl: ''
              }
            }
            template.data.settings.marginBottom = '0'
            break
          case goodsType:
            template.data.settings = {
              countPerLine: 2,
              floorTitleColor: '#000000',
              priceBackgroundColor: '#ECE8DE',
              priceTextColor: '#6E0F00',
              hasTabBar: false,
              tabBarBackgroundColor: '#333333',
              tabBarTextColor: '#FF9933',
              marginBottom: 0
            }
            break
          case serviceType:
            template.data.settings.marginBottom = '0'
            break
          case promotionType:
            template.data.settings = {
              title: {
                show: false,
                textAlign: 'left',
                textValue: '',
                hasPromotionActivity: false,
                promotionActivityId: -1,
                promotionActivityName: '',
                promotionActivityStartDate: '',
                promotionActivityEndDate: '',
                hasImage: false,
                imageUrl: '',
                targetUrl: '',
                targetName: ''
              },
              marginBottom: '0'
            }
            break
          case hotZoneType:
            template.data.settings = {
              imageUrl: ''
            }
            break
        }
      },
      handleTemplateCurrentChange(row) {
        const index = this.pageTemplateList.indexOf(row)
        this.setEditTemplateTypeIndex(index)
      }
    }
  }
</script>

<style scoped>
  .aside-image {
    width: 100%;
  }

  .image {
    width: 100%;
    display: block;
  }

  .show-border {
    border: 1px solid #eee;
  }

  .footer-container {
    display: flex;
    margin: 10px 0;
    flex-direction: row;
    justify-content: center;
  }
</style>

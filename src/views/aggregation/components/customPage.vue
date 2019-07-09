<template>
  <el-container>
    <el-header>
      <el-select v-model="optionSelected" placeholder="请选择对应模板">
        <el-option
          v-for="item in options"
          :key="item.name"
          :label="item.name"
          :value="item.type"
        >
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
        添加模块
      </el-button>
    </el-header>
    <el-main class="show-border">
      <el-container>
        <el-aside class="show-border">
          <el-table
            ref="pageTemplateTable"
            :data="pageTemplateList"
            :show-header="false"
            highlight-current-row
            style="width: 100%"
            @current-change="handleTemplateCurrentChange"
          >
            <el-table-column label="Type" width="100">
              <template slot-scope="scope">
                <span>{{ scope.row.name }}</span>
                <img :src="templateImageUrl(scope.row.type)" class="aside-image">
              </template>
            </el-table-column>
            <el-table-column label="Operations">
              <template slot-scope="scope">
                <el-button
                  :disabled="scope.$index === 0"
                  type="warning"
                  icon="el-icon-caret-top"
                  size="mini"
                  circle
                  @click="handleSortUpTemplateType(scope.$index)"
                />
                <el-button
                  :disabled="scope.$index === pageTemplateList.length - 1"
                  type="warning"
                  icon="el-icon-caret-bottom"
                  size="mini"
                  circle
                  @click="handleSortDownTemplateType(scope.$index)"
                />
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  circle
                  @click="handleEditTemplateType(scope.$index)"
                />
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  circle
                  @click="handleDelTemplateType(scope.$index)"
                />
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
                v-if="currentTemplateIndex === index && pageTemplate.type === bannerType"
              />
              <custom-service
                v-if="currentTemplateIndex === index && pageTemplate.type === serviceType"
              />
              <custom-grid
                v-if="currentTemplateIndex === index && pageTemplate.type === gridType"
              />
              <custom-promotion
                v-if="currentTemplateIndex === index && pageTemplate.type === promotionType"
              />
              <custom-goods
                v-if="currentTemplateIndex === index && pageTemplate.type === goodsType"
              />
              <custom-hot-zone
                v-if="currentTemplateIndex === index && pageTemplate.type === hotZoneType"
              />
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-main>
    <el-footer align="center">
      <div class="footer-container">
        <el-button @click="$emit('prevStep')">上一步</el-button>
        <el-button type="primary" @click="previewPage">保存并预览</el-button>
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
} from './templateType'

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
          name: '轮播',
          tipTitle: '轮播模块功能说明',
          image: bannerImage
        },
        {
          type: serviceType,
          name: '图标服务',
          tipTitle: '图标服务模块功能说明',
          image: serviceImage
        },
        {
          type: gridType,
          name: '宫格',
          tipTitle: '宫格服务模块功能说明',
          image: gridImage
        },
        {
          type: promotionType,
          name: '促销活动',
          tipTitle: '促销活动服务模块功能说明',
          image: couponImage
        },
        {
          type: goodsType,
          name: '商品',
          tipTitle: '商品服务模块功能说明',
          image: goodsImage
        },
        {
          type: hotZoneType,
          name: '图片热区',
          tipTitle: '服务模块功能说明',
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
      this.$store.dispatch('aggregations/savePageContent').then(() => {
        this.$emit('nextStep')
      }).catch(error => {
        this.$message.warning(error)
      })
    },
    handleSortUpTemplateType(index) {
      const params = { up: true, index: index }
      this.$store.commit('aggregations/SORT_CONTENT', params)
      this.setEditTemplateTypeIndex(index + 1)
    },
    handleSortDownTemplateType(index) {
      const params = { up: false, index: index }
      this.$store.commit('aggregations/SORT_CONTENT', params)
      this.setEditTemplateTypeIndex(index - 1)
    },
    handleAddTemplateType(type) {
      const option = this.options.find(o => o.type === type)
      const item = { type: option.type, name: option.name }
      this.initTemplateTypeData(type, item)
      this.$store.commit('aggregations/ADD_CONTENT', item)
      this.setEditTemplateTypeIndex(this.pageTemplateList.length - 1)
    },
    handleEditTemplateType(index) {
      this.setEditTemplateTypeIndex(index)
    },
    async handleDelTemplateType(index) {
      try {
        await this.$confirm('是否要删除此模块？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
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
        this.$store.commit('aggregations/DELETE_CONTENT', index)
      } catch (e) {
        console.warn('Aggregation delete template error: ' + e)
      }
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
      this.$store.commit('aggregations/SET_CONTENT_INDEX', index)
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
            imageUrl: '',
            imageKey: ''
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

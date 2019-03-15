<template>
  <div id="phone-container"
       :style="{background:backgroundColor}" class="phone" sticky-container>
    <div class="text-center">
      <h2>{{ pageName }}</h2>
    </div>
    <div style="padding: 5px">
      <div v-for="(template,index) in templateList" :key="index" class="block">
        <vueper-slides v-if="template.type === bannerType" :dragging-distance="70" :speed="3000" fixed-height="160px"
                       autoplay fade>
          <vueper-slide v-for="(item, itemIndex) in template.data.list" :key="index * 100 + itemIndex"
                        :image="item.imageUrl" />
        </vueper-slides>
        <div v-if="template.type === serviceType">
          <el-row type="flex" justify="space-between">
            <el-col v-for="itemIndex in template.data.list.length > 5 ? 5:template.data.list.length"
                    :key="itemIndex">
              <el-card :body-style="{ padding: '0px' }" style="margin: 2px; background: transparent" shadow="never">
                <img :src="template.data.list[itemIndex - 1].imageUrl" class="image">
                <span class="service-card-text">{{ template.data.list[itemIndex - 1].name }}</span>
              </el-card>
            </el-col>
          </el-row>
          <el-row v-if="template.data.list.length > 5" type="flex" justify="space-between">
            <el-col v-for="itemIndex in template.data.list.length - 5"
                    :key="itemIndex">
              <el-card :body-style="{ padding: '0px' }" style="margin: 5px; background: transparent" shadow="never">
                <img :src="template.data.list[itemIndex + 4].imageUrl" class="image">
                <span class="service-card-text">{{ template.data.list[itemIndex - 1].name }}</span>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <div v-if="template.type === gridType">
          <div v-if="hasTemplateTitle(index)">
            <div v-if="getGridTemplateTitleLink(index)"
                 style="display: flex;justify-content: space-between;align-items: center">
              <h2>{{ getGridTemplateTitle(index) }}</h2>
              <a> {{ getGridTemplateTitleLink(index) }}</a>
            </div>
            <h2 v-else :style="{textAlign : getGridTemplateTitleAlign(index)}">
              {{ getGridTemplateTitle(index) }}
            </h2>
          </div>
          <el-row v-for="(item,itemIndex) in template.data.list" :key="index * 200 + itemIndex"
                  type="flex" justify="space-between">
            <el-col v-for="(grid,gridIndex) in item.grids" :key="index * 200 + itemIndex * 10 + gridIndex">
              <el-card :body-style="{ padding: '0px' }" style="margin: 2px; background: transparent" shadow="never">
                <img :src="grid.imageUrl" class="image">
              </el-card>
            </el-col>
          </el-row>
        </div>
        <div v-if="template.type === promotionType">
          <div v-if="hasTemplateTitle(index)">
            <h2>{{ getPromotionTemplateTitleValue(index) }}</h2>
          </div>
          <div v-if="hasPromotionTemplateTitleImage(index)">
            <el-card :body-style="{ padding: '0px' }" style="margin: 0px; background: transparent" shadow="never">
              <img :src="getPromotionTemplateTitleImage(index)" class="image">
            </el-card>
          </div>
          <swiper :options="swiperOption">
            <swiper-slide v-for="(item, itemIndex) in template.data.list" :key="index * 100 + itemIndex">
              <el-card :body-style="{ padding: '0px' }" style="margin: 2px; background: transparent" shadow="never">
                <img :src="item.imagePath" class="image">
                <div class="card-sku-intro">
                  <span>{{ item.intro }}</span>
                </div>
                <div class="card-sku-price">
                  <span>{{ item.price + '元' }}</span>
                </div>
              </el-card>
            </swiper-slide>
          </swiper>
        </div>
        <div v-if="template.type === goodsType">
          <div v-sticky="true" v-if="hasGoodsTab(index)" :style="{background: getGoodsTabBackground(index)}"
               sticky-side="top">
            <el-tabs v-model="activeGoodsTab" @tab-click="handleGoodsTabClicked">
              <el-tab-pane v-for="(tab, tabIndex) in template.data.list" :key="tab.title" :label="tab.title"
                           :name="'goods-tab-' + tabIndex" />
            </el-tabs>
          </div>
          <div id="goods-content">
            <el-row v-for="(tab,tabIndex) in template.data.list" :key="tab.title + tabIndex" :gutter="10"
                    :id="'goods-tab-' + tabIndex">
              <el-col v-if="hasGoodsTab(index) === false" :span="24">
                <h3>{{ tab.title }}</h3>
              </el-col>
              <el-col v-for="sku in tab.skus" :key="sku.skuid" :span="12">
                <el-card :body-style="{ padding: '0px' }" style="margin: 5px 0;" shadow="never">
                  <img :src="sku.imagePath" class="image">
                  <div class="card-sku-intro">
                    <span>{{ sku.intro }}</span>
                  </div>
                  <div class="card-sku-price">
                    <span>{{ sku.price + '元' }}</span>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    bannerType,
    serviceType,
    gridType,
    promotionType,
    goodsType
  } from '@/utils/templateType'
  import { VueperSlides, VueperSlide } from 'vueperslides'
  import 'vueperslides/dist/vueperslides.css'
  import Sticky from 'vue-sticky-directive'

  import 'swiper/dist/css/swiper.css'
  import { swiper, swiperSlide } from 'vue-awesome-swiper'

  export default {
    name: 'PageDisplay',
    components: { VueperSlides, VueperSlide, swiper, swiperSlide },
    directives: { Sticky },
    data() {
      return {
        swiperOption: {
          slidesPerView: 3,
          spaceBetween: 10
        },
        pageInfo: null,
        bannerType: bannerType,
        serviceType: serviceType,
        gridType: gridType,
        promotionType: promotionType,
        goodsType: goodsType,
        gettingInfo: false,
        activeGoodsTab: 'goods-tab-0'
      }
    },
    computed: {
      pageName: {
        get() {
          return this.pageInfo ? this.pageInfo.name : ''
        }
      },
      backgroundColor: {
        get() {
          return this.pageInfo ? this.pageInfo.backgroundColor : '#ffffff'
        }
      },
      templateList: {
        get() {
          return this.pageInfo ? this.pageInfo.content : []
        }
      }
    },
    created() {
      this.getPageInfo()
    },
    methods: {
      getPageInfo() {
        const id = this.$route.params.id
        try {
          if (id !== -1) {
            this.gettingInfo = true
            this.$store.dispatch('getAggregationPageById', { id: id }).then((response) => {
              this.pageInfo = response
              this.gettingInfo = false
            }).catch(() => {
              this.gettingInfo = false
            })
          }
        } catch (e) {
          console.log('getPageInfo' + e)
        }
      },
      hasTemplateTitle(index) {
        return this.templateList[index].data.settings.title.show
      },
      getGridTemplateTitleAlign(index) {
        return this.templateList[index].data.settings.title.text.align
      },
      getGridTemplateTitle(index) {
        return this.templateList[index].data.settings.title.text.value
      },
      getGridTemplateTitleLink(index) {
        if (this.templateList[index].data.settings.title.text.hasLink) {
          return this.templateList[index].data.settings.title.text.linkTitle
        } else {
          return null
        }
      },
      getPromotionTemplateTitleValue(index) {
        return this.templateList[index].data.settings.title.textValue
      },
      hasPromotionTemplateTitleImage(index) {
        return this.templateList[index].data.settings.title.hasImage
      },
      getPromotionTemplateTitleImage(index) {
        return this.templateList[index].data.settings.title.imageUrl
      },
      hasGoodsTab(index) {
        return this.templateList[index].data.settings.hasTabBar
      },
      getGoodsTabBackground(index) {
        return this.templateList[index].data.settings.tabBarBackgroundColor
      },
      handleGoodsTabClicked(tab, event) {
        const element = '#' + tab.name
        const options = {
          element: element,
          container: '#phone-container',
          easing: 'ease-in',
          offset: -60,
          force: true
        }
        this.$scrollTo(element, 500, options)
      }
    }
  }
</script>

<style scoped>
  .phone {
    width: 100%;
    height: 100%;
    overflow: hidden auto
  }

  .block {
    padding-top: 0px;
  }

  .image {
    width: 100%;
    display: block;
  }

  .service-card-text {
    text-align: center;
    font-size: 10px;
    margin: 2px 0 0 0;
  }

  .card-sku-intro {
    height: 28px;
    font-size: 12px;
    overflow: hidden;
  }

  .card-sku-price {
    text-align: start;
    padding-top: 5px;
    font-size: 14px;
    font-weight: bolder;
  }
</style>

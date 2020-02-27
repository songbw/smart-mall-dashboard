<template>
  <div>
    <div class="goods-list-container">
      <goods-floor
        v-for="(floor, index) in goodsList"
        :key="index"
        :index="index"
        :title="floor.title"
        :app-id="pageAppId"
        @sortFloor="onSortGoodsFloor"
        @deleteFloor="onDeleteGoodsFloor"
        @titleChanged="onGoodsFloorTitleChanged"
        @titleImageChanged="onGoodsFloorTitleImageChanged"
        @titleTargetChanged="onGoodsFloorTitleTargetChanged"
        @skuColorChanged="onGoodsFloorSkuColorChanged"
        @addContent="onGoodsFloorContentAdded"
        @sortContent="onGoodsFloorContentSort"
        @changeContent="onGoodsFloorContentChanged"
        @deleteSelection="onGoodsFloorDeleteSelection"
      />
    </div>
    <div class="goods-ops-container">
      <span>最多可以添加{{ maxFloorLength }}个</span>
      <el-button :disabled="goodsInfo.list.length >= maxFloorLength" type="primary" @click="addGoodsFloor">
        添加楼层
      </el-button>
    </div>
    <el-form label-width="12rem" label-position="right">
      <el-form-item label="列表样式">
        <el-radio-group v-model="countPerLine">
          <el-radio label="1">1行1个</el-radio>
          <el-radio label="2">1行2个</el-radio>
          <el-radio label="3">1行3个</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="显示属性">
        <el-checkbox-group v-model="visibleProps">
          <el-checkbox v-for="option in visibleOptions" :key="option.value" :label="option.value">
            {{ option.label }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="显示楼层标题">
        <el-switch v-model="showFloorTitle" />
      </el-form-item>
      <el-form-item v-if="showFloorTitle" label="楼层标题字体颜色">
        <el-color-picker v-model="floorTitleTextColor" />
        <span>{{ floorTitleTextColor }}</span>
      </el-form-item>
      <el-form-item v-if="showFloorTitle" label="楼层标题底色">
        <el-color-picker v-model="floorTitleColor" />
        <span>{{ floorTitleColor }}</span>
      </el-form-item>
      <el-form-item label="价格底色">
        <el-color-picker v-model="priceBackgroundColor" />
        <span>{{ priceBackgroundColor }}</span>
      </el-form-item>
      <el-form-item label="价格字体颜色">
        <el-color-picker v-model="priceTextColor" />
        <span>{{ priceTextColor }}</span>
      </el-form-item>
      <el-form-item label="开启导航">
        <el-switch v-model="hasTabBar" />
        <span style="margin-left: 10px">
          <i class="el-icon-warning-outline">每页只能有个一个商品组件可以开启导航功能</i>
        </span>
      </el-form-item>
      <el-form-item v-if="hasTabBar" label="导航底色">
        <el-color-picker v-model="tabBarBackgroundColor" />
        <span>{{ tabBarBackgroundColor }}</span>
      </el-form-item>
      <el-form-item v-if="hasTabBar" label="导航字体底色">
        <el-color-picker v-model="tabBarTextColor" />
        <span>{{ tabBarTextColor }}</span>
      </el-form-item>
      <el-form-item label="上边距(px)">
        <el-input-number v-model="marginTop" :max="100" :min="-100" step-strictly @blur="onMarginTopBlur" />
      </el-form-item>
      <el-form-item label="下边距(px)">
        <el-input-number v-model="marginBottom" :max="100" :min="-100" step-strictly @blur="onMarginBottomBlur" />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isNumber from 'lodash/isNumber'
import GoodsFloor from './goodsFloor'
import { goodPropOptions, goodsSettings, goodsType } from './templateType'

export default {
  name: 'CustomGoods',
  components: { GoodsFloor },
  data() {
    return {
      visibleOptions: goodPropOptions,
      maxFloorLength: 20
    }
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
    goodsInfo: function () {
      if (this.pageTemplateList[this.currentTemplateIndex].type === goodsType) {
        return this.pageTemplateList[this.currentTemplateIndex].data
      } else {
        return {
          list: [],
          settings: { ...goodsSettings }
        }
      }
    },
    goodsList: {
      get() {
        return this.goodsInfo.list
      }
    },
    countPerLine: {
      get() {
        return this.goodsInfo.settings.countPerLine.toString()
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { countPerLine: Number.parseInt(newValue) })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    showFloorTitle: {
      get() {
        return this.goodsInfo.settings.showFloorTitle
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { showFloorTitle: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    floorTitleTextColor: {
      get() {
        return this.goodsInfo.settings.floorTitleTextColor
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { floorTitleTextColor: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    floorTitleColor: {
      get() {
        return this.goodsInfo.settings.floorTitleColor
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { floorTitleColor: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    priceBackgroundColor: {
      get() {
        return this.goodsInfo.settings.priceBackgroundColor
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { priceBackgroundColor: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    priceTextColor: {
      get() {
        return this.goodsInfo.settings.priceTextColor
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { priceTextColor: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    hasTabBar: {
      get() {
        return this.goodsInfo.settings.hasTabBar
      },
      set(newValue) {
        const goodList = this.pageTemplateList.filter(item => item.type === goodsType)
        const hasSet = goodList.filter(item => item.data.settings.hasTabBar).length > 0
        if (hasSet && newValue) {
          this.$message.warning('已有商品模板开启导航功能，请先关闭对应的模板')
        } else {
          const settings = Object.assign({}, this.goodsInfo.settings, { hasTabBar: newValue })
          this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
        }
      }
    },
    tabBarBackgroundColor: {
      get() {
        return this.goodsInfo.settings.tabBarBackgroundColor
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { tabBarBackgroundColor: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    tabBarTextColor: {
      get() {
        return this.goodsInfo.settings.tabBarTextColor
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { tabBarTextColor: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    marginTop: {
      get() {
        return this.goodsInfo.settings.marginTop
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { marginTop: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    marginBottom: {
      get() {
        return this.goodsInfo.settings.marginBottom
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { marginBottom: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    visibleProps: {
      get() {
        return this.goodsInfo.settings.visibleProps || []
      },
      set(newValue) {
        const settings = Object.assign({}, this.goodsInfo.settings, { visibleProps: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    }
  },
  methods: {
    addGoodsFloor() {
      const index = this.goodsInfo.list.length + 1
      const floor = {
        title: '楼层 ' + index,
        titleImageUrl: null,
        skuBackgroundColor: '#F8F8F8',
        titleTargetType: 'blank',
        titleTargetUrl: 'about:blank',
        titleTargetName: '无链接',
        skus: []
      }
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: -1, value: floor })
    },
    onSortGoodsFloor(floorIndex, up) {
      if ((up && floorIndex > 0) || (!up && floorIndex < this.goodsList.length - 1)) {
        this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { index: floorIndex, up: up })
      }
    },
    onDeleteGoodsFloor(floorIndex) {
      this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', floorIndex)
    },
    onGoodsFloorTitleChanged(floorIndex, title) {
      const floor = { title: title }
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
    },
    onGoodsFloorTitleImageChanged(floorIndex, url) {
      const floor = { titleImageUrl: url }
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
    },
    onGoodsFloorTitleTargetChanged(floorIndex, target) {
      const floor = {}
      if ('type' in target) {
        floor.titleTargetType = target.type
      }
      if ('name' in target) {
        floor.titleTargetName = target.name
      }
      if ('url' in target) {
        floor.titleTargetUrl = target.url
      }
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
    },
    onGoodsFloorSkuColorChanged(floorIndex, color) {
      const floor = { skuBackgroundColor: color }
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
    },
    onGoodsFloorContentAdded(floorIndex, skus) {
      const floor = {}
      const mpus = this.goodsList[floorIndex].skus.map(sku => sku.mpu)
      const skuArray = []
      skus.forEach(sku => {
        if (mpus.includes(sku.mpu) === false) {
          skuArray.push(sku)
        }
      })
      if (skuArray.length > 0) {
        floor.skus = this.goodsList[floorIndex].skus.concat(skuArray)
        this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
      }
    },
    onGoodsFloorContentChanged(floorIndex, params) {
      const floor = {}
      floor.skus = this.goodsList[floorIndex].skus.concat([])
      floor.skus[params.index] = { ...floor.skus[params.index], intro: params.intro }
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
    },
    onGoodsFloorContentSort(floorIndex, params) {
      const skuIndex = params.index
      const selected = this.goodsList[floorIndex].skus[skuIndex]
      const up = params.up
      const floor = {}
      floor.skus = this.goodsList[floorIndex].skus.filter(sku => sku.mpu !== selected.mpu)
      const newSkuIndex = up ? (skuIndex - params.distance) : (skuIndex + params.distance)
      floor.skus.splice(newSkuIndex, 0, selected)
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
    },
    onGoodsFloorDeleteSelection(floorIndex, selection) {
      const floor = {}
      floor.skus = this.goodsList[floorIndex].skus.filter(sku => !selection.includes(sku.mpu))
      this.$store.commit('aggregations/SET_GOODS_LIST', { index: floorIndex, value: floor })
    },
    onMarginTopBlur() {
      if (isNumber(this.marginTop) === false) {
        this.marginTop = 0
      }
    },
    onMarginBottomBlur() {
      if (isNumber(this.marginBottom) === false) {
        this.marginBottom = 0
      }
    }
  }
}
</script>

<style scoped>
  .goods-list-container {
    width: 100%;
  }

  .goods-ops-container {
    margin: 10px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
</style>

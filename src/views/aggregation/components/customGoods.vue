<template>
  <div>
    <div class="goods-list-container">
      <goods-floor
        v-for="(floor, index) in goodsList"
        :key="index"
        :index="index"
        :title="floor.title"
        @sortFloor="onSortGoodsFloor"
        @deleteFloor="onDeleteGoodsFloor"
        @titleChanged="onGoodsFloorTitleChanged"
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
    <el-form label-width="180px" label-position="right">
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
      <el-form-item label="楼层标题底色">
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
      </el-form-item>
      <el-form-item v-if="hasTabBar" label="导航底色">
        <el-color-picker v-model="tabBarBackgroundColor" />
        <span>{{ tabBarBackgroundColor }}</span>
      </el-form-item>
      <el-form-item v-if="hasTabBar" label="导航字体底色">
        <el-color-picker v-model="tabBarTextColor" />
        <span>{{ tabBarTextColor }}</span>
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GoodsFloor from './goodsFloor'
import {
  goodsType,
  goodsSettings,
  goodPropOptions
} from './templateType'

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
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    goodsInfo: function() {
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
        const settings = Object.assign({}, this.goodsInfo.settings, { hasTabBar: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
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
      floor.skus[params.index].intro = params.intro
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

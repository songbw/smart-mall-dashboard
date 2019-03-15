<template>
  <div>
    <div class="goods-list-container">
      <goods-floor v-for="(floor, index) in goodsList" :key="index"
                   :index="index"
                   :title="floor.title"
                   @sortFloor="onSortGoodsFloor"
                   @deleteFloor="onDeleteGoodsFloor"
                   @titleChanged="onGoodsFloorTitleChanged"
                   @contentAdded="onGoodsFloorContentChanged"
                   @sortContent="onGoodsFloorContentSort"
                   @deleteSelection="onGoodsFloorDeleteSelection"/>
    </div>
    <div class="goods-ops-container">
      <span>{{ $t('aggregation_customization_goods_add_floor_tips') }}</span>
      <el-button :disabled="goodsInfo.list.length >= 7" type="primary" @click="addGoodsFloor">
        {{ $t('aggregation_customization_goods_add_floor_title') }}
      </el-button>
    </div>
    <el-form label-width="180px" label-position="right">
      <el-form-item :label="$t('aggregation_customization_goods_count_per_line_title')">
        <el-radio-group v-model="countPerLine">
          <el-radio label="2">{{ $t('aggregation_customization_grid_list_count', {count: 2}) }}</el-radio>
          <el-radio label="3">{{ $t('aggregation_customization_grid_list_count', {count: 3}) }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="$t('aggregation_customization_goods_floor_color_title')">
        <el-color-picker v-model="floorTitleColor"/>
        <span>{{ floorTitleColor }}</span>
      </el-form-item>
      <el-form-item :label="$t('aggregation_customization_goods_price_color_title')">
        <el-color-picker v-model="priceBackgroundColor"/>
        <span>{{ priceBackgroundColor }}</span>
      </el-form-item>
      <el-form-item :label="$t('aggregation_customization_goods_price_text_color_title')">
        <el-color-picker v-model="priceTextColor"/>
        <span>{{ priceTextColor }}</span>
      </el-form-item>
      <el-form-item :label="$t('aggregation_customization_goods_has_tabbar_title')">
        <el-switch v-model="hasTabBar"/>
      </el-form-item>
      <el-form-item v-if="hasTabBar" :label="$t('aggregation_customization_goods_tabbar_background_color_title')">
        <el-color-picker v-model="tabBarBackgroundColor"/>
        <span>{{ tabBarBackgroundColor }}</span>
      </el-form-item>
      <el-form-item v-if="hasTabBar" :label="$t('aggregation_customization_goods_tabbar_text_color_title')">
        <el-color-picker v-model="tabBarTextColor"/>
        <span>{{ tabBarTextColor }}</span>
      </el-form-item>
      <el-form-item :label="$t('aggregation_customization_banner_margin_title')">
        <el-select v-model="marginBottom">
          <el-option label="0px" value="0"/>
          <el-option label="10px" value="10"/>
          <el-option label="20px" value="20"/>
          <el-option label="30px" value="30"/>
          <el-option label="40px" value="40"/>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import GoodsFloor from './goodsFloor'
  import { goodsType } from '@/utils/templateType'

  export default {
    name: 'CustomGoods',
    components: { GoodsFloor },
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
            settings:
              {
                countPerLine: 2,
                floorTitleColor: '#000000',
                priceBackgroundColor: '#ECE8DE',
                priceTextColor: '#6E0F00',
                hasTabBar: false,
                tabBarBackgroundColor: '#333333',
                tabBarTextColor: '#FF9933',
                marginBottom: 0
              }
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
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      },
      floorTitleColor: {
        get() {
          return this.goodsInfo.settings.floorTitleColor
        },
        set(newValue) {
          const settings = Object.assign({}, this.goodsInfo.settings, { floorTitleColor: newValue })
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      },
      priceBackgroundColor: {
        get() {
          return this.goodsInfo.settings.priceBackgroundColor
        },
        set(newValue) {
          const settings = Object.assign({}, this.goodsInfo.settings, { priceBackgroundColor: newValue })
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      },
      priceTextColor: {
        get() {
          return this.goodsInfo.settings.priceTextColor
        },
        set(newValue) {
          const settings = Object.assign({}, this.goodsInfo.settings, { priceTextColor: newValue })
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      },
      hasTabBar: {
        get() {
          return this.goodsInfo.settings.hasTabBar
        },
        set(newValue) {
          const settings = Object.assign({}, this.goodsInfo.settings, { hasTabBar: newValue })
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      },
      tabBarBackgroundColor: {
        get() {
          return this.goodsInfo.settings.tabBarBackgroundColor
        },
        set(newValue) {
          const settings = Object.assign({}, this.goodsInfo.settings, { tabBarBackgroundColor: newValue })
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      },
      tabBarTextColor: {
        get() {
          return this.goodsInfo.settings.tabBarTextColor
        },
        set(newValue) {
          const settings = Object.assign({}, this.goodsInfo.settings, { tabBarTextColor: newValue })
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      },
      marginBottom: {
        get() {
          return this.goodsInfo.settings.marginBottom
        },
        set(newValue) {
          const settings = Object.assign({}, this.goodsInfo.settings, { marginBottom: newValue })
          this.$store.commit('setTemplateGoodsSettings', settings)
        }
      }
    },
    methods: {
      addGoodsFloor() {
        const index = this.goodsInfo.list.length + 1
        const floor = {
          title: this.$t('aggregation_customization_goods_floor_title', { floor: index }),
          skus: []
        }
        this.$store.commit('changeTemplateGoodsListContent', { index: -1, value: floor })
      },
      onSortGoodsFloor(index, up) {
        if ((up && index > 0) || (!up && index < this.goodsList.length - 1)) {
          this.$store.commit('sortTemplateGoodsListContent', { index: index, up: up })
        }
      },
      onDeleteGoodsFloor(index) {
        this.$store.commit('removeTemplateGoodsListContent', { index: index })
      },
      onGoodsFloorTitleChanged(index, title) {
        const floor = Object.assign({}, this.goodsList[index], { title: title })
        this.$store.commit('changeTemplateGoodsListContent', { index: index, value: floor })
      },
      onGoodsFloorContentChanged(index, skus) {
        const floor = Object.assign({}, this.goodsList[index])
        const skuSet = new Set(floor.skus.map(sku => sku.skuid))
        const skuArray = []
        floor.skus.forEach(sku => {
          skuArray.push(Object.assign({}, sku))
        })
        skus.forEach(sku => {
          if (skuSet.has(sku.skuid) === false) {
            skuSet.add(sku.skuid)
            skuArray.push(sku)
          }
        })
        floor.skus = Array.from(skuArray)
        this.$store.commit('changeTemplateGoodsListContent', { index: index, value: floor })
      },
      onGoodsFloorContentSort(index, params) {
        const floor = Object.assign({}, this.goodsList[index])
        const skuIndex = params.index
        const up = params.up
        const newSkuIndex = up ? (skuIndex - params.distance) : (skuIndex + params.distance)
        const item = floor.skus.splice(skuIndex, 1)[0]
        floor.skus.splice(newSkuIndex, 0, item)
        this.$store.commit('changeTemplateGoodsListContent', { index: index, value: floor })
      },
      onGoodsFloorDeleteSelection(index, selection) {
        const floor = Object.assign({}, this.goodsList[index])
        selection.forEach(i => floor.skus.splice(i, 1))
        this.$store.commit('changeTemplateGoodsListContent', { index: index, value: floor })
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

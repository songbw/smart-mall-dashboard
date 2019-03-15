<template>
  <div class="floor-container">
    <div class="header-container">
      <div v-if="editingTitle" class="header-ops-container">
        <el-input v-model="floorTitle" />
        <el-button type="text" style="margin-left: 10px" @click="handleSaveTitle">
          {{ $t('confirm_button_save_title') }}
        </el-button>
      </div>
      <div v-else class="header-ops-container">
        <span>{{ floorInfo.title }}</span>
        <el-button type="text" @click="editingTitle = true">
          {{ $t('confirm_button_edit_title') }}
        </el-button>
      </div>
      <div class="header-ops-container">
        <el-tooltip :open-delay="1000" :content="$t('confirm_button_sort_up_title')" placement="top">
          <el-button icon="el-icon-caret-top" type="primary" size="mini" circle @click="handleSortFloor(true)" />
        </el-tooltip>
        <el-tooltip :open-delay="1000" :content="$t('confirm_button_sort_down_title')" placement="top">
          <el-button icon="el-icon-caret-bottom" type="primary" size="mini" circle @click="handleSortFloor(false)" />
        </el-tooltip>
        <el-tooltip :open-delay="1000" :content="$t('confirm_button_del_title')" placement="top">
          <el-button icon="el-icon-delete" type="danger" size="mini" circle @click="handleDeleteFloor" />
        </el-tooltip>
      </div>
    </div>
    <div class="header-container">
      <div class="header-ops-container">
        <el-button :icon="showDetail ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" type="primary" size="small"
                   @click="showDetail = !showDetail">
          {{ collapseLabel }}
        </el-button>
      </div>
    </div>
    <div v-if="showDetail">
      <div class="header-container">
        <div class="header-ops-container">
          <el-button size="mini" @click="dialogImportVisible = true">
            {{ $t('aggregation_customization_goods_import_title') }}
          </el-button>
          <el-button type="primary" size="mini" @click="dialogSelectionVisible = true">
            {{ $t('aggregation_customization_goods_select_title') }}
          </el-button>
        </div>
        <div class="header-ops-container">
          <span>{{ $t('aggregation_customization_goods_selected_text', {count: selectedItems.length}) }}</span>
          <el-button type="text" style="margin-left: 10px" @click="handleDeleteSelection">
            {{ $t('confirm_button_del_title') }}
          </el-button>
        </div>
      </div>
      <el-table
        ref="skuTable"
        :data="skuData"
        style="width: 100%"
        max-height="250"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="30" />
        <el-table-column :label="$t('product_table_skuid_title')" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.skuid }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product_table_name_title')" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.intro }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product_table_price_title')" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('product_table_ops_title')" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip :open-delay="1000" :content="$t('confirm_button_sort_up_title')" placement="top">
              <el-button icon="el-icon-caret-top" type="primary" size="mini" circle
                         @click="handleSortRow(true, scope.$index)" />
            </el-tooltip>
            <el-tooltip :open-delay="1000" :content="$t('confirm_button_sort_down_title')" placement="top">
              <el-button icon="el-icon-caret-bottom" type="primary" size="mini" circle
                         @click="handleSortRow(false, scope.$index)" />
            </el-tooltip>
            <el-tooltip :open-delay="1000" :content="$t('confirm_button_sort_top_title')" placement="top">
              <el-button icon="el-icon-upload2" type="primary" size="mini" circle
                         @click="handleSortTop(scope.$index)" />
            </el-tooltip>
            <el-tooltip :open-delay="1000" :content="$t('confirm_button_del_title')" placement="top">
              <el-button icon="el-icon-delete" type="danger" size="mini" circle
                         @click="handleDeleteRow(scope.$index)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <goods-selection :dialog-visible="dialogSelectionVisible"
                     @onSelectionCancelled="onGoodsSelectionCancelled"
                     @onSelectionConfirmed="onGoodsSelectionConfirmed" />
    <goods-import :dialog-visible="dialogImportVisible"
                  @onSelectionCancelled="onGoodsImportCancelled"
                  @onSelectionConfirmed="onGoodsImportConfirmed" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import GoodsSelection from '@/components/Goods/goodsSelectionDialog'
  import GoodsImport from '@/components/Goods/goodsImportDialog'
  import { goodsType } from '@/utils/templateType'

  export default {
    name: 'GoodsFloor',
    components: { GoodsSelection, GoodsImport },
    props: {
      title: {
        type: String,
        default: ''
      },
      index: {
        type: Number,
        default: -1
      }
    },
    data() {
      return {
        dialogImportVisible: false,
        dialogSelectionVisible: false,
        showDetail: false,
        editingTitle: false,
        floorTitle: this.title,
        // skuData: [],
        selectedItems: [],
        tempSkuData: [],
        fetchedCount: 0
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
      floorInfo: {
        get() {
          return this.goodsList[this.index]
        }
      },
      skuData: {
        get() {
          return this.floorInfo.skus
        }
      },
      collapseLabel: {
        get() {
          if (this.showDetail) {
            return '收起楼层商品详情'
          } else {
            return '查看楼层商品详情'
          }
        }
      }
    },
    methods: {
      handleSortFloor(up) {
        this.$emit('sortFloor', this.index, up)
      },
      handleDeleteFloor() {
        this.$emit('deleteFloor', this.index)
      },
      handleSaveTitle() {
        this.editingTitle = false
        if (this.floorTitle.length > 0 && this.floorTitle !== this.floorInfo.title) {
          this.$emit('titleChanged', this.index, this.floorTitle)
        }
      },
      handleSelectionChange(val) {
        if (val.length > 0) {
          this.selectedItems = val.map(item =>
            this.floorInfo.skus.indexOf(item.skuid))
          this.selectedItems.sort((a, b) => b - a)
        } else {
          this.selectedItems = []
        }
      },
      handleDeleteSelection() {
        if (this.selectedItems.length > 0) {
          this.$emit('deleteSelection', this.index, this.selectedItems)
          this.$refs.skuTable.clearSelection()
        }
      },
      handleDeleteRow(index) {
        this.$emit('deleteSelection', this.index, [index])
      },
      sortSkuData(up, index, distance) {
        const newIndex = up ? index - distance : index + distance
        const item = this.skuData.splice(index, 1)[0]
        this.skuData.splice(newIndex, 0, item)
      },
      handleSortRow(up, index) {
        if ((up && index > 0) || (!up && index < (this.skuData.length - 1))) {
          this.$emit('sortContent', this.index, { up: up, index: index, distance: 1 })
        }
      },
      handleSortTop(index) {
        if (index > 0) {
          this.$emit('sortContent', this.index, { up: true, index: index, distance: index })
        }
      },
      onGoodsSelectionConfirmed(skus) {
        this.dialogSelectionVisible = false
        this.$emit('contentAdded', this.index, skus)
      },
      onGoodsSelectionCancelled() {
        this.dialogSelectionVisible = false
      },
      onGoodsImportConfirmed(skus) {
        this.dialogImportVisible = false
        this.$emit('contentAdded', this.index, skus)
      },
      onGoodsImportCancelled() {
        this.dialogImportVisible = false
      }
    }
  }
</script>

<style scoped>
  .floor-container {
    margin: 10px 0;
    background-color: #F2F6FC;
    border: 1px dashed #eee;
    width: 100%;
  }

  .header-container {
    display: flex;
    justify-content: space-between;
    margin: 10px 20px;
  }

  .header-ops-container {
    display: flex;
    align-items: center;
  }
</style>

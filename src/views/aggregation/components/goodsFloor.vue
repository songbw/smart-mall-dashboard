<template>
  <div class="floor-container">
    <div class="header-container">
      <div v-if="editingTitle" class="header-ops-container">
        <el-input v-model="floorTitle" />
        <el-button type="text" style="margin-left: 10px" @click="handleSaveTitle">
          保存
        </el-button>
      </div>
      <div v-else class="header-ops-container">
        <span>{{ floorInfo.title }}</span>
        <el-button type="text" @click="editingTitle = true">
          编辑
        </el-button>
      </div>
      <div class="header-ops-container">
        <el-tooltip :open-delay="1000" content="上移" placement="top">
          <el-button icon="el-icon-caret-top" type="primary" size="mini" circle @click="handleSortFloor(true)" />
        </el-tooltip>
        <el-tooltip :open-delay="1000" content="下移" placement="top">
          <el-button icon="el-icon-caret-bottom" type="primary" size="mini" circle @click="handleSortFloor(false)" />
        </el-tooltip>
        <el-tooltip :open-delay="1000" content="删除" placement="top">
          <el-button icon="el-icon-delete" type="danger" size="mini" circle @click="handleDeleteFloor" />
        </el-tooltip>
      </div>
    </div>
    <div class="header-container">
      <div class="header-ops-container">
        <el-button
          :icon="showDetail ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
          type="primary"
          size="small"
          @click="showDetail = !showDetail"
        >
          {{ collapseLabel }}
        </el-button>
      </div>
    </div>
    <div v-if="showDetail">
      <div class="header-container">
        <div class="header-ops-container">
          <el-button type="primary" size="mini" @click="dialogSelectionVisible = true">
            选择商品
          </el-button>
          <el-button size="mini" type="info" @click="dialogImportVisible = true">
            导入商品
          </el-button>
          <el-button size="mini" @click="handleExportGoods">
            导出商品
          </el-button>
        </div>
        <div class="header-ops-container">
          <span>{{ `已选择${selectedItems.length}件商品` }}</span>
          <el-button type="text" style="margin-left: 10px" @click="handleDeleteSelection">
            删除
          </el-button>
        </div>
      </div>
      <el-table
        ref="skuTable"
        :data="skuData"
        style="width: 100%"
        height="350"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column label="商品SKU" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.skuid }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.intro }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品价格(元)" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-tooltip :open-delay="1000" content="上移" placement="top">
              <el-button
                icon="el-icon-caret-top"
                type="primary"
                size="mini"
                circle
                @click="handleSortRow(true, scope.$index)"
              />
            </el-tooltip>
            <el-tooltip :open-delay="1000" content="下移" placement="top">
              <el-button
                icon="el-icon-caret-bottom"
                type="primary"
                size="mini"
                circle
                @click="handleSortRow(false, scope.$index)"
              />
            </el-tooltip>
            <el-tooltip :open-delay="1000" content="置顶" placement="top">
              <el-button
                icon="el-icon-upload2"
                type="primary"
                size="mini"
                circle
                @click="handleSortTop(scope.$index)"
              />
            </el-tooltip>
            <el-tooltip :open-delay="1000" content="删除" placement="top">
              <el-button
                icon="el-icon-delete"
                type="danger"
                size="mini"
                circle
                @click="handleDeleteRow(scope.$index)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <goods-selection-dialog
      :dialog-visible="dialogSelectionVisible"
      @onSelectionCancelled="onGoodsSelectionCancelled"
      @onSelectionConfirmed="onGoodsSelectionConfirmed"
    />
    <goods-import-dialog
      :dialog-visible="dialogImportVisible"
      @onSelectionCancelled="onGoodsImportCancelled"
      @onSelectionConfirmed="onGoodsImportConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import { goodsType } from './templateType'

export default {
  name: 'GoodsFloor',
  components: { GoodsSelectionDialog, GoodsImportDialog },
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
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j !== 'state') {
          return v[j]
        } else {
          if (v[j] === '1') {
            return '销售中'
          } else {
            return '已下架'
          }
        }
      }))
    },
    handleExportGoods() {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = ['skuID']
        const filterVal = ['skuid']
        const list = this.skuData
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: `${this.floorTitle}-商品列表`
        })
      })
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

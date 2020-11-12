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
    <div v-if="!hasTabBar && showFloorTitle" style="margin: 10px 20px;display: flex;justify-content: space-between">
      <div>
        <image-upload
          :image-url="titleImageUrl"
          path-name="aggregations"
          button-size="mini"
          image-width="200px"
          tip="如果上传，将不显示楼层标题！"
          button-name="选择楼层标题图"
          @success="handleUploadImageSuccess"
        />
        <el-button
          :disabled="titleImageUrl === null"
          type="danger"
          icon="el-icon-delete"
          style="margin-top: 10px"
          size="mini"
          @click="handleRemoveImage"
        >
          删除楼层标题图
        </el-button>
      </div>
      <div>
        <div>楼层链接</div>
        <image-target-link
          :target-index="index"
          :target-type="titleTargetType"
          :target-url="titleTargetUrl"
          :target-name="titleTargetName"
          :app-id="appId"
          @targetChanges="handleImageTargetChanges"
        />
      </div>
    </div>
    <div class="header-container">
      <el-form label-width="8rem" inline>
        <el-form-item label="商品背景颜色">
          <el-color-picker v-model="skuBackgroundColor" />
          <span>{{ skuBackgroundColor }}</span>
        </el-form-item>
        <el-form-item label="热销商品">
          <el-switch v-model="bestSelling" />
        </el-form-item>
      </el-form>
      <el-button
        :icon="showDetail ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
        type="primary"
        size="small"
        @click="onShowDetailClicked"
      >
        {{ collapseLabel }}
      </el-button>
    </div>
    <div v-if="showDetail">
      <div class="header-container">
        <div class="header-ops-container">
          <el-button :loading="skuLoading" icon="el-icon-refresh" type="warning" size="mini" @click="refreshSkuData">
            刷新商品
          </el-button>
          <el-button type="primary" size="mini" @click="onGoodsSelectionClicked">
            添加商品
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
        v-loading="skuLoading"
        :data="skuData"
        style="width: 100%"
        height="350"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column label="商品MPU" align="center" width="150">
          <template slot-scope="scope">
            <el-link :href="'/goods/viewProduct/' + scope.row.mpu" target="_blank" type="primary">
              {{ scope.row.mpu }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="商品名" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.intro || scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品价格(元)" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品状态" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.state | productState }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="bestSelling" label="销售数量" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.saleCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="250">
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
                icon="el-icon-top"
                type="primary"
                size="mini"
                circle
                @click="handleSortTop(scope.$index)"
              />
            </el-tooltip>
            <el-tooltip :open-delay="1000" content="编辑" placement="top">
              <el-button
                icon="el-icon-edit"
                type="info"
                size="mini"
                circle
                @click="handleEditRow(scope.$index)"
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
      :use-default-sku="true"
      @onSelectionCancelled="dialogSelectionVisible = false"
      @onSelectionConfirmed="onGoodsSelectionConfirmed"
    />
    <goods-import-dialog
      :dialog-visible="dialogImportVisible"
      @onSelectionCancelled="onGoodsImportCancelled"
      @onSelectionConfirmed="onGoodsImportConfirmed"
    />
    <best-selling-selection-dialog
      :dialog-visible="bestSellingSelectionVisible"
      :sku-count="100"
      @onSelectionCancelled="bestSellingSelectionVisible = false"
      @onSelectionConfirmed="onGoodsSelectionConfirmed"
    />
    <el-dialog
      :visible.sync="editDialogVisible"
      title="修改商品促销名称"
      center
    >
      <el-form label-width="80px">
        <el-form-item label="商品名">
          <el-input :value="editGoodName" readonly />
        </el-form-item>
        <el-form-item label="促销名">
          <el-input v-model="editIntro" maxlength="50" clearable />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSetIntro">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import ImageUpload from '@/components/ImageUpload'
import ImageTargetLink from './imageTargetLink'
import { goodsType } from './templateType'
import BestSellingSelectionDialog from '@/components/BestSellingSelectionDialog/index'
import { getProductsByMpuListApi } from '@/api/products'
import { invalid_renter_id, product_state_off_shelves, ProductStateOptions } from '@/utils/constants'
import { floatToFixed } from '@/utils'

export default {
  name: 'GoodsFloor',
  components: { BestSellingSelectionDialog, GoodsSelectionDialog, GoodsImportDialog, ImageUpload, ImageTargetLink },
  filters: {
    productState: state => {
      const value = typeof state === 'string' ? Number.parseInt(state) : state
      if (Number.isNaN(value)) {
        return state
      } else {
        const find = ProductStateOptions.find(option => option.value === value)
        return find ? find.label : state
      }
    }
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    index: {
      type: Number,
      default: -1
    },
    appId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      dialogImportVisible: false,
      dialogSelectionVisible: false,
      bestSellingSelectionVisible: false,
      skuLoading: false,
      showDetail: false,
      editingTitle: false,
      floorTitle: this.title,
      selectedItems: [],
      fetchedCount: 0,
      editDialogVisible: false,
      editGoodIndex: -1,
      editGoodName: '',
      editIntro: ''
    }
  },
  computed: {
    ...mapGetters({
      platformAppList: 'platformAppList',
      currentAggregation: 'currentAggregation',
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    renterId() {
      const find = this.platformAppList.find(item => this.currentAggregation.appId === item.appId)
      return find ? find.renterId : invalid_renter_id
    },
    goodsInfo: function () {
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
    titleImageUrl: {
      get() {
        return this.floorInfo.titleImageUrl
      }
    },
    titleTargetType: {
      get() {
        return this.floorInfo.titleTargetType
      }
    },
    titleTargetUrl: {
      get() {
        return this.floorInfo.titleTargetUrl
      }
    },
    titleTargetName: {
      get() {
        return this.floorInfo.titleTargetName
      }
    },
    skuBackgroundColor: {
      get() {
        return this.floorInfo.skuBackgroundColor
      },
      set(value) {
        this.$emit('skuColorChanged', this.index, value)
      }
    },
    bestSelling: {
      get() {
        return 'bestSelling' in this.floorInfo ? this.floorInfo.bestSelling : false
      },
      set(value) {
        this.$emit('bestSellingChanged', this.index, value)
      }
    },
    skuData: {
      get() {
        return this.floorInfo.skus
      }
    },
    showFloorTitle: {
      get() {
        return this.goodsInfo.settings.showFloorTitle
      }
    },
    hasTabBar: {
      get() {
        return this.goodsInfo.settings.hasTabBar
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
    onShowDetailClicked() {
      this.showDetail = !this.showDetail
      if (this.showDetail && this.skuData.length > 0) {
        this.refreshSkuData()
      }
    },
    getRenterSpuState(spu, renterId) {
      const stateList = spu.appSkuStateList
      if (Array.isArray(stateList) && stateList.length > 0) {
        const find = stateList.find(item => item.renterId === renterId)
        return find ? find.state.toString() : spu.state
      } else {
        return spu.state
      }
    },
    getRenterSpuPrice(spu, renterId) {
      const priceList = spu.appSkuPriceList
      if (Array.isArray(priceList) && priceList.length > 0) {
        const find = priceList.find(item => item.renterId === renterId)
        return find ? floatToFixed(find.price / 100) : spu.price
      } else {
        return spu.price
      }
    },
    getSpuData(mpu, list) {
      const find = list.find(item => item.mpu === mpu)
      if (find) {
        return {
          state: this.getRenterSpuState(find, this.renterId),
          price: this.getRenterSpuPrice(find, this.renterId)
        }
      } else {
        return { state: product_state_off_shelves.toString(), price: '0' }
      }
    },
    async refreshSkuData() {
      try {
        this.skuLoading = true
        const params = {
          mpuIdList: this.skuData.map(item => item.mpu).join(',')
        }
        const { code, data } = await getProductsByMpuListApi(params)
        if (code === 200 && data.result.length > 0) {
          const fetchedList = data.result
          const list = this.skuData.map(item => {
            const spuData = this.getSpuData(item.mpu, fetchedList)
            return { ...item, state: spuData.state, price: spuData.price }
          })
          this.$emit('updateContent', this.index, list)
        }
      } catch (e) {
        console.warn('Get product list error:' + e)
      } finally {
        this.skuLoading = false
      }
    },
    handleSortFloor(up) {
      this.$emit('sortFloor', this.index, up)
    },
    async handleDeleteFloor() {
      try {
        await this.$confirm('是否要删除此楼层商品？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.$emit('deleteFloor', this.index)
      } catch (e) {
        console.warn('Goods delete floor error: ' + e)
      }
    },
    handleSaveTitle() {
      this.editingTitle = false
      if (this.floorTitle.length > 0 && this.floorTitle !== this.floorInfo.title) {
        this.$emit('titleChanged', this.index, this.floorTitle)
      }
    },
    handleUploadImageSuccess(url) {
      this.$emit('titleImageChanged', this.index, url)
    },
    handleRemoveImage() {
      this.$emit('titleImageChanged', this.index, null)
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selectedItems = val.map(item => item.mpu)
      } else {
        this.selectedItems = []
      }
    },
    async handleDeleteSelection() {
      if (this.selectedItems.length > 0) {
        try {
          await this.$confirm('是否要删除所选商品？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          this.$emit('deleteSelection', this.index, this.selectedItems)
          this.$refs.skuTable.clearSelection()
        } catch (e) {
          console.warn('Goods delete selection error: ' + e)
        }
      }
    },
    async handleDeleteRow(index) {
      try {
        await this.$confirm('是否要删除此商品？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const mpu = this.skuData[index].mpu
        this.$emit('deleteSelection', this.index, [mpu])
      } catch (e) {
        console.warn('Goods delete row error:' + e)
      }
    },
    handleEditRow(index) {
      this.editGoodIndex = index
      this.editGoodName = this.skuData[index].name
      this.editIntro = this.skuData[index].intro
      this.editDialogVisible = true
    },
    handleSetIntro() {
      this.editDialogVisible = false
      if (this.editGoodIndex >= 0 &&
        this.editIntro !== this.skuData[this.editGoodIndex].intro) {
        this.$emit('changeContent', this.index, { index: this.editGoodIndex, intro: this.editIntro })
      }
      this.editGoodIndex = -1
      this.editGoodName = ''
      this.editIntro = ''
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
      this.bestSellingSelectionVisible = false
      this.$emit('addContent', this.index, skus)
    },
    onGoodsSelectionCancelled() {
      this.dialogSelectionVisible = false
    },
    onGoodsImportConfirmed(skus) {
      this.dialogImportVisible = false
      this.$emit('addContent', this.index, skus)
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
    onGoodsSelectionClicked() {
      if (this.bestSelling) {
        this.bestSellingSelectionVisible = true
      } else {
        this.dialogSelectionVisible = true
      }
    },
    handleExportGoods() {
      import('@/utils/Export2Excel').then(excel => {
        const tHeader = ['商品MPU']
        const filterVal = ['mpu']
        const list = this.skuData
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: `${this.floorTitle}-商品列表`
        })
      })
    },
    handleImageTargetChanges(target) {
      this.$emit('titleTargetChanged', this.index, target)
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
  align-items: center;
}

.header-ops-container {
  display: flex;
  align-items: center;
}
</style>

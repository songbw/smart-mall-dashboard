<template>
  <div class="floor-container">
    <div class="header-container">
      <div>
        <div>
          <span>活动名称：</span>
          <el-link
            :href="`/marketing/viewPromotion/${promotionId}`"
            target="_blank"
            type="primary"
          >
            {{ promotionName }}
          </el-link>
        </div>
        <div>
          活动时间：{{ startDate | dateFilter }} - {{ endDate | dateFilter }}
        </div>
      </div>
      <el-button
        type="danger"
        size="small"
        @click="handleDeletePromotion"
      >
        删除促销活动
      </el-button>
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
          <el-button
            :disabled="promotionId < 0"
            type="primary"
            size="mini"
            @click="dialogSelectionVisible = true"
          >
            添加商品
          </el-button>
          <span style="font-size: 14px;margin-left: 10px">
            <i class="el-icon-warning-outline" />
            已添加{{ skuData.length }}个商品，最多{{ maxSkuNum }}个
          </span>
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
        max-height="450"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
        />
        <el-table-column label="商品SKU" align="center" width="150">
          <template slot-scope="scope">
            <el-link :href="'/goods/viewProduct/' + scope.row.mpu" target="_blank" type="primary">
              {{ scope.row.skuid }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column label="商品名" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.intro || scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="活动价格(元)" align="center" width="160">
          <template slot-scope="scope">
            <div style="margin-bottom: 3px">{{ scope.row | promotionPrice }}</div>
            <div style="text-decoration: line-through;font-style: italic">
              ({{ scope.row.price }})
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-tooltip :open-delay="1000" content="上移" placement="top">
              <el-button
                :disabled="scope.$index === 0"
                icon="el-icon-caret-top"
                type="primary"
                size="mini"
                circle
                @click="handleSortRow(true, scope.$index)"
              />
            </el-tooltip>
            <el-tooltip :open-delay="1000" content="下移" placement="top">
              <el-button
                :disabled="scope.$index === skuData.length - 1"
                icon="el-icon-caret-bottom"
                type="primary"
                size="mini"
                circle
                @click="handleSortRow(false, scope.$index)"
              />
            </el-tooltip>
            <el-tooltip :open-delay="1000" content="置顶" placement="top">
              <el-button
                :disabled="scope.$index === 0"
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
      :promotion-id="promotionId"
      @onSelectionCancelled="onGoodsSelectionCancelled"
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
import moment from 'moment'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'

export default {
  name: 'PromotionFloor',
  components: { GoodsSelectionDialog },
  filters: {
    dateFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    },
    promotionPrice: sku => {
      const price = Number.parseFloat(sku.price)
      const discount = Number.parseFloat(sku.discount)
      const value = price - discount
      return Number.isInteger(value) ? value : value.toFixed(2)
    }
  },
  props: {
    index: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      maxSkuNum: 16,
      showDetail: false,
      dialogSelectionVisible: false,
      selectedItems: [],
      originalImageProp: null,
      editDialogVisible: false,
      editGoodIndex: -1,
      editGoodName: '',
      editIntro: ''
    }
  },
  computed: {
    ...mapGetters({
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    collapseLabel: {
      get() {
        if (this.showDetail) {
          return '收起活动商品详情'
        } else {
          return '查看活动商品详情'
        }
      }
    },
    templateInfo: function() {
      return this.pageTemplateList[this.currentTemplateIndex].data
    },
    promotionData: function() {
      return this.templateInfo.list[this.index]
    },
    skuData: function() {
      return this.promotionData.skus
    },
    promotionId: {
      get() {
        return this.promotionData.promotionId
      }
    },
    promotionName: {
      get() {
        return this.promotionData.promotionName
      }
    },
    startDate: {
      get() {
        return this.promotionData.startDate
      }
    },
    endDate: {
      get() {
        return this.promotionData.endDate
      }
    }
  },
  methods: {
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selectedItems = val.map(item => item.mpu)
      } else {
        this.selectedItems = []
      }
    },
    handleDeleteSelection() {
    },
    async handleDeletePromotion() {
      try {
        await this.$confirm('是否要删除此活动？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.$emit('deletePromotion', this.index)
      } catch (e) {
        console.warn('Aggregation delete promotion error: ' + e)
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
    handleEditRow(index) {
      this.editGoodIndex = index
      this.editGoodName = this.skuData[index].name
      this.editIntro = this.skuData[index].intro
      this.editDialogVisible = true
    },
    addPromotionSkus(skus) {
      const filteredSkus = skus.filter(sku => this.skuData.findIndex(item => item.mpu === sku.mpu) < 0)
      if (filteredSkus.length > 0) {
        if (this.skuData.length + filteredSkus.length <= this.maxSkuNum) {
          this.$emit('changeContent', this.index, this.skuData.concat(filteredSkus))
        } else {
          this.$message.warning(`活动商品最多添加${this.maxSkuNum}个，请仔细选择商品！`)
        }
      }
    },
    onGoodsSelectionConfirmed(skus) {
      this.dialogSelectionVisible = false
      this.addPromotionSkus(skus)
    },
    onGoodsSelectionCancelled() {
      this.dialogSelectionVisible = false
    },
    handleSetIntro() {
      this.editDialogVisible = false
      if (this.editGoodIndex >= 0 &&
        this.editIntro !== this.skuData[this.editGoodIndex].intro) {
        const skus = this.skuData.map((sku, index) =>
          index === this.editGoodIndex ? { ...sku, intro: this.editIntro } : { ...sku })
        this.$emit('changeContent', this.index, skus)
      }
      this.editGoodIndex = -1
      this.editGoodName = ''
      this.editIntro = ''
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

<template>
  <div>
    <div class="show-border">
      <el-radio-group v-model="editSide" style="margin: 10px">
        <el-radio-button label="left">左边活动</el-radio-button>
        <el-radio-button label="right">右边活动</el-radio-button>
      </el-radio-group>
      <el-form label-position="right" label-width="160px">
        <el-form-item label="活动标题">
          <el-input v-model="titleTextValue" />
        </el-form-item>
        <el-form-item label="促销活动">
          <el-button
            v-if="titleHasPromotionActivity"
            :disabled="titlePromotionDailySchedule"
            type="primary"
            size="small"
            style="margin-left: 10px"
            @click="dialogPromotionVisible = true"
          >
            选择促销活动
          </el-button>
          <div v-if="titleHasPromotionActivity">
            <el-switch
              v-model="titlePromotionDailySchedule"
              active-text="全天分时段"
              inactive-text="普通活动"
            />
          </div>
          <div v-if="titleHasPromotionActivity">
            <span>活动名称：</span>
            <span v-if="titlePromotionDailySchedule">全天分时段</span>
            <el-link
              v-else
              :href="`/marketing/viewPromotion/${titlePromotionActivityId}`"
              target="_blank"
              type="primary"
            >
              {{ titlePromotionActivityName }}
            </el-link>
          </div>
          <div v-if="titleHasPromotionActivity">
            <div v-if="titlePromotionDailySchedule">
              活动时间：当天24小时
            </div>
            <div v-else>
              活动时间： {{ titlePromotionActivityStartDate | dateFilter }}
              - {{ titlePromotionActivityEndDate | dateFilter }}
            </div>
          </div>
        </el-form-item>
        <el-form-item v-if="!titleHasPromotionActivity" label="开启活动图片">
          <el-switch v-model="titleHasImage" />
        </el-form-item>
        <el-form-item
          v-if="titleHasImage"
          label="活动图片"
        >
          <image-upload
            :image-url="titleImageUrl"
            path-name="aggregations"
            image-width="150px"
            tip="请选择此活动所需的图片，文件格式为JPG或PNG"
            @success="handleUploadImageSuccess"
          />
        </el-form-item>
        <el-form-item
          v-if="titleHasImage"
          label="图片链接地址"
        >
          <image-target-link
            :could-change="titleHasPromotionActivity === false"
            :target-index="currentTemplateIndex"
            :target-type="titleTargetType"
            :target-url="titleTargetUrl"
            :target-name="titleTargetName"
            :app-id="pageAppId"
            @targetChanges="handleImageTargetChanges"
          />
        </el-form-item>
      </el-form>
    </div>
    <el-form label-width="160px" label-position="right" style="margin-top: 10px">
      <!--
      <el-form-item label="商品展示">
        <el-radio-group v-model="countPerLine">
          <el-radio label="2">1行2个</el-radio>
          <el-radio label="3">1行3个</el-radio>
        </el-radio-group>
      </el-form-item>
      -->
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
    <div class="header-container">
      <div class="header-ops-container">
        <el-button v-if="titleHasPromotionActivity === false" size="mini" @click="dialogImportVisible = true">
          导入商品
        </el-button>
        <el-button
          :disabled="titlePromotionDailySchedule || (titleHasPromotionActivity && titlePromotionActivityId < 0)"
          type="primary"
          size="mini"
          @click="dialogSelectionVisible = true"
        >
          添加商品
        </el-button>
        <span style="font-size: 14px;margin-left: 10px">
          <i class="el-icon-warning-outline" />
          已添加{{ currentSideSkuData.length }}个商品，最多{{ maxSideSkuNum }}个
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
      :data="currentSideSkuData"
      style="width: 100%"
      max-height="450"
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
      <el-table-column label="操作" align="center" width="250">
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
              :disabled="scope.$index === currentSideSkuData.length - 1"
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
              @click="handleSortTop(scope.row)"
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
              @click="handleDeleteRow(scope.row)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <promotion-selection
      :app-id="pageAppId"
      :dialog-visible="dialogPromotionVisible"
      @onSelectionCancelled="onPromotionSelectionCancelled"
      @onSelectionConfirmed="onPromotionSelectionConfirmed"
    />
    <goods-selection-dialog
      :dialog-visible="dialogSelectionVisible"
      :promotion-id="titlePromotionActivityId"
      @onSelectionCancelled="onGoodsSelectionCancelled"
      @onSelectionConfirmed="onGoodsSelectionConfirmed"
    />
    <goods-import-dialog
      :dialog-visible="dialogImportVisible"
      @onSelectionCancelled="onGoodsImportCancelled"
      @onSelectionConfirmed="onGoodsImportConfirmed"
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
import { comboType, comboSettings } from './templateType'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import ImageUpload from '@/components/ImageUpload'
import PromotionSelection from './promotionSelection'
import ImageTargetLink from './imageTargetLink'

export default {
  name: 'CustomCombo',
  components: { GoodsSelectionDialog, GoodsImportDialog, ImageTargetLink, PromotionSelection, ImageUpload },
  filters: {
    dateFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      maxSideSkuNum: 10,
      editSide: 'left',
      dialogPromotionVisible: false,
      dialogImportVisible: false,
      dialogSelectionVisible: false,
      selectedItems: [],
      editDialogVisible: false,
      editGoodIndex: -1,
      editGoodName: '',
      editIntro: ''
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
    comboInfo: function () {
      if (this.pageTemplateList[this.currentTemplateIndex].type === comboType) {
        return this.pageTemplateList[this.currentTemplateIndex].data
      } else {
        return {
          list: [],
          settings: { ...comboSettings }
        }
      }
    },
    currentSideSetting() {
      return this.editSide === 'left' ? this.comboInfo.settings.left : this.comboInfo.settings.right
    },
    currentSideSkuData() {
      return this.comboInfo.list.filter(item => item.side === this.editSide)
    },
    titleTextValue: {
      get() {
        return this.currentSideSetting.textValue
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { textValue: newValue })
        this.changeSideTitle(title)
      }
    },
    titleHasPromotionActivity: {
      get() {
        return this.currentSideSetting.hasPromotionActivity
      },
      set(newValue) {
        const newTitle = { hasPromotionActivity: newValue }
        if (newValue) {
          newTitle.targetType = 'promotion'
        } else {
          newTitle.promotionActivityId = -1
          newTitle.promotionActivityName = ''
          newTitle.promotionActivityStartDate = ''
          newTitle.promotionActivityEndDate = ''
          newTitle.targetType = 'aggregation'
          newTitle.targetUrl = ''
          newTitle.targetName = ''
        }
        newTitle.promotionDailySchedule = false
        const title = Object.assign({}, this.currentSideSetting, newTitle)
        this.changeSideTitle(title)
      }
    },
    titlePromotionDailySchedule: {
      get() {
        return this.currentSideSetting.promotionDailySchedule
      },
      set(newValue) {
        const newTitle = { promotionDailySchedule: newValue }
        if (newValue) {
          newTitle.promotionActivityId = -1
          newTitle.promotionActivityName = ''
          newTitle.promotionActivityStartDate = ''
          newTitle.promotionActivityEndDate = ''
          this.clearSideSkus()
        }
        const title = Object.assign({}, this.currentSideSetting, newTitle)
        this.changeSideTitle(title)
      }
    },
    titlePromotionActivityId: {
      get() {
        if (this.titleHasPromotionActivity) {
          return this.currentSideSetting.promotionActivityId
        } else {
          return -1
        }
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { promotionActivityId: newValue })
        this.changeSideTitle(title)
      }
    },
    titlePromotionActivityName: {
      get() {
        return this.currentSideSetting.promotionActivityName
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { promotionActivityName: newValue })
        this.changeSideTitle(title)
      }
    },
    titlePromotionActivityStartDate: {
      get() {
        return this.currentSideSetting.promotionActivityStartDate
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { promotionActivityStartDate: newValue })
        this.changeSideTitle(title)
      }
    },
    titlePromotionActivityEndDate: {
      get() {
        return this.currentSideSetting.promotionActivityEndDate
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { promotionActivityEndDate: newValue })
        this.changeSideTitle(title)
      }
    },
    titleHasImage: {
      get() {
        return this.titleHasPromotionActivity ? false : this.currentSideSetting.hasImage
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { hasImage: newValue })
        this.changeSideTitle(title)
      }
    },
    titleImageUrl: {
      get() {
        return this.currentSideSetting.imageUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { imageUrl: newValue })
        this.changeSideTitle(title)
      }
    },
    titleTargetType: {
      get() {
        return this.currentSideSetting.targetType
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { targetType: newValue })
        this.changeSideTitle(title)
      }
    },
    titleTargetUrl: {
      get() {
        return this.currentSideSetting.targetUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { targetUrl: newValue })
        this.changeSideTitle(title)
      }
    },
    titleTargetName: {
      get() {
        return this.currentSideSetting.targetName
      },
      set(newValue) {
        const title = Object.assign({}, this.currentSideSetting, { targetName: newValue })
        this.changeSideTitle(title)
      }
    },
    countPerLine: {
      get() {
        return this.comboInfo.settings.countPerLine.toString()
      },
      set(newValue) {
        const settings = Object.assign({}, this.comboInfo.settings, { countPerLine: Number.parseInt(newValue) })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    marginBottom: {
      get() {
        return this.comboInfo.settings.marginBottom
      },
      set(newValue) {
        const settings = Object.assign({}, this.comboInfo.settings, { marginBottom: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    }
  },
  methods: {
    changeSideTitle(sideTitle) {
      const side = this.editSide === 'left' ? { left: sideTitle } : { right: sideTitle }
      const settings = Object.assign({}, this.comboInfo.settings, side)
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
    },
    clearSideSkus() {
      const skus = this.comboInfo.list.filter(item => item.side !== this.editSide)
      this.$store.commit('aggregations/SET_PROMOTION_LIST', skus)
    },
    onPromotionSelectionConfirmed(promotion) {
      this.dialogPromotionVisible = false
      this.titlePromotionActivityId = promotion.id
      this.titlePromotionActivityName = promotion.name
      this.titlePromotionActivityStartDate = promotion.startDate
      this.titlePromotionActivityEndDate = promotion.endDate
      this.titleTargetType = 'promotion'
      this.titleTargetUrl = 'route://promotion/' + promotion.id
      this.titleTargetName = promotion.name
    },
    onPromotionSelectionCancelled() {
      this.dialogPromotionVisible = false
    },
    handleUploadImageSuccess(url) {
      this.titleImageUrl = url
    },
    handleImageTargetChanges(target) {
      if (this.titleHasPromotionActivity) {
        return
      }
      if ('type' in target) {
        this.titleTargetType = target.type
      }
      if ('name' in target) {
        this.titleTargetName = target.name
      }
      if ('url' in target) {
        this.titleTargetUrl = target.url
      }
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
          const skus = this.comboInfo.list.filter(item => !this.selectedItems.includes(item.mpu))
          this.$store.commit('aggregations/SET_PROMOTION_LIST', skus)
          this.$refs.skuTable.clearSelection()
        } catch (e) {
          console.warn('Aggregation delete promotion selection error: ' + e)
        }
      }
    },
    async handleDeleteRow(row) {
      try {
        await this.$confirm('是否要删除此商品？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const index = this.comboInfo.list.findIndex(item => item.mpu === row.mpu)
        this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
      } catch (e) {
        console.warn('Aggregation delete promotion good error: ' + e)
      }
    },
    handleSortRow(up, rowIndex) {
      const mpu = this.currentSideSkuData[rowIndex].mpu
      const index = this.comboInfo.list.findIndex(item => item.mpu === mpu)
      let distance = 1
      const nextRowIndex = up ? rowIndex - 1 : rowIndex + 1
      if (nextRowIndex >= 0 && nextRowIndex < this.currentSideSkuData.length) {
        const nextMpu = this.currentSideSkuData[nextRowIndex].mpu
        const nextIndex = this.comboInfo.list.findIndex(item => item.mpu === nextMpu)
        distance = up ? index - nextIndex : nextIndex - index
      }
      this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: up, index, distance })
    },
    handleSortTop(row) {
      const index = this.comboInfo.list.findIndex(item => item.mpu === row.mpu)
      this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: true, index, distance: index })
    },
    handleEditRow(index) {
      this.editGoodIndex = index
      this.editGoodName = this.currentSideSkuData[index].name
      this.editIntro = this.currentSideSkuData[index].intro
      this.editDialogVisible = true
    },
    handleSetIntro() {
      this.editDialogVisible = false
      if (this.editGoodIndex >= 0 &&
        this.editIntro !== this.currentSideSkuData[this.editGoodIndex].intro) {
        const mpu = this.currentSideSkuData[this.editGoodIndex].mpu
        const index = this.comboInfo.list.findIndex(item => item.mpu === mpu)
        this.$store.commit('aggregations/SET_PROMOTION_LIST_CONTENT', {
          index,
          intro: this.editIntro
        })
      }
      this.editGoodIndex = -1
      this.editGoodName = ''
      this.editIntro = ''
    },
    addPromotionSkus(skus) {
      const filteredSkus = skus.filter(sku => this.comboInfo.list.findIndex(item => item.mpu === sku.mpu) < 0)
      if (filteredSkus.length > 0) {
        if (this.currentSideSkuData.length + filteredSkus.length <= this.maxSideSkuNum) {
          const sideSkus = filteredSkus.map(sku => ({ ...sku, side: this.editSide }))
          this.$store.commit('aggregations/SET_PROMOTION_LIST', this.comboInfo.list.concat(sideSkus))
        } else {
          this.$message.warning(`活动商品最多添加${this.maxSideSkuNum}个，请仔细选择商品！`)
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
    onGoodsImportConfirmed(skus) {
      this.dialogImportVisible = false
      this.addPromotionSkus(skus)
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    }
  }
}
</script>

<style scoped>
  .show-border {
    border: 1px solid #eee;
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

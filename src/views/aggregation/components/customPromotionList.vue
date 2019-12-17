<template>
  <div class="show-border">
    <div>
      <promotion-floor
        v-for="(_, index) in promotionList"
        :key="'promotion-' + index"
        :index="index"
        @deletePromotion="onDeletePromotion"
        @sortContent="onContentSort"
        @changeContent="onContentChanged"
        @deleteSelection="onDeleteSelection"
      />
    </div>
    <div class="header-ops-container">
      <span style="margin-right: 10px">最多可以添加{{ maxFloorLength }}个</span>
      <el-button
        :disabled="promotionList.length >= maxFloorLength || titlePromotionDailySchedule > 0"
        type="primary"
        @click="dialogPromotionVisible = true"
      >
        添加活动
      </el-button>
    </div>
    <el-form v-if="showTitle" label-position="right" label-width="160px">
      <el-form-item label="文字位置">
        <el-radio-group v-model="titleTextAlign">
          <el-radio label="left">居左</el-radio>
          <el-radio label="center">居中</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="活动标题">
        <el-input v-model="titleTextValue" />
      </el-form-item>
      <el-form-item label="活动类型">
        <el-radio-group v-model="titlePromotionDailySchedule" @change="handleChangeType">
          <el-radio :label="0">普通活动</el-radio>
          <el-radio :label="1">全天分时段</el-radio>
        </el-radio-group>
        <div>
          <i v-if="titlePromotionDailySchedule > 0" class="el-icon-warning-outline">
            无需添加促销活动，将根据当天日期自动选择进行中的分时段促销活动。
          </i>
          <i v-else class="el-icon-warning-outline">
            可添加多个促销活动，优先显示进行中的活动，以结束时间为序；未开始的活动，以开始时间为序。
          </i>
        </div>
      </el-form-item>
      <el-form-item v-if="titleTextAlign === 'left'" label="开启文字链接">
        <el-switch v-model="titleHasTextLink" />
        <span style="margin-left: 10px"><i class="el-icon-warning-outline">位于活动标题最右侧</i></span>
      </el-form-item>
      <el-form-item
        v-if="titleTextAlign === 'left' && titleHasTextLink"
        label="文件链接标题"
      >
        <el-input v-model.trim="titleTextLinkValue" maxlength="10" />
      </el-form-item>
      <el-form-item label="开启活动图片">
        <el-switch v-model="titleHasImage" />
        <span style="margin-left: 10px"><i class="el-icon-warning-outline">位于活动标题下方</i></span>
      </el-form-item>
      <el-form-item v-if="titleHasImage" label="活动图片">
        <image-upload
          :image-url="titleImageUrl"
          path-name="aggregations"
          image-width="200px"
          tip="请选择对应的类别图标文件，文件格式为JPEG或PNG"
          @success="handleUploadImageSuccess"
        />
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
    <promotion-selection
      :dialog-visible="dialogPromotionVisible"
      :app-id="pageAppId"
      @onSelectionCancelled="dialogPromotionVisible = false"
      @onSelectionConfirmed="onPromotionSelectionConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { promotionListType, promotionSettings } from './templateType'
import ImageUpload from '@/components/ImageUpload'
import PromotionSelection from './promotionSelection'
import PromotionFloor from './promotionFloor'

export default {
  name: 'CustomPromotionList',
  components: { ImageUpload, PromotionFloor, PromotionSelection },
  data() {
    return {
      maxFloorLength: 7,
      dialogPromotionVisible: false
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
    promotionData: function() {
      if (this.pageTemplateList[this.currentTemplateIndex].type === promotionListType) {
        return this.pageTemplateList[this.currentTemplateIndex].data
      } else {
        return {
          list: [],
          settings: { ...promotionSettings }
        }
      }
    },
    promotionList: function() {
      return this.promotionData.list
    },
    showTitle: {
      get() {
        return this.promotionData.settings.title.show
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { show: newValue })
        this.changeTitle(title)
      }
    },
    titleTextAlign: {
      get() {
        return this.promotionData.settings.title.textAlign
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { textAlign: newValue })
        this.changeTitle(title)
      }
    },
    titleTextValue: {
      get() {
        return this.promotionData.settings.title.textValue
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { textValue: newValue })
        this.changeTitle(title)
      }
    },
    titleHasTextLink: {
      get() {
        return this.promotionData.settings.title.hasTextLink
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { hasTextLink: newValue })
        this.changeTitle(title)
      }
    },
    titleTextLinkValue: {
      get() {
        return this.promotionData.settings.title.textLinkValue
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { textLinkValue: newValue })
        this.changeTitle(title)
      }
    },
    titlePromotionDailySchedule: {
      get() {
        return this.promotionData.settings.title.promotionDailySchedule ? 1 : 0
      },
      set(newValue) {
        const newTitle = { promotionDailySchedule: newValue === 1 }
        const title = Object.assign({}, this.promotionData.settings.title, newTitle)
        this.changeTitle(title)
      }
    },
    titleHasImage: {
      get() {
        return this.promotionData.settings.title.hasImage
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { hasImage: newValue })
        this.changeTitle(title)
      }
    },
    titleImageUrl: {
      get() {
        return this.promotionData.settings.title.imageUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { imageUrl: newValue })
        this.changeTitle(title)
      }
    },
    marginBottom: {
      get() {
        return this.promotionData.settings.marginBottom
      },
      set(newValue) {
        const settings = Object.assign({}, this.promotionData.settings, { marginBottom: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    }
  },
  methods: {
    changeTitle(title) {
      const settings = Object.assign({}, this.promotionData.settings, { title: title })
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
    },
    handleUploadImageSuccess(url) {
      this.titleImageUrl = url
    },
    handleChangeType(value) {
      if (value === 1 && this.promotionList.length > 0) {
        this.$confirm('切换到全天分时段活动，将会清空已添加的活动，是否继续？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$store.commit('aggregations/CLEAR_ITEMS_IN_CONTENT')
        }).catch(() => {
          this.titlePromotionDailySchedule = 0
        })
      }
    },
    onPromotionSelectionConfirmed(promotion) {
      this.dialogPromotionVisible = false
      const index = this.promotionList.findIndex(item => item.promotionId === promotion.id)
      if (index < 0) {
        const params = {
          promotionId: promotion.id,
          promotionName: promotion.name,
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          skus: []
        }
        this.$store.commit('aggregations/SET_LIST_IN_CONTENT', { index: -1, value: params })
      } else {
        this.$message.warning('此促销活动已添加！')
      }
    },
    onDeletePromotion(index) {
      this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
    },
    onContentChanged(index, skus) {
      const promotion = this.promotionList[index]
      const params = {
        promotionId: promotion.promotionId,
        promotionName: promotion.promotionName,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        skus: skus
      }
      this.$store.commit('aggregations/SET_LIST_IN_CONTENT', { index, value: params })
    },
    onContentSort(index, params) {
      const skuIndex = params.index
      const promotion = this.promotionList[index]
      const selected = promotion.skus[skuIndex]
      const up = params.up
      const value = {
        promotionId: promotion.promotionId,
        promotionName: promotion.promotionName,
        startDate: promotion.startDate,
        endDate: promotion.endDate
      }
      value.skus = promotion.skus.filter(sku => sku.mpu !== selected.mpu)
      const newSkuIndex = up ? (skuIndex - params.distance) : (skuIndex + params.distance)
      value.skus.splice(newSkuIndex, 0, selected)
      this.$store.commit('aggregations/SET_LIST_IN_CONTENT', { index, value })
    },
    onDeleteSelection(index, selection) {
      const promotion = this.promotionList[index]
      const value = {
        promotionId: promotion.promotionId,
        promotionName: promotion.promotionName,
        startDate: promotion.startDate,
        endDate: promotion.endDate
      }
      value.skus = promotion.skus.filter(sku => !selection.includes(sku.mpu))
      this.$store.commit('aggregations/SET_LIST_IN_CONTENT', { index, value })
    }
  }
}
</script>

<style scoped>
  .show-border {
    border: 1px solid #eee;
  }

  .header-ops-container {
    padding-right: 20px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
</style>

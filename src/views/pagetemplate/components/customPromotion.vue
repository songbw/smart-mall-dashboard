<template>
  <div style="width: 100%">
    <el-container class="show-border">
      <el-form label-width="120px">
        <el-form-item :label="$t('aggregation_customization_grid_header_title')">
          <el-switch v-model="showTitle" />
          <el-form v-if="showTitle" label-position="right" label-width="160px">
            <el-form-item :label="$t('aggregation_customization_grid_header_align')">
              <el-radio-group v-model="titleTextAlign">
                <el-radio label="left">{{ $t('aggregation_customization_grid_header_align_left') }}</el-radio>
                <el-radio label="center">{{ $t('aggregation_customization_grid_header_align_center') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item :label="$t('aggregation_customization_grid_header_value')" required>
              <el-input v-model="titleTextValue" />
            </el-form-item>
            <el-form-item label="链接促销活动">
              <el-switch v-model="titleHasPromotionActivity" />
              <el-button v-if="titleHasPromotionActivity" type="primary" size="small"
                         @click="dialogPromotionVisible = true">
                选择促销活动
              </el-button>
              <div>活动名称： {{ titlePromotionActivityName }}</div>
              <div>活动时间： {{ titlePromotionActivityStartDate }} - {{ titlePromotionActivityEndDate }}</div>
            </el-form-item>
            <el-form-item :label="$t('aggregation_customization_promotion_has_image')">
              <el-switch v-model="titleHasImage" />
            </el-form-item>
            <el-form-item v-if="titleHasImage"
                          :label="$t('aggregation_customization_promotion_image_url')">
              <img v-if="titleImageUrl" :src="titleImageUrl" width="200px">
              <el-upload
                ref="upload"
                :action="uploadUrl"
                :data="uploadData"
                :auto-upload="true"
                :limit="1"
                :show-file-list="false"
                :before-upload="handleBeforeUploadImage"
                :on-progress="handleUploadImageProgress"
                :on-success="handleUploadImageSuccess"
                :on-error="handleUploadImageError"
                list-type="picture"
                name="file"
              >
                <el-button slot="trigger" size="small" type="primary">
                  {{ $t('category_button_select_title') }}
                </el-button>
                <div slot="tip" class="el-upload__tip">建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片</div>
              </el-upload>
            </el-form-item>
            <el-form-item v-if="titleHasImage"
                          :label="$t('aggregation_customization_promotion_target_url')">
              <image-target-link :target-index="currentTemplateIndex"
                                 :target-type="titleImageTargetType"
                                 :target-url="titleImageTargetUrl"
                                 :target-name="titleImageTargetName"
                                 @targetChanges="handleImageTargetChanges" />
            </el-form-item>
          </el-form>
        </el-form-item>
        <el-form-item :label="$t('aggregation_customization_banner_margin_title')">
          <el-select v-model="marginBottom">
            <el-option label="0px" value="0" />
            <el-option label="10px" value="10" />
            <el-option label="20px" value="20" />
            <el-option label="30px" value="30" />
            <el-option label="40px" value="40" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-container>
    <div class="header-container">
      <div class="header-ops-container">
        <el-button v-if="titleHasPromotionActivity === false" size="mini" @click="dialogImportVisible = true">
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
      max-height="450"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55" />
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
            <el-button icon="el-icon-delete" type="danger" size="mini" circle @click="handleDeleteRow(scope.$index)" />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <goods-selection :dialog-visible="dialogSelectionVisible"
                     :promotion-id="titlePromotionActivityId"
                     @onSelectionCancelled="onGoodsSelectionCancelled"
                     @onSelectionConfirmed="onGoodsSelectionConfirmed" />
    <goods-import :dialog-visible="dialogImportVisible"
                  @onSelectionCancelled="onGoodsImportCancelled"
                  @onSelectionConfirmed="onGoodsImportConfirmed" />
    <promotion-selection :dialog-visible="dialogPromotionVisible"
                         @onSelectionCancelled="onPromotionSelectionCancelled"
                         @onSelectionConfirmed="onPromotionSelectionConfirmed" />
    <el-dialog :visible.sync="uploadDialogVisible"
               :close-on-click-modal="false"
               :show-close="false"
               :title="$t('dialog_upload_image_title')"
               width="20%"
               center>
      <div style="display: flex;justify-content: center">
        <el-progress :percentage="uploadPercentage" type="circle" status="success" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { promotionType } from '@/utils/templateType'
  import GoodsSelection from '@/components/Goods/goodsSelectionDialog'
  import GoodsImport from '@/components/Goods/goodsImportDialog'
  import PromotionSelection from './promotionSelection'
  import ImageTargetLink from './imageTargetLink'

  export default {
    name: 'CustomPromotion',
    components: { GoodsSelection, GoodsImport, ImageTargetLink, PromotionSelection },
    data() {
      return {
        uploadUrl: process.env.VUE_APP_UPLOAD_URL,
        uploadData: {
          pathName: 'aggregations'
        },
        dialogImportVisible: false,
        uploadDialogVisible: false,
        dialogPromotionVisible: false,
        uploadPercentage: 0,
        dialogSelectionVisible: false,
        selectedItems: [],
        originalImageProp: null
      }
    },
    computed: {
      ...mapGetters({
        pageTemplateList: 'currentAggregationContent',
        currentTemplateIndex: 'currentAggregationContentIndex'
      }),
      skuData: {
        get() {
          return this.promotionData.list
        }
      },
      promotionData: function () {
        if (this.pageTemplateList[this.currentTemplateIndex].type === promotionType) {
          return this.pageTemplateList[this.currentTemplateIndex].data
        } else {
          return {
            list: [],
            settings: {
              title: {
                show: false,
                textAlign: 'left',
                textValue: '',
                hasPromotionActivity: false,
                promotionActivityId: -1,
                promotionActivityName: '',
                promotionActivityStartDate: '',
                promotionActivityEndDate: '',
                hasImage: false,
                imageUrl: '',
                targetType: '',
                targetUrl: '',
                targetName: ''
              },
              marginBottom: '0'
            }
          }
        }
      },
      goodsList: {
        get() {
          return this.promotionData.list
        }
      },
      titleForm: {
        get() {
          return {
            title: this.promotionData.settings.title
          }
        }
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
      titleHasPromotionActivity: {
        get() {
          return this.promotionData.settings.title.hasPromotionActivity
        },
        set(newValue) {
          const newTitle = { hasPromotionActivity: newValue }
          if (this.originalImageProp === null) {
            const hasPromotionActivity =
              this.promotionData.settings.title.hasPromotionActivity
                ? this.promotionData.settings.title.hasPromotionActivity : false
            this.originalImageProp = {
              hasPromotionActivity: hasPromotionActivity,
              imageTargetType: this.promotionData.settings.title.targetType,
              imageTargetName: this.promotionData.settings.title.targetName,
              imageTargetUrl: this.promotionData.settings.title.targetUrl
            }
          }
          if (newValue) {
            newTitle.targetType = 'promotion'
          } else if (newValue === false && this.titleImageTargetType === 'promotion') {
            newTitle.promotionActivityId = -1
            if (this.originalImageProp && this.originalImageProp.hasPromotionActivity === false) {
              newTitle.targetType = this.originalImageProp.imageTargetType
              newTitle.targetUrl = this.originalImageProp.imageTargetUrl
              newTitle.targetName = this.originalImageProp.imageTargetName
            } else {
              newTitle.targetType = 'aggregation'
              newTitle.targetUrl = ''
              newTitle.targetName = ''
            }
          }
          const title = Object.assign({}, this.promotionData.settings.title, newTitle)
          this.changeTitle(title)
        }
      },
      titlePromotionActivityId: {
        get() {
          if (this.titleHasPromotionActivity) {
            return this.promotionData.settings.title.promotionActivityId
          } else {
            return -1
          }
        },
        set(newValue) {
          const title = Object.assign({}, this.promotionData.settings.title, { promotionActivityId: newValue })
          this.changeTitle(title)
        }
      },
      titlePromotionActivityName: {
        get() {
          return this.promotionData.settings.title.promotionActivityName
        },
        set(newValue) {
          const title = Object.assign({}, this.promotionData.settings.title, { promotionActivityName: newValue })
          this.changeTitle(title)
        }
      },
      titlePromotionActivityStartDate: {
        get() {
          return this.promotionData.settings.title.promotionActivityStartDate
        },
        set(newValue) {
          const title = Object.assign({}, this.promotionData.settings.title, { promotionActivityStartDate: newValue })
          this.changeTitle(title)
        }
      },
      titlePromotionActivityEndDate: {
        get() {
          return this.promotionData.settings.title.promotionActivityEndDate
        },
        set(newValue) {
          const title = Object.assign({}, this.promotionData.settings.title, { promotionActivityEndDate: newValue })
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
      titleImageTargetType: {
        get() {
          return this.promotionData.settings.title.targetType
        },
        set(newValue) {
          const title = Object.assign({}, this.promotionData.settings.title, { targetType: newValue })
          this.changeTitle(title)
        }
      },
      titleImageTargetUrl: {
        get() {
          return this.promotionData.settings.title.targetUrl
        },
        set(newValue) {
          const title = Object.assign({}, this.promotionData.settings.title, { targetUrl: newValue })
          this.changeTitle(title)
        }
      },
      titleImageTargetName: {
        get() {
          return this.promotionData.settings.title.targetName
        },
        set(newValue) {
          const title = Object.assign({}, this.promotionData.settings.title, { targetName: newValue })
          this.changeTitle(title)
        }
      },
      marginBottom: {
        get() {
          return this.promotionData.settings.marginBottom
        },
        set(newValue) {
          const settings = Object.assign({}, this.promotionData.settings, { marginBottom: newValue })
          this.$store.commit('setTemplateGridSettings', settings)
        }
      }
    },
    methods: {
      toTimeString(num) {
        if (num < 10) {
          return '0' + num.toString()
        } else {
          return num.toString()
        }
      },
      changeTitle(title) {
        const settings = Object.assign({}, this.promotionData.settings, { title: title })
        this.$store.commit('setTemplatePromotionSettings', settings)
      },
      handleBeforeUploadImage(file) {
        this.uploadDialogVisible = true
        this.uploadPercentage = 0
      },
      handleUploadImageProgress(event) {
        this.uploadPercentage = event.percent
      },
      handleUploadImageSuccess(res) {
        this.uploadDialogVisible = false
        this.titleImageUrl = this.$store.getters.cosUrl + res.data.url
        this.$refs.upload.clearFiles()
      },
      handleUploadImageError(res) {
        this.uploadDialogVisible = false
        this.titleImageUrl = null
        this.$refs.upload.clearFiles()
      },
      handleSelectionChange(val) {
        if (val.length > 0) {
          this.selectedItems = val.map(item =>
            this.skuData.indexOf(item))
          this.selectedItems.sort((a, b) => b - a)
        } else {
          this.selectedItems = []
        }
      },
      handleDeleteSelection() {
        if (this.selectedItems.length > 0) {
          this.selectedItems.forEach(this.handleDeleteRow)
          this.$refs.skuTable.clearSelection()
        }
      },
      handleDeleteRow(index) {
        this.$store.commit('deleteItemInTemplateContent', index)
      },
      handleSortRow(up, index) {
        if ((up && index > 0) || (!up && index < (this.skuData.length - 1))) {
          this.$store.commit('sortItemInTemplateContent', { up: up, index: index })
        }
      },
      handleSortTop(index) {
        if (index > 0) {
          this.$store.commit('sortItemInTemplateContent', { up: true, index: index, distance: index })
        }
      },
      onGoodsSelectionConfirmed(skus) {
        this.dialogSelectionVisible = false
        this.$store.commit('changeTemplatePromotionListContent', skus)
      },
      onGoodsSelectionCancelled() {
        this.dialogSelectionVisible = false
      },
      handleImageTargetChanges(target) {
        if (this.titleHasPromotionActivity) {
          return
        }
        if (target.hasOwnProperty('type')) {
          this.titleImageTargetType = target.type
        }
        if (target.hasOwnProperty('name')) {
          this.titleImageTargetName = target.name
        }
        if (target.hasOwnProperty('url')) {
          this.titleImageTargetUrl = target.url
        }
      },
      onGoodsImportConfirmed(skus) {
        this.dialogImportVisible = false
        this.$store.commit('changeTemplatePromotionListContent', skus)
      },
      onGoodsImportCancelled() {
        this.dialogImportVisible = false
      },
      onPromotionSelectionConfirmed(promotion) {
        this.dialogPromotionVisible = false
        this.titlePromotionActivityId = promotion.id
        this.titlePromotionActivityName = promotion.name
        this.titlePromotionActivityStartDate = promotion.startDate
        this.titlePromotionActivityEndDate = promotion.endDate
        this.titleImageTargetType = 'promotion'
        this.titleImageTargetUrl = 'route://promotion/' + promotion.id
        this.titleImageTargetName = promotion.name
      },
      onPromotionSelectionCancelled() {
        this.dialogPromotionVisible = false
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

<template>
  <div style="width: 100%">
    <el-container class="show-border">
      <el-form v-if="showTitle" label-position="right" label-width="160px">
        <el-form-item label="文字位置">
          <el-radio-group v-model="titleTextAlign">
            <el-radio label="left">居左</el-radio>
            <el-radio label="center">居中</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="titleTextValue" />
        </el-form-item>
        <el-form-item label="促销活动">
          <el-button
            v-if="titleHasPromotionActivity"
            :disabled="titlePromotionDailySchedule"
            type="primary"
            size="small"
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
        <el-form-item v-if="titleTextAlign === 'left'" label="开启文字链接">
          <el-switch v-model="titleHasTextLink" />
        </el-form-item>
        <el-form-item
          v-if="titleTextAlign === 'left' && titleHasTextLink"
          label="文件链接标题"
        >
          <el-input v-model="titleTextLinkValue" />
        </el-form-item>
        <el-form-item label="开启活动图片">
          <el-switch v-model="titleHasImage" />
        </el-form-item>
        <el-form-item
          v-if="titleHasImage"
          label="活动图片"
        >
          <img v-if="titleImageUrl" :src="titleImageUrl" width="200px" alt="">
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
            accept="image/png, image/jpeg"
            list-type="picture"
            name="file"
          >
            <el-button slot="trigger" size="small" type="primary">
              选择图标文件
            </el-button>
            <div slot="tip" class="el-upload__tip">建议上传宽度为1095px,高度687px，不超过500k，格式为jpg/png的图片</div>
          </el-upload>
        </el-form-item>
        <el-form-item
          v-if="titleHasLink"
          label="文字和图片链接地址"
        >
          <image-target-link
            :could-change="titleHasPromotionActivity === false"
            :target-index="currentTemplateIndex"
            :target-type="titleTargetType"
            :target-url="titleTargetUrl"
            :target-name="titleTargetName"
            @targetChanges="handleImageTargetChanges"
          />
        </el-form-item>
        <el-form-item label="下边距">
          <el-select :value="marginBottom" @change="onMarginBottomChanged">
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
          导入商品
        </el-button>
        <el-button
          :disabled="titlePromotionDailySchedule || titlePromotionActivityId < 0"
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
      <el-table-column label="商品价格(元)" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.price }}</span>
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
    <promotion-selection
      :dialog-visible="dialogPromotionVisible"
      @onSelectionCancelled="onPromotionSelectionCancelled"
      @onSelectionConfirmed="onPromotionSelectionConfirmed"
    />
    <el-dialog
      :visible.sync="uploadDialogVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      title="正在上传图片"
      width="20%"
      center
    >
      <div style="display: flex;justify-content: center">
        <el-progress :percentage="uploadPercentage" type="circle" status="success" />
      </div>
    </el-dialog>
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
import { promotionType, promotionSettings } from './templateType'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import PromotionSelection from './promotionSelection'
import ImageTargetLink from './imageTargetLink'
import { app_upload_url } from '@/utils/constants'

export default {
  name: 'CustomPromotion',
  components: { GoodsSelectionDialog, GoodsImportDialog, ImageTargetLink, PromotionSelection },
  filters: {
    dateFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      uploadUrl: app_upload_url,
      uploadData: {
        pathName: 'aggregations'
      },
      maxSkuNum: 20,
      dialogImportVisible: false,
      uploadDialogVisible: false,
      dialogPromotionVisible: false,
      uploadPercentage: 0,
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
    skuData: {
      get() {
        return this.promotionData.list
      }
    },
    promotionData: function() {
      if (this.pageTemplateList[this.currentTemplateIndex].type === promotionType) {
        return this.pageTemplateList[this.currentTemplateIndex].data
      } else {
        return {
          list: [],
          settings: { ...promotionSettings }
        }
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
          const promotionId = this.promotionData.settings.title.promotionActivityId
          if (promotionId >= 0) {
            newTitle.targetName = this.titlePromotionActivityName
            newTitle.targetUrl = 'route://promotion/' + promotionId
          }
        } else if (newValue === false && this.titleTargetType === 'promotion') {
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
    titlePromotionDailySchedule: {
      get() {
        return this.titleHasPromotionActivity ? this.promotionData.settings.title.promotionDailySchedule : false
      },
      set(newValue) {
        const newTitle = { promotionDailySchedule: newValue }
        if (newValue) {
          newTitle.promotionActivityId = -1
          newTitle.promotionActivityName = ''
          newTitle.promotionActivityStartDate = ''
          newTitle.promotionActivityEndDate = ''
          this.$store.commit('aggregations/SET_PROMOTION_LIST', [])
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
    titleHasLink: {
      get() {
        return this.titleHasPromotionActivity ? false : this.titleHasImage || this.titleHasTextLink
      }
    },
    titleTargetType: {
      get() {
        return this.promotionData.settings.title.targetType
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { targetType: newValue })
        this.changeTitle(title)
      }
    },
    titleTargetUrl: {
      get() {
        return this.promotionData.settings.title.targetUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.promotionData.settings.title, { targetUrl: newValue })
        this.changeTitle(title)
      }
    },
    titleTargetName: {
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
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
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
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
    },
    handleBeforeUploadImage(file) {
      const maxSize = 1024 * 1024
      if (file.size > maxSize) {
        this.$message.warning('上传的图片大小超过1M，请裁剪或者优化图片，重新上传！')
        return false
      }
      const imageTypes = ['image/png', 'image/jpeg', 'image/jpg']
      if (imageTypes.includes(file.type) === false) {
        this.$message.warning('请选择正确的文件类型！')
        return false
      }
      this.uploadDialogVisible = true
      this.uploadPercentage = 0
      return true
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
        this.selectedItems = val.map(item => {
          if ('mpu' in item) {
            return this.skuData.findIndex(sku => sku.mpu === item.mpu)
          } else {
            return this.skuData.findIndex(sku => sku.skuid === item.skuid)
          }
        })
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
          const skus = this.skuData.filter((good, index) => !this.selectedItems.includes(index))
          this.$store.commit('aggregations/SET_PROMOTION_LIST', skus)
          this.$refs.skuTable.clearSelection()
        } catch (e) {
          console.warn('Aggregation delete promotion selection error: ' + e)
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
        this.$store.commit('aggregations/DELETE_ITEM_IN_CONTENT', index)
      } catch (e) {
        console.warn('Aggregation delete promotion good error: ' + e)
      }
    },
    handleSortRow(up, index) {
      if ((up && index > 0) || (!up && index < (this.skuData.length - 1))) {
        this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: up, index: index })
      }
    },
    handleSortTop(index) {
      if (index > 0) {
        this.$store.commit('aggregations/SORT_ITEM_IN_CONTENT', { up: true, index: index, distance: index })
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
        this.$store.commit('aggregations/SET_PROMOTION_LIST_CONTENT', {
          index: this.editGoodIndex,
          intro: this.editIntro
        })
      }
      this.editGoodIndex = -1
      this.editGoodName = ''
      this.editIntro = ''
    },
    addPromotionSkus(skus) {
      const filteredSkus = skus.filter(sku => this.skuData.findIndex(item => item.mpu === sku.mpu) < 0)
      if (filteredSkus.length > 0) {
        if (this.skuData.length + filteredSkus.length <= this.maxSkuNum) {
          this.$store.commit('aggregations/SET_PROMOTION_LIST', this.skuData.concat(filteredSkus))
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
    onGoodsImportConfirmed(skus) {
      this.dialogImportVisible = false
      this.addPromotionSkus(skus)
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    },
    onPromotionSelectionConfirmed(promotion) {
      this.dialogPromotionVisible = false
      if (this.titlePromotionActivityId !== promotion.id) {
        this.titlePromotionActivityId = promotion.id
        this.titlePromotionActivityName = promotion.name
        this.titlePromotionActivityStartDate = promotion.startDate
        this.titlePromotionActivityEndDate = promotion.endDate
        this.titleTargetType = 'promotion'
        this.titleTargetUrl = 'route://promotion/' + promotion.id
        this.titleTargetName = promotion.name
        this.$store.commit('aggregations/SET_PROMOTION_LIST', [])
      }
    },
    onPromotionSelectionCancelled() {
      this.dialogPromotionVisible = false
    },
    onMarginBottomChanged(value) {
      this.marginBottom = value
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

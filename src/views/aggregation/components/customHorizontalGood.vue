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
        <el-form-item v-if="titleTextAlign === 'left'" label="右侧文字链接">
          <el-switch v-model="titleHasTextLink" />
        </el-form-item>
        <el-form-item
          v-if="titleTextAlign === 'left' && titleHasTextLink"
          label="右侧文字标题"
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
          <image-upload
            :image-url="titleImageUrl"
            path-name="aggregations"
            image-width="200px"
            tip="请选择对应的活动图片，文件格式为JPEG或PNG"
            @success="handleUploadImageSuccess"
          />
        </el-form-item>
        <el-form-item
          v-if="titleHasLink"
          label="链接地址"
        >
          <image-target-link
            :target-index="currentTemplateIndex"
            :target-type="titleTargetType"
            :target-url="titleTargetUrl"
            :target-name="titleTargetName"
            :app-id="pageAppId"
            @targetChanges="handleImageTargetChanges"
          />
        </el-form-item>
        <el-form-item label="两侧边距">
          <el-input-number v-model="marginX" :min="0" :max="40" step-strictly />
          <span>px</span>
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
        <el-form-item label="商品背景颜色">
          <el-color-picker v-model="skuBackgroundColor" />
          <span>{{ skuBackgroundColor }}</span>
        </el-form-item>
        <el-form-item label="热销商品">
          <el-switch v-model="bestSelling" />
        </el-form-item>
      </el-form>
    </el-container>
    <div class="header-container">
      <div class="header-ops-container">
        <el-button type="primary" size="mini" @click="onGoodsSelectionClicked">
          添加商品
        </el-button>
        <el-button size="mini" type="info" @click="dialogImportVisible = true">
          导入商品
        </el-button>
        <el-button size="mini" @click="handleExportGoods">
          导出商品
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
      <el-table-column v-if="bestSelling" label="热销排名" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.ranking }}</span>
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
import moment from 'moment'
import { horizontalGoodSettings, horizontalGoodType } from './templateType'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import ImageUpload from '@/components/ImageUpload'
import ImageTargetLink from './imageTargetLink'
import BestSellingSelectionDialog from '@/components/BestSellingSelectionDialog/index'

export default {
  name: 'CustomHorizontalGood',
  components: { BestSellingSelectionDialog, GoodsSelectionDialog, GoodsImportDialog, ImageTargetLink, ImageUpload },
  filters: {
    dateFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    }
  },
  data() {
    return {
      maxSkuNum: 16,
      dialogImportVisible: false,
      dialogSelectionVisible: false,
      bestSellingSelectionVisible: false,
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
      pageInfo: 'currentAggregation',
      pageTemplateList: 'currentAggregationContent',
      currentTemplateIndex: 'currentAggregationContentIndex'
    }),
    pageAppId() {
      return this.pageInfo.appId
    },
    skuData: {
      get() {
        return this.horizontalGoodData.list
      }
    },
    horizontalGoodData: function () {
      if (this.pageTemplateList[this.currentTemplateIndex].type === horizontalGoodType) {
        return this.pageTemplateList[this.currentTemplateIndex].data
      } else {
        return {
          list: [],
          settings: { ...horizontalGoodSettings }
        }
      }
    },
    titleForm: {
      get() {
        return {
          title: this.horizontalGoodData.settings.title
        }
      }
    },
    showTitle: {
      get() {
        return this.horizontalGoodData.settings.title.show
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { show: newValue })
        this.changeTitle(title)
      }
    },
    titleTextAlign: {
      get() {
        return this.horizontalGoodData.settings.title.textAlign
      },
      set(newValue) {
        const netTitle = { textAlign: newValue }
        if (newValue === 'center') {
          netTitle.hasTextLink = false
        }
        const title = Object.assign({}, this.horizontalGoodData.settings.title, netTitle)
        this.changeTitle(title)
      }
    },
    titleTextValue: {
      get() {
        return this.horizontalGoodData.settings.title.textValue
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { textValue: newValue })
        this.changeTitle(title)
      }
    },
    titleHasTextLink: {
      get() {
        return this.horizontalGoodData.settings.title.hasTextLink
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { hasTextLink: newValue })
        this.changeTitle(title)
      }
    },
    titleTextLinkValue: {
      get() {
        return this.horizontalGoodData.settings.title.textLinkValue
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { textLinkValue: newValue })
        this.changeTitle(title)
      }
    },
    titleHasImage: {
      get() {
        return this.horizontalGoodData.settings.title.hasImage
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { hasImage: newValue })
        this.changeTitle(title)
      }
    },
    titleImageUrl: {
      get() {
        return this.horizontalGoodData.settings.title.imageUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { imageUrl: newValue })
        this.changeTitle(title)
      }
    },
    titleHasLink: {
      get() {
        return this.titleHasImage || this.titleHasTextLink
      }
    },
    titleTargetType: {
      get() {
        return this.horizontalGoodData.settings.title.targetType
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { targetType: newValue })
        this.changeTitle(title)
      }
    },
    titleTargetUrl: {
      get() {
        return this.horizontalGoodData.settings.title.targetUrl
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { targetUrl: newValue })
        this.changeTitle(title)
      }
    },
    titleTargetName: {
      get() {
        return this.horizontalGoodData.settings.title.targetName
      },
      set(newValue) {
        const title = Object.assign({}, this.horizontalGoodData.settings.title, { targetName: newValue })
        this.changeTitle(title)
      }
    },
    marginX: {
      get() {
        return this.horizontalGoodData.settings.marginX
      },
      set(newValue) {
        const settings = Object.assign({}, this.horizontalGoodData.settings, { marginX: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    marginBottom: {
      get() {
        return this.horizontalGoodData.settings.marginBottom
      },
      set(newValue) {
        const settings = Object.assign({}, this.horizontalGoodData.settings, { marginBottom: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    skuBackgroundColor: {
      get() {
        return this.horizontalGoodData.settings.skuBackgroundColor
      },
      set(newValue) {
        const settings = Object.assign({}, this.horizontalGoodData.settings, { skuBackgroundColor: newValue })
        this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
      }
    },
    bestSelling: {
      get() {
        return this.horizontalGoodData.settings.bestSelling
      },
      set(newValue) {
        const settings = Object.assign({}, this.horizontalGoodData.settings, { bestSelling: newValue })
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
      const settings = Object.assign({}, this.horizontalGoodData.settings, { title: title })
      this.$store.commit('aggregations/SET_CONTENT_SETTINGS', settings)
    },
    handleUploadImageSuccess(url) {
      this.titleImageUrl = url
    },
    handleSelectionChange(val) {
      if (val.length > 0) {
        this.selectedItems = val.map(item => this.skuData.findIndex(sku => sku.mpu === item.mpu))
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
          console.warn('Aggregation delete horizontal good selection error: ' + e)
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
        console.warn('Aggregation delete horizontal good error: ' + e)
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
    addGoodSkus(skus) {
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
      this.bestSellingSelectionVisible = false
      this.dialogSelectionVisible = false
      this.addGoodSkus(skus)
    },
    handleImageTargetChanges(target) {
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
      this.addGoodSkus(skus)
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    },
    onMarginBottomChanged(value) {
      this.marginBottom = value
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
          filename: `${this.titleTextValue}-商品列表`
        })
      })
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

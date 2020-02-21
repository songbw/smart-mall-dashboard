<template>
  <el-dialog
    :visible="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    title="商品导出"
  >
    <el-tabs v-model="exportType" type="card">
      <el-tab-pane name="common" label="按属性">
        <el-form :model="exportForm" label-width="5rem" label-position="left">
          <el-form-item label="商品类别">
            <category-selection
              :first-value="exportForm.firstCategoryValue"
              :second-value="exportForm.secondCategoryValue"
              :third-value="exportForm.thirdCategoryValue"
              :inline="false"
              @changed="handleCategorySelectionChanged"
            />
          </el-form-item>
          <el-form-item v-if="hasVendorPermission" label="供应商名">
            <vendor-selection
              :vendor-id="exportForm.merchantId"
              @changed="handleVendorChanged"
            />
          </el-form-item>
          <el-form-item label="商品状态">
            <el-select v-model="exportForm.state" clearable>
              <el-option
                v-for="item in stateOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane v-if="hasSalePricePermission" name="price" label="按价格">
        <el-form inline @submit.prevent.native="() => {}">
          <el-form-item label="底价比率">
            <el-input-number
              v-model="floorPriceRate"
              :precision="2"
              :step="0.05"
              :min="1"
              :max="10"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
    <span slot="footer">
      <el-button @click="handleDialogCancel">取消</el-button>
      <el-button type="primary" @click="handleDialogConfirm">导出</el-button>
    </span>
  </el-dialog>
</template>

<script>
import CategorySelection from '@/components/CategorySelection'
import VendorSelection from '@/components/VendorSelection'
import { ProductStateOptions } from '@/utils/constants'

export default {
  name: 'ExportDialog',
  components: {
    CategorySelection,
    VendorSelection
  },
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    hasVendorPermission: {
      type: Boolean,
      default: false
    },
    hasSalePricePermission: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      stateOptions: ProductStateOptions.filter(item => item.value >= 0),
      exportType: 'common',
      exportForm: {
        firstCategoryValue: null,
        secondCategoryValue: null,
        thirdCategoryValue: null,
        merchantId: null,
        state: null
      },
      floorPriceRate: 1.1
    }
  },
  methods: {
    handleCategorySelectionChanged(category) {
      const value = Number.isSafeInteger(category.value) ? category.value : null
      switch (category.level) {
        case 1:
          this.exportForm.firstCategoryValue = value
          this.exportForm.secondCategoryValue = null
          this.exportForm.thirdCategoryValue = null
          break
        case 2:
          this.exportForm.secondCategoryValue = value
          this.exportForm.thirdCategoryValue = null
          break
        case 3:
          this.exportForm.thirdCategoryValue = value
          break
        default:
          break
      }
    },
    handleVendorChanged(id) {
      this.exportForm.merchantId = id
    },
    resetExportForm() {
      this.exportType = 'common'
      this.exportForm.merchantId = null
      this.exportForm.firstCategoryValue = null
      this.exportForm.secondCategoryValue = null
      this.exportForm.thirdCategoryValue = null
      this.exportForm.state = null
      this.floorPriceRate = 1.1
    },
    handleDialogCancel() {
      this.resetExportForm()
      this.$emit('cancelled')
    },
    handleDialogConfirm() {
      if (this.exportType === 'price') {
        if (this.floorPriceRate > 0) {
          this.$emit('confirmed', { floorPriceRate: this.floorPriceRate })
        } else {
          this.$message.warning('请输入正确的低价比率！')
        }
      } else {
        this.$emit('confirmed', {
          merchantId: this.exportForm.merchantId,
          state: this.exportForm.state,
          categoryID: this.exportForm.thirdCategoryValue ||
            this.exportForm.secondCategoryValue ||
            this.exportForm.firstCategoryValue
        })
      }
      this.resetExportForm()
    }
  }
}
</script>

<style scoped>

</style>

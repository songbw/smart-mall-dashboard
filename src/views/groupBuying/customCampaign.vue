<template>
  <div class="app-container">
    <el-form ref="campaignForm" :model="formData" :rules="viewOnly ? {} : formRules" label-width="120px">
      <el-divider content-position="left"><span class="divider-text">基础信息</span></el-divider>
      <el-form-item label="团购活动名称" prop="name">
        <el-input v-model="formData.name" :readonly="viewOnly" style="width: 350px" />
      </el-form-item>
      <el-form-item label="活动生效日期" required>
        <div style="display: flex; justify-content: start">
          <el-form-item prop="effectiveStartDate">
            <el-date-picker type="datetime" v-model="formData.effectiveStartDate" :readonly="viewOnly"
                            placeholder="选择开始日期和时间" default-time="00:00:00"
                            value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="effectiveEndDate">
            <el-date-picker type="datetime" v-model="formData.effectiveEndDate" :readonly="viewOnly"
                            placeholder="选择结束日期和时间" default-time="23:59:59"
                            value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="活动封面图片">
        <image-upload path-name="groupBuyings" image-width="300px" :image-url="formData.imageUrl"
                      :view-only="viewOnly" @urlChanged="handleImageUrlChanged" />
      </el-form-item>
      <el-form-item label="团购活动描述" prop="description" class="form-item" style="width: 60%">
        <el-input type="textarea" resize="none" v-model="formData.description" :rows="4" :readonly="viewOnly" />
      </el-form-item>
      <el-divider content-position="left"><span class="divider-text">活动设置</span></el-divider>
      <el-form-item label="活动商品" style="width: 60%" required>
        <el-table
          :data="skuInfoList"
          style="width: 100%"
          height="150"
          empty-text="未选择团购活动商品"
          border>
          <el-table-column :label="$t('product_table_skuid_title')" align="center" width="150">
            <template slot-scope="scope">
              <span>{{ scope.row.skuid }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('product_table_name_title')" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('product_table_price_title')" align="center" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.price }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-button v-if="!viewOnly" type="primary"
                   @click="dialogSelectionVisible = true">
          选择活动商品
        </el-button>
      </el-form-item>
      <el-form-item label="活动商品数量">
        <span v-if="viewOnly">{{ formData.groupBuyingQuantity }}</span>
        <el-input-number v-else v-model="formData.groupBuyingQuantity" :min="0" />
        <span style="margin-left: 10px">当为0时表示数量不限制</span>
      </el-form-item>
    </el-form>
    <goods-selection :dialog-visible="dialogSelectionVisible"
                     @onSelectionCancelled="onGoodsSelectionCancelled"
                     @onSelectionConfirmed="onGoodsSelectionConfirmed" />
  </div>
</template>

<script>
  import ImageUpload from '@/components/Goods/ImageUpload'
  import GoodsSelection from '@/components/Goods/goodsSelectionDialog'

  export default {
    name: 'CustomCampaign',
    components: { ImageUpload, GoodsSelection },
    data() {
      return {
        viewOnly: true,
        dialogSelectionVisible: false,
        skuInfoList: [],
        formData: {
          name: '',
          effectiveStartDate: null,
          effectiveEndDate: null,
          imageUrl: null,
          description: '',
          skuid: null,
          groupBuyingQuantity: 0
        },
        formRules: {}
      }
    },
    methods: {
      handleImageUrlChanged(url) {
        this.formData.imageUrl = url
      },
      onGoodsSelectionConfirmed(skus) {
        this.dialogSelectionVisible = false
        if (skus.length > 0) {
          this.formData.skuid = skus[0].skuid
        }
      },
      onGoodsSelectionCancelled() {
        this.dialogSelectionVisible = false
      },
    }
  }
</script>

<style scoped>

</style>

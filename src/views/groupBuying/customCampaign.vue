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
      <el-form-item label="活动商品" style="width: 60%" prop="skuId">
        <el-table
          v-loading="skuLoading"
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
      <el-form-item label="活动商品价格" prop="groupBuyingPrice">
        <span v-if="viewOnly">{{ formData.groupBuyingPrice }}</span>
        <el-input-number v-else v-model="formData.groupBuyingPrice"
                         :min="0" :precision="2" :step="0.1" />
      </el-form-item>
      <el-form-item label="活动商品数量">
        <span v-if="viewOnly">{{ formData.groupBuyingQuantity }}</span>
        <el-input-number v-else v-model="formData.groupBuyingQuantity" :min="0" />
        <span style="margin-left: 10px">当为0时表示数量不限制</span>
      </el-form-item>
      <el-form-item label="商品购买限制">
        <span v-if="viewOnly">{{ formData.limitedPerMember }}</span>
        <el-input-number v-else v-model="formData.limitedPerMember" :min="1" />
        <span style="margin-left: 10px">活动中每人最多的购买数量</span>
      </el-form-item>
      <el-form-item label="成团人数">
        <span v-if="viewOnly">{{ formData.groupMemberQuantity }}</span>
        <el-input-number v-else v-model="formData.groupMemberQuantity" :min="2" />
        <span style="margin-left: 10px">当未达到参团人数时，用户发起的此次拼团将失败，已支付的金额将自动退回给用户</span>
      </el-form-item>
      <el-form-item label="成团时效" prop="groupBuyingExpiration">
        <span v-if="viewOnly">{{ formData.groupBuyingExpiration }}</span>
        <el-input-number v-else v-model="formData.groupBuyingExpiration" :min="0" />
        <span style="margin-left: 10px">以“分钟”为单位。开团成功后，团长发起的组团有效时间</span>
      </el-form-item>
      <el-form-item label="支付时效" prop="paymentExpiration">
        <span v-if="viewOnly">{{ formData.paymentExpiration }}</span>
        <el-input-number v-else v-model="formData.paymentExpiration" :min="0" />
        <span style="margin-left: 10px">以“分钟”为单位，超过此时间限制内不支付，参团记录自动取消</span>
      </el-form-item>
      <el-form-item>
        <el-button v-loading="inSubmitting" v-if="!viewOnly" type="primary" @click="handleSubmit">
          {{ createCampaign ? '创建' : '保存' }}
        </el-button>
        <el-button @click="handleCancel" :type="viewOnly ? 'primary' : 'default'">
          {{ viewOnly ? '确定' : '取消' }}
        </el-button>
      </el-form-item>
    </el-form>
    <goods-selection :dialog-visible="dialogSelectionVisible"
                     @onSelectionCancelled="onGoodsSelectionCancelled"
                     @onSelectionConfirmed="onGoodsSelectionConfirmed" />
  </div>
</template>

<script>
  import isEqual from 'lodash/isEqual'
  import isEmpty from 'lodash/isEmpty'
  import moment from 'moment'
  import { searchProductInfo } from '@/api/products'
  import ImageUpload from '@/components/Goods/ImageUpload'
  import GoodsSelection from '@/components/Goods/goodsSelectionDialog'

  export default {
    name: 'CustomCampaign',
    components: { ImageUpload, GoodsSelection },
    data() {
      return {
        viewOnly: true,
        createCampaign: false,
        dialogSelectionVisible: false,
        campaignId: -1,
        skuLoading: false,
        skuInfoList: [],
        inSubmitting: false,
        formData: {
          name: '',
          effectiveStartDate: null,
          effectiveEndDate: null,
          imageUrl: null,
          description: '',
          skuid: null,
          groupBuyingQuantity: 0,
          groupBuyingPrice: 0,
          limitedPerMember: 1,
          groupMemberQuantity: 2,
          groupBuyingExpiration: 0,
          paymentExpiration: 0
        },
        formRules: {
          name: [{
            required: true, trigger: 'change', validator: (rule, value, callback) => {
              if (isEmpty(value)) {
                callback(new Error('请输入有效的团购活动名称'))
              } else {
                callback()
              }
            }
          }],
          effectiveStartDate: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              if (value && this.formData.effectiveEndDate &&
                moment(value).isAfter(this.formData.effectiveEndDate)) {
                callback(new Error('开始时间必须早于结束时间'))
              } else {
                if (value) {
                  callback()
                } else {
                  callback(new Error('请选择发布的开始日期和时间'))
                }
              }
            }
          }],
          effectiveEndDate: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              const now = moment()
              if (value && this.formData.effectiveStartDate &&
                moment(value).isBefore(this.formData.effectiveStartDate)) {
                callback(new Error('结束时间必须晚于开始时间'))
              } else if (value && moment(value).isBefore(now)) {
                callback(new Error('结束时间必须晚于当前时间'))
              } else {
                if (value) {
                  callback()
                } else {
                  callback(new Error('请选择发布的结束日期和时间'))
                }
              }
            }
          }],
          skuId: [{
            required: true, trigger: 'change', validator: (rule, value, callback) => {
              if (isEmpty(this.formData.skuid)) {
                callback(new Error('请选择活动商品'))
              } else {
                callback()
              }
            }
          }],
          groupBuyingPrice: [{
            required: true, trigger: 'change', validator: (rule, value, callback) => {
              if (value > 0) {
                callback()
              } else {
                callback(new Error('请设置活动商品价格'))
              }
            }
          }],
          groupBuyingExpiration: [{
            required: true, trigger: 'change', validator: (rule, value, callback) => {
              if (value > 0) {
                callback()
              } else {
                callback(new Error('请设置活动成团时效'))
              }
            }
          }],
          paymentExpiration: [{
            required: true, trigger: 'change', validator: (rule, value, callback) => {
              if (value > 0) {
                callback()
              } else {
                callback(new Error('请设置活动支付时效'))
              }
            }
          }],
        }
      }
    },
    created() {
      if (isEqual(this.$route.name, 'CreateGroupBuying')) {
        this.createCampaign = true
        this.viewOnly = false
      } else {
        this.campaignId = this.$route.params.id
        if (this.$route.params.hasOwnProperty('readOnly')) {
          this.viewOnly = this.$route.params.readOnly
        }
        this.getCampaignData()
      }
    },
    methods: {
      getCampaignData() {
      },
      handleImageUrlChanged(url) {
        this.formData.imageUrl = url
      },
      async handleFetchSkuInfo() {
        this.skuLoading = true
        try {
          const response = await searchProductInfo({ offset: 1, limit: 10, skuid: this.formData.skuid })
          const data = response.result
          if (data.total > 0) {
            const product = data.list[0]
            const item = {
              skuid: product.skuid,
              price: product.price,
              name: product.name
            }
            this.skuInfoList.push(item)
          }
        } catch (err) {
          this.$log.warn('Campaign Goods: search error:' + this.formData.skuid)
        }
        this.skuLoading = false
      },
      onGoodsSelectionConfirmed(skus) {
        this.dialogSelectionVisible = false
        if (skus.length > 0) {
          this.formData.skuid = skus[0].skuid
          this.handleFetchSkuInfo()
        }
      },
      onGoodsSelectionCancelled() {
        this.dialogSelectionVisible = false
      },
      handleCreateCampaign() {
      },
      handleUpdateCampaign() {
      },
      createOrUpdateCampaign() {
        if (this.createCampaign) {
          this.handleCreateCampaign()
        } else {
          this.handleUpdateCampaign()
        }
      },
      async handleSubmit() {
        try {
          const valid = await this.$refs['campaignForm'].validate()
          if (valid) {
            this.createOrUpdateCampaign()
          } else {
            this.$message.warning('请检查输入错误的团购活动配置信息')
          }
        } catch (e) {
          this.$log.warn('Group buying form ' + e)
          this.$message.warning('请检查输入错误的团购活动配置信息')
        }
      },
      handleCancel() {
        this.$router.go(-1)
      }
    }
  }
</script>

<style scoped>

</style>

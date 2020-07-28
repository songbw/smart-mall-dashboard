<template>
  <div style="margin-top: 5px">
    <el-select :disabled="!couldChange" :value="displayType" @change="onTypeChanged">
      <el-option
        v-for="item in typeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
        :disabled="item.disabled"
      />
    </el-select>
    <div v-if="displayType === 'aggregation'">
      <el-button :disabled="!couldChange" type="primary" size="mini" @click="dialogAggregationVisible = true">
        选择聚合页
      </el-button>
      <aggregation-selection-dialog
        :app-id="appId"
        :dialog-visible="dialogAggregationVisible"
        @onSelectionCancelled="onAggregationSelectionCancelled"
        @onSelectionConfirmed="onAggregationSelectionConfirmed"
      />
    </div>
    <div v-else-if="displayType === 'promotion'">
      <el-button :disabled="!couldChange" type="primary" size="mini" @click="dialogPromotionVisible = true">
        选择促销活动页
      </el-button>
      <promotion-selection
        :app-id="appId"
        :dialog-visible="dialogPromotionVisible"
        @onSelectionCancelled="onPromotionSelectionCancelled"
        @onSelectionConfirmed="onPromotionSelectionConfirmed"
      />
    </div>
    <div v-else-if="displayType === 'commodity'">
      <el-button :disabled="!couldChange" type="primary" size="mini" @click="dialogSelectionVisible = true">
        选择商品
      </el-button>
      <goods-selection-dialog
        :dialog-visible="dialogSelectionVisible"
        :use-default-sku="true"
        @onSelectionCancelled="onGoodsSelectionCancelled"
        @onSelectionConfirmed="onGoodsSelectionConfirmed"
      />
    </div>
    <div v-else-if="displayType === 'external'" style="margin-top: 10px">
      <el-form v-model="externalData" :rules="externalRules">
        <el-form-item prop="url">
          <el-input v-model="displayUrl" placeholder="请输入外部链接地址" maxlength="100" clearable />
        </el-form-item>
      </el-form>
    </div>
    <div v-if="displayName" style="margin-left: 10px">
      <el-button type="text" @click="onPreviewShown">{{ displayName }}</el-button>
    </div>
    <preview-dialog
      :qr-code="qrCodeValue"
      :dialog-visible="dialogPreviewVisible"
      @closed="dialogPreviewVisible = false"
    />
  </div>
</template>

<script>
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import AggregationSelectionDialog from '@/components/AggregationSelectionDialog'
import PromotionSelection from './promotionSelection'
import PreviewDialog from './previewDialog'
import { validateURL } from '@/utils/validate'
import { PromotionPermissions } from '@/utils/role-permissions'
import { mapGetters } from 'vuex'

export default {
  name: 'ImageTargetLink',
  components: { GoodsSelectionDialog, AggregationSelectionDialog, PromotionSelection, PreviewDialog },
  props: {
    targetIndex: {
      type: Number,
      default: -1
    },
    targetType: {
      type: String,
      default: 'blank'
    },
    targetUrl: {
      type: String,
      default: ''
    },
    targetName: {
      type: String,
      default: ''
    },
    couldChange: {
      type: Boolean,
      default: true
    },
    appId: {
      type: String,
      default: null
    }
  },
  data() {
    const validateUrl = (rule, value, callback) => {
      if (this.displayType === 'external' && validateURL(this.displayUrl)) {
        callback()
      } else {
        callback(new Error('请输入有效的链接地址'))
      }
    }
    return {
      dialogAggregationVisible: false,
      dialogSelectionVisible: false,
      dialogPromotionVisible: false,
      dialogPreviewVisible: false,
      imageType: this.targetType,
      originalProp: {
        type: this.targetType,
        name: this.targetName,
        url: this.targetUrl
      },
      externalData: {
        url: ''
      },
      externalRules: {
        url: [{ validator: validateUrl, trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasPromotionPermission() {
      return this.userPermissions.includes(PromotionPermissions.view)
    },
    typeOptions: {
      get() {
        return [{
          value: 'blank',
          label: '无链接'
        }, {
          value: 'aggregation',
          label: '聚合页'
        }, {
          value: 'promotion',
          label: '促销活动页',
          disabled: !this.hasPromotionPermission
        }, {
          value: 'commodity',
          label: '商品'
        }, {
          value: 'category',
          label: '商品分类'
        }, {
          value: 'coupon',
          label: '领券中心'
        }, {
          value: 'external',
          label: '外部链接'
        }]
      }
    },
    displayType: {
      get() {
        return this.targetType
      },
      set(value) {
        this.imageType = value
        const newTarget = {
          index: this.targetIndex,
          type: this.imageType
        }
        if (value === 'category') {
          newTarget.name = '商品分类'
          newTarget.url = 'route://category'
        } else if (value === 'coupon') {
          newTarget.name = '领券中心'
          newTarget.url = 'route://coupon_center'
        } else if (value === 'blank') {
          newTarget.name = '无链接'
          newTarget.url = 'about:blank'
        } else if (value === 'external') {
          newTarget.name = '外部链接'
          newTarget.url = ''
        } else if (value === this.originalProp.type) {
          newTarget.name = this.originalProp.name
          newTarget.url = this.originalProp.url
        }
        this.$emit('targetChanges', newTarget)
      }
    },
    displayName: {
      get() {
        if (this.targetUrl !== null && this.targetUrl.trim()) {
          if (this.targetType === 'aggregation' && this.targetUrl.indexOf('aggregation') >= 0) {
            return this.targetName
          } else if (this.targetType === 'commodity' && this.targetUrl.indexOf('commodity') >= 0) {
            return this.targetName
          } else if (this.targetType === 'promotion' && this.targetUrl.indexOf('promotion') >= 0) {
            return this.targetName
          } else if (this.targetType === 'category') {
            return '商品分类'
          } else if (this.targetType === 'coupon') {
            return '领券中心'
          } else {
            return ''
          }
        } else {
          return ''
        }
      }
    },
    displayUrl: {
      get() {
        if (this.targetUrl && this.targetUrl.indexOf('commodity') >= 0) {
          return ''
        } else {
          return this.targetUrl
        }
      },
      set(value) {
        this.imageUrl = value
        this.$emit('targetChanges', {
          index: this.targetIndex,
          url: this.imageUrl
        })
      }
    },
    qrCodeValue: {
      get() {
        switch (this.targetType) {
          case 'aggregation':
            if (this.targetUrl && this.targetUrl.indexOf('aggregation') >= 0) {
              const id = this.targetUrl.substring('aggregation://'.length)
              return process.env.VUE_APP_MALL_URL + '/index/' + id
            }
            break
          case 'promotion':
            if (this.targetUrl && this.targetUrl.indexOf('promotion') >= 0) {
              const id = this.targetUrl.substring('route://promotion/'.length)
              return process.env.VUE_APP_MALL_URL + '/category/goods/promotion/' + id
            }
            break
          case 'commodity':
            /*
            if (this.targetUrl.indexOf('commodity') >= 0) {
              const id = this.targetUrl.substring('route://commodity/'.length)
              return process.env.VUE_APP_MALL_URL + '/category/goods/promotion/' + id
            }
             */
            return ''
          case 'category':
            return process.env.VUE_APP_MALL_URL + '/category/all'
          case 'coupon':
            return process.env.VUE_APP_MALL_URL + '/user/couponCenter'
          default:
            return ''
        }
        return ''
      }
    }
  },
  watch: {
    targetIndex: function (newValue, oldValue) {
      this.originalProp = {
        type: this.targetType,
        name: this.targetName,
        url: this.targetUrl
      }
    }
  },
  methods: {
    onTypeChanged(value) {
      this.displayType = value
    },
    onAggregationSelectionCancelled() {
      this.dialogAggregationVisible = false
    },
    onAggregationSelectionConfirmed(aggregation) {
      this.dialogAggregationVisible = false
      this.$emit('targetChanges', {
        index: this.targetIndex,
        type: this.imageType,
        name: aggregation.name,
        url: 'aggregation://' + aggregation.id
      })
    },
    onPromotionSelectionConfirmed(promotion) {
      this.dialogPromotionVisible = false
      if (promotion) {
        this.$emit('targetChanges', {
          index: this.targetIndex,
          type: this.imageType,
          name: promotion.name,
          url: 'route://promotion/' + promotion.id
        })
      }
    },
    onPromotionSelectionCancelled() {
      this.dialogPromotionVisible = false
    },
    onGoodsSelectionConfirmed(skus) {
      this.dialogSelectionVisible = false
      if (skus.length > 0) {
        this.$emit('targetChanges', {
          index: this.targetIndex,
          type: this.imageType,
          name: skus[0].name,
          url: 'route://commodity/' + skus[0].mpu
        })
      }
    },
    onGoodsSelectionCancelled() {
      this.dialogSelectionVisible = false
    },
    onPreviewShown() {
      if (this.qrCodeValue) {
        this.dialogPreviewVisible = true
      }
    }
  }
}
</script>

<style scoped>

</style>

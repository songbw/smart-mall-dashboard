<template>
  <div>
    <el-select v-model="displayType" :disabled="readOnly">
      <el-option
        v-for="item in typeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <div v-if="displayType === 'aggregation'">
      <el-button :disabled="readOnly" type="primary" size="mini" @click="dialogAggregationVisible = true">
        选择聚合页
      </el-button>
      <aggregation-selection-dialog
        :app-id="appId"
        :dialog-visible="dialogAggregationVisible"
        @onSelectionCancelled="onAggregationSelectionCancelled"
        @onSelectionConfirmed="onAggregationSelectionConfirmed"
      />
    </div>
    <div v-else-if="displayType === 'commodity'">
      <el-button :disabled="readOnly" type="primary" size="mini" @click="dialogSelectionVisible = true">
        选择商品
      </el-button>
      <goods-selection-dialog
        :merchant-id="merchantId"
        :preset-first-category="firstClassCategory"
        :dialog-visible="dialogSelectionVisible"
        :single-selection="true"
        :use-default-sku="true"
        @onSelectionCancelled="onGoodsSelectionCancelled"
        @onSelectionConfirmed="onGoodsSelectionConfirmed"
      />
    </div>
    <div v-else-if="displayType === 'external'" style="margin-top: 7px">
      <el-input v-model="externalUrl" :readonly="readOnly" />
    </div>
    <div v-if="displayName" style="margin-left: 10px">{{ displayName }}</div>
  </div>
</template>

<script>
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import AggregationSelectionDialog from '@/components/AggregationSelectionDialog'
import { UrlTypeOptions, getUrlType } from './constants'

export default {
  name: 'CouponUrl',
  components: { GoodsSelectionDialog, AggregationSelectionDialog },
  props: {
    url: {
      type: String,
      default: ''
    },
    readOnly: {
      type: Boolean,
      default: true
    },
    firstClassCategory: {
      type: Number,
      default: null
    },
    merchantId: {
      type: Number,
      default: 0
    },
    appId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      typeOptions: UrlTypeOptions,
      dialogAggregationVisible: false,
      dialogSelectionVisible: false
    }
  },
  computed: {
    displayType: {
      get() {
        return getUrlType(this.url)
      },
      set(value) {
        let url = ''
        switch (value) {
          case 'aggregation':
            url = 'aggregation://'
            break
          case 'commodity':
            url = 'route://commodity'
            break
          case 'listing':
            url = 'route://listing'
            break
          case 'blank':
            url = 'about:blank'
            break
          default:
            break
        }
        this.$emit('urlChanged', { url })
      }
    },
    externalUrl: {
      get() {
        return this.url
      },
      set(value) {
        this.$emit('urlChanged', { url: value })
      }
    },
    displayName: {
      get() {
        if (this.url && this.url.startsWith('aggregation://')) {
          return '聚合页ID:' + this.url.substring('aggregation://'.length)
        } else if (this.url && this.url.startsWith('route://commodity')) {
          return '商品MPU:' + this.url.substring('route://commodity/'.length)
        } else {
          return ''
        }
      }
    }
  },
  methods: {
    onAggregationSelectionCancelled() {
      this.dialogAggregationVisible = false
    },
    onAggregationSelectionConfirmed(aggregation) {
      this.dialogAggregationVisible = false
      this.$emit('urlChanged', {
        url: 'aggregation://' + aggregation.id
      })
    },
    onGoodsSelectionConfirmed(skus) {
      this.dialogSelectionVisible = false
      if (skus.length > 0) {
        this.$emit('urlChanged', {
          url: 'route://commodity/' + skus[0].mpu,
          meta: {
            commodityImage: skus[0].imagePath
          }
        })
      }
    },
    onGoodsSelectionCancelled() {
      this.dialogSelectionVisible = false
    }
  }
}
</script>

<style scoped>

</style>

<template>
  <div>
    <el-select v-model="displayType">
      <el-option
        v-for="item in typeOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value" />
    </el-select>
    <div v-if="displayType === 'aggregation'">
      <el-button type="primary" size="mini" @click="dialogAggregationVisible = true">
        选择聚合页
      </el-button>
      <aggregation-selection :dialog-visible="dialogAggregationVisible"
                             @onSelectionCancelled="onAggregationSelectionCancelled"
                             @onSelectionConfirmed="onAggregationSelectionConfirmed" />
    </div>
    <div v-else-if="displayType === 'commodity'">
      <el-button type="primary" size="mini" @click="dialogSelectionVisible = true">
        {{ $t('aggregation_customization_goods_select_title') }}
      </el-button>
      <goods-selection :dialog-visible="dialogSelectionVisible"
                       @onSelectionCancelled="onGoodsSelectionCancelled"
                       @onSelectionConfirmed="onGoodsSelectionConfirmed" />
    </div>
    <div v-else-if="displayType === 'external'">
      <el-input v-model="externalUrl" :readonly="readOnly" />
    </div>
    <div v-if="displayName" style="margin-left: 10px">{{ displayName }}</div>
  </div>
</template>

<script>
  import GoodsSelection from '@/components/Goods/goodsSelectionDialog'
  import AggregationSelection from '@/components/Goods/aggregationSelectionDialog'

  export default {
    name: 'CouponUrl',
    components: { GoodsSelection, AggregationSelection },
    props: {
      url: {
        type: String,
        default: ''
      },
      readOnly: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        typeOptions: [{
          value: 'aggregation',
          label: '聚合页'
        }, {
          value: 'commodity',
          label: '特定商品'
        }, {
          value: 'listing',
          label: '商品列表'
        }, {
          value: 'external',
          label: '特定链接'
        }],
        dialogAggregationVisible: false,
        dialogSelectionVisible: false
      }
    },
    computed: {
      displayType: {
        get() {
          if (this.url.startsWith('aggregation://')) {
            return 'aggregation'
          } else if (this.url.startsWith('route://commodity')) {
            return 'commodity'
          } else if (this.url.startsWith('route://listing')) {
            return 'listing'
          } else {
            return 'external'
          }
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
          if (this.url.startsWith('aggregation://')) {
            return '聚合页ID:' + this.url.substring('aggregation://'.length)
          } else if (this.url.startsWith('route://commodity')) {
            return '商品SkuID:' + this.url.substring('route://commodity/'.length)
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
          }
        )
      },
      onGoodsSelectionConfirmed(skus) {
        this.dialogSelectionVisible = false
        if (skus.length > 0) {
          this.$emit('urlChanged', {
              url: 'route://commodity/' + skus[0].skuid
            }
          )
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

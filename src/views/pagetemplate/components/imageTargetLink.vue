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
    <div v-else-if="displayType === 'promotion'">
      <el-button type="primary" size="mini" @click="dialogPromotionVisible = true">
        选择促销活动页
      </el-button>
      <promotion-selection :dialog-visible="dialogPromotionVisible"
                           @onSelectionCancelled="onPromotionSelectionCancelled"
                           @onSelectionConfirmed="onPromotionSelectionConfirmed" />
    </div>
    <div v-else-if="displayType === 'commodity'">
      <el-button type="primary" size="mini" @click="dialogSelectionVisible = true">
        {{ $t('aggregation_customization_goods_select_title') }}
      </el-button>
      <goods-selection :dialog-visible="dialogSelectionVisible"
                       @onSelectionCancelled="onGoodsSelectionCancelled"
                       @onSelectionConfirmed="onGoodsSelectionConfirmed" />
    </div>
    <div v-if="displayName" style="margin-left: 10px">{{ displayName }}</div>
  </div>
</template>

<script>
  import GoodsSelection from '@/components/Goods/goodsSelectionDialog'
  import AggregationSelection from '@/components/Goods/aggregationSelectionDialog'
  import PromotionSelection from './promotionSelection'

  export default {
    name: 'ImageTargetLink',
    components: { GoodsSelection, AggregationSelection, PromotionSelection },
    props: {
      targetIndex: {
        type: Number,
        default: -1
      },
      targetType: {
        type: String,
        default: 'aggregation'
      },
      targetUrl: {
        type: String,
        default: ''
      },
      targetName: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        typeOptions: [{
          value: 'blank',
          label: '无链接'
        }, {
          value: 'aggregation',
          label: '聚合页'
        }, {
          value: 'promotion',
          label: '促销活动页'
        }, {
          value: 'commodity',
          label: '商品'
        }, {
          value: 'category',
          label: '商品主分类'
        }],
        dialogAggregationVisible: false,
        dialogSelectionVisible: false,
        dialogPromotionVisible: false,
        imageType: this.targetType,
        originalProp: {
          type: this.targetType,
          name: this.targetName,
          url: this.targetUrl
        }
      }
    },
    computed: {
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
          } else if (value === 'blank') {
            newTarget.name = '无链接'
            newTarget.url = 'about:blank'
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
            }
          )
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
          }
        )
      },
      onPromotionSelectionConfirmed(promotion) {
        this.dialogPromotionVisible = false
        if (promotion) {
          this.$emit('targetChanges', {
              index: this.targetIndex,
              type: this.imageType,
              name: promotion.name,
              url: 'route://promotion/' + promotion.id
            }
          )
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
              name: skus[0].intro,
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

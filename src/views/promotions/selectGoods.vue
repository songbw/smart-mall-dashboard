<template>
  <el-container v-loading="dataLoading">
    <el-header v-if="viewOnly" height="120px">
      <promotion-info />
    </el-header>
    <el-main>
      <div v-if="viewOnly === false" class="header-container">
        <div class="header-ops-container">
          <el-button @click="dialogImportVisible = true">
            导入商品
          </el-button>
          <el-button type="primary" @click="dialogSelectionVisible = true">
            选择商品
          </el-button>
        </div>
        <div class="header-ops-container">
          <span style="width: 100px;text-align: end">优惠价格：</span>
          <el-input v-model="promotionValue" style="width: 100px" maxlength="10" />
          <el-button
            :disabled="selectedItems.length === 0"
            type="primary"
            style="margin: 0 5px"
            @click="handleSetDiscount"
          >
            设置已选商品
          </el-button>
          <el-button
            type="primary"
            @click="handleSetAllDiscount"
          >
            设置全部商品
          </el-button>
        </div>
        <div class="header-ops-container">
          <span style="width: 150px;text-align: end">
            {{ `已选择${selectedItems.length}件商品` }}
          </span>
          <el-button
            :disabled="selectedItems.length === 0"
            type="danger"
            style="margin-left: 10px"
            @click="handleDeleteSelection"
          >
            删除
          </el-button>
        </div>
      </div>
      <el-table
        ref="skuTable"
        :data="skuData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          :selectable="productSelectable"
          type="selection"
          width="55"
        />
        <el-table-column label="商品SKU" align="center" width="150">
          <template slot-scope="scope">
            <span>{{ scope.row.skuid }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品名" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品价格(元)" align="center" width="100">
          <template slot-scope="scope">
            <span>{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="promotionTypeLabel" align="center" width="250">
          <template slot-scope="scope">
            <template v-if="scope.row.editDiscount">
              <el-input v-model="scope.row.discount" size="small" style="width:80px; margin-right: 10px" />
              <el-button
                icon="el-icon-close"
                size="mini"
                type="primary"
                circle
                @click="handleCancelEditDiscount(scope.row)"
              />
              <el-button
                icon="el-icon-check"
                size="mini"
                type="primary"
                circle
                @click="handleConfirmEditDiscount(scope.row)"
              />
            </template>
            <template v-else>
              <span>{{ scope.row.discount }}</span>
              <el-button
                v-if="viewOnly === false"
                icon="el-icon-edit"
                size="mini"
                type="primary"
                circle
                style="margin-left: 10px"
                @click="scope.row.editDiscount = true"
              />
            </template>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180">
          <template slot-scope="scope">
            <el-button
              :disabled="viewOnly"
              icon="el-icon-delete"
              type="danger"
              size="mini"
              @click="handleDeleteRow(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        :total="skuTotal"
        :page.sync="offset"
        :limit.sync="limit"
      />
      <goods-selection-dialog
        :dialog-visible="dialogSelectionVisible"
        @onSelectionCancelled="onGoodsSelectionCancelled"
        @onSelectionConfirmed="onGoodsSelectionConfirmed"
      />
      <goods-import-dialog
        :dialog-visible="dialogImportVisible"
        @onSelectionCancelled="onGoodsImportCancelled"
        @onSelectionConfirmed="onGoodsImportConfirmed"
      />
    </el-main>
    <el-footer class="footer-container">
      <div>
        <el-button v-if="viewOnly === false" @click="$emit('prevStep')">上一步</el-button>
        <el-button type="primary" @click="handleSaveGoods">确认</el-button>
      </div>
    </el-footer>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import PromotionInfo from './promotionInfo'

export default {
  name: 'SelectGoods',
  components: { PromotionInfo, GoodsSelectionDialog, GoodsImportDialog, Pagination },
  props: {
    viewOnly: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      typeOptions: [{
        value: 0,
        label: '减价'
      }, {
        value: 1,
        label: '折扣'
      }],
      dataLoading: false,
      promotionValue: '',
      dialogSelectionVisible: false,
      dialogImportVisible: false,
      offset: 1,
      limit: 20,
      selectedItems: [],
      addedItems: [],
      updateItems: [],
      deleteItems: []
    }
  },
  computed: {
    ...mapGetters({
      promotionData: 'currentPromotion'
    }),
    promotionType: {
      get() {
        return this.promotionData.promotionType
      },
      set(value) {
        this.$store.commit('setPromotionType', value)
      }
    },
    promotionTypeLabel: {
      get() {
        if (this.promotionType === 0) {
          return '减价(元)'
        } else {
          return '折扣'
        }
      }
    },
    skuTotal: {
      get() {
        return this.promotionData.promotionSkus ? this.promotionData.promotionSkus.length : 0
      }
    },
    skuData: {
      get() {
        if (this.skuTotal > 0) {
          const begin = (this.offset > 1 ? (this.offset - 1) : 0) * this.limit
          const end = begin + this.limit
          const skus = this.promotionData.promotionSkus.slice(begin, end)
          const newSkus = []
          skus.forEach(item => {
            const newItem = { ...item }
            this.$set(newItem, 'editDiscount', false)
            this.$set(newItem, 'originalDiscount', item.discount)
            newSkus.push(newItem)
          })
          return newSkus
        } else {
          return []
        }
      }
    }
  },
  methods: {
    productSelectable() {
      return this.viewOnly === false
    },
    getDiscountValue() {
      const discount = Number.parseFloat(this.promotionValue)
      if (this.skuTotal === 0) {
        this.$message({ message: '请先导入或者添加促销产品！', type: 'warning' })
        return -1
      }
      if (Number.isNaN(discount) || discount <= 0) {
        this.$message({ message: '请输入有效的优惠信息！', type: 'error' })
        return -1
      }
      if (this.promotionType === 1 && discount >= 1) {
        this.$message({ message: '请输入0~1之间的数字，0.8表示8折。', type: 'error' })
        return -1
      }
      return discount
    },
    handleSetDiscount() {
      const discount = this.getDiscountValue()
      if (discount < 0) {
        return
      }
      let message = ''
      if (this.promotionType === 0) {
        message = `将对所有选择的商品优惠${discount}元，请确认是否继续？`
      } else {
        message = `将对所有选择的商品实施折扣${discount}，请确认是否继续？`
      }
      this.$confirm(message, '优惠设置', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleSetSelectedDiscount(this.selectedItems, discount)
      }).catch(() => {
      })
    },
    handleSetSelectedDiscount(items, discount) {
      items.forEach(mpu => {
        const added = this.addedItems.find(item => item.mpu === mpu)
        if (added) {
          added.discount = discount
        } else {
          const updated = this.updateItems.find(item => item.mpu === mpu)
          if (updated) {
            updated.discount = discount
          } else {
            this.updateItems.push({ mpu: mpu, discount: discount })
          }
        }
      })
      this.$store.commit('promotions/SET_SKUS_DISCOUNT', { mpus: items, discount: discount })
    },
    handleSetAllDiscount() {
      const discount = this.getDiscountValue()
      if (discount > 0 && this.skuTotal > 0) {
        let message = ''
        if (this.promotionType === 0) {
          message = `将对所有商品优惠${discount}元，请确认是否继续？`
        } else {
          message = `将对所有商品实施折扣${discount}，请确认是否继续？`
        }
        this.$confirm(message, '优惠设置', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          const allItems = this.promotionData.promotionSkus.map(sku => sku.mpu)
          this.handleSetSelectedDiscount(allItems, discount)
        }).catch(() => {
        })
      }
    },
    handleSelectionChange(selection) {
      this.selectedItems = selection.map(item => item.mpu)
    },
    handleDeleteCachedItems(mpu) {
      const addedIndex = this.addedItems.findIndex(item => item.mpu === mpu)
      if (addedIndex >= 0) {
        this.addedItems.splice(addedIndex, 1)
      } else {
        const updateIndex = this.updateItems.findIndex(item => item.mpu === mpu)
        if (updateIndex >= 0) {
          this.updateItems.splice(updateIndex, 1)
        }
        const deleteIndex = this.deleteItems.findIndex(item => item.mpu === mpu)
        if (deleteIndex < 0) {
          this.deleteItems.push({ mpu })
        }
      }
    },
    handleDeleteRow(sku) {
      this.$confirm('请确认是否删除此优惠商品？', '删除商品', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.handleDeleteCachedItems(sku.mpu)
        const index = this.promotionData.promotionSkus.findIndex(item => item.mpu === sku.mpu)
        this.$store.commit('promotions/DELETE_SKU_INDEX', index)
      }).catch(() => {
      })
    },
    handleDeleteSelection() {
      this.$confirm('请确认是否删除所选的优惠商品？', '删除商品', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.selectedItems.forEach(mpu => this.handleDeleteCachedItems(mpu))
        this.$store.commit('promotions/DELETE_SKUS', this.selectedItems)
      }).catch(() => {
      })
    },
    onGoodsSelectionCancelled() {
      this.dialogSelectionVisible = false
    },
    onGoodsSelectionConfirmed(skus) {
      this.dialogSelectionVisible = false
      this.handleAddSkus(skus)
    },
    onGoodsImportConfirmed(skus) {
      this.dialogImportVisible = false
      this.handleAddSkus(skus)
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    },
    handleAddSkus(skus) {
      this.dataLoading = true
      this.offset = 1
      this.addPromotionContentAsync(skus).then(count => {
        this.dataLoading = false
      }).catch(() => {
        this.dataLoading = false
        console.log('no skus added')
      }).finally(() => {
      })
    },
    addPromotionContentAsync(skus) {
      return new Promise((resolve, reject) => {
        let total = 0
        const toAdd = []
        for (const sku of skus) {
          const found = this.promotionData.promotionSkus.findIndex(item => item.mpu === sku.mpu)
          if (found < 0) {
            const deleteIndex = this.deleteItems.findIndex(item => item.mpu === sku.mpu)
            if (deleteIndex >= 0) {
              this.deleteItems.splice(deleteIndex, 1)
              this.updateItems.push({ mpu: sku.mpu, discount: 0 })
            } else {
              this.addedItems.push({ skuid: sku.skuid, mpu: sku.mpu, discount: 0 })
            }
            toAdd.push({
              skuid: sku.skuid,
              mpu: sku.mpu,
              name: sku.name,
              brand: sku.brand,
              price: sku.price,
              discount: 0
            })
            total++
          }
        }
        if (total > 0) {
          this.$store.commit('promotions/ADD_SKUS', toAdd)
          resolve(total)
        } else {
          reject()
        }
      })
    },
    handleCancelEditDiscount(row) {
      row.discount = row.originalDiscount
      row.editDiscount = false
    },
    handleConfirmEditDiscount(row) {
      row.editDiscount = false
      this.$store.commit('promotions/SET_SKU_DISCOUNT', { mpu: row.mpu, discount: row.discount })

      const addedIndex = this.addedItems.findIndex(item => item.mpu === row.mpu)
      if (addedIndex >= 0) {
        this.addedItems[addedIndex].discount = row.discount
      } else {
        const updateIndex = this.updateItems.findIndex(item => item.mpu === row.mpu)
        if (updateIndex >= 0) {
          this.updateItems[updateIndex].discount = row.discount
        } else {
          this.updateItems.push({ mpu: row.mpu, discount: row.discount })
        }
      }
    },
    handleUpdatePromotion() {
      const params = {
        id: this.promotionData.id,
        promotionType: this.promotionType
      }
      this.$store.dispatch('promotions/update', params).then(() => {
        this.handleUpdateGoods()
      }).catch(err => {
        console.warn('updatePromotion:' + err)
      })
    },
    async handleUpdateGoods() {
      const promises = []
      if (this.addedItems.length > 0) {
        const params = { id: this.promotionData.id, promotionSkus: [] }
        for (const sku of this.addedItems) {
          params.promotionSkus.push(sku)
        }
        promises.push(this.$store.dispatch('promotions/addContent', params))
      }
      if (this.updateItems.length > 0) {
        if (this.updateItems.length > 0) {
          const params = { id: this.promotionData.id, promotionSkus: [] }
          for (const sku of this.updateItems) {
            params.promotionSkus.push(sku)
          }
          promises.push(this.$store.dispatch('promotions/updateContent', params))
        }
      }
      if (this.deleteItems.length > 0) {
        if (this.deleteItems.length > 0) {
          const params = { id: this.promotionData.id, promotionSkus: [] }
          for (const sku of this.deleteItems) {
            params.promotionSkus.push(sku)
          }
          promises.push(this.$store.dispatch('promotions/deleteContent', params))
        }
      }
      if (promises.length > 0) {
        try {
          await this.$confirm('请确认是否保存此次促销活动的更改？', '保存活动', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          })
          this.dataLoading = true
          Promise.all(promises).then(() => {
            this.$emit('onUpdateSuccess')
          }).catch(err => {
            console.log('SavePromotion:' + err)
          }).finally(() => {
            this.dataLoading = false
          })
        } catch (_) {
          console.debug('Cancel save promotion changes')
        }
      } else {
        this.$emit('onUpdateSuccess')
      }
    },
    handleSaveGoods() {
      if (this.viewOnly) {
        this.$emit('onUpdateSuccess')
        return
      }
      if (this.addedItems.length > 0) {
        for (const sku of this.addedItems) {
          if (sku.discount <= 0) {
            this.$message({ message: '请检查所有商品的优惠设置情况！', type: 'error' })
            return
          }
        }
      }
      if (this.updateItems.length > 0) {
        for (const sku of this.updateItems) {
          if (sku.discount <= 0) {
            this.$message({ message: '请检查所有商品的优惠设置情况！', type: 'error' })
            return
          }
        }
      }
      this.handleUpdateGoods()
    }
  }
}
</script>

<style scoped>
  .header-container {
    display: flex;
    justify-content: space-between;
    margin: 10px 20px;
  }

  .header-ops-container {
    display: flex;
    align-items: center;
  }

  .footer-container {
    text-align: center;
  }
</style>

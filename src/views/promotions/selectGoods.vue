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
          <el-input v-model="promotionValue" style="width: 100px" />
          <el-button
            :disabled="selectedItems.length === 0"
            type="primary"
            style="margin: 0 5px"
            @click="handleSetDiscount"
          >
            设置已选商品
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
        :page-sizes="[20, 40, 80, 100]"
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
      }/*, {
          value: 1,
          label: '折扣'
        }*/],
      dataLoading: false,
      promotionValue: null,
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
    canChangeType: {
      get() {
        if ('hasPromotionType' in this.promotionData) {
          return this.promotionData.hasPromotionType === false
        } else {
          return true
        }
      }
    },
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
            const newItem = Object.assign({}, item)
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
    handleSetDiscount() {
      const discount = Number.parseFloat(this.promotionValue)
      if (this.skuTotal === 0) {
        this.$message({ message: '请先导入或者添加促销产品！', type: 'warning' })
        return
      }
      if (Number.isNaN(discount) || discount <= 0) {
        this.$message({ message: '请输入有效的优惠信息！', type: 'error' })
        return
      }
      if (this.promotionType === 1 && discount >= 1) {
        this.$message({ message: '请输入0~1之间的数字，0.8表示8折。', type: 'error' })
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
        this.handleSetSelectedDiscount(discount)
      }).catch(() => {
      })
    },
    handleSetSelectedDiscount(discount) {
      this.selectedItems.forEach(select => {
        this.$store.commit('promotions/SET_SKU_DISCOUNT', { skuid: select.skuid, discount: discount })
        const added = this.addedItems.find(item => item.skuid === select.skuid)
        if (added) {
          added.discount = discount
        } else {
          const updated = this.updateItems.find(item => item.skuid === select.skuid)
          if (updated) {
            updated.discount = discount
          } else {
            this.updateItems.push({ skuid: select.skuid, discount: discount })
          }
        }
      })
    },
    handleSelectionChange(selection) {
      this.selectedItems = selection
    },
    handleDeleteRow(sku) {
      this.$confirm('请确认是否删除此优惠商品？', '删除商品', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const addedIndex = this.addedItems.findIndex(item => item.skuid === sku.skuid)
        if (addedIndex >= 0) {
          this.addedItems.splice(addedIndex, 1)
        } else {
          const updateIndex = this.updateItems.findIndex(item => item.skuid === sku.skuid)
          if (updateIndex >= 0) {
            this.updateItems.splice(updateIndex, 1)
          }
          const deleteIndex = this.deleteItems.findIndex(item => item.skuid === sku.skuid)
          if (deleteIndex < 0) {
            this.deleteItems.push({ skuid: sku.skuid })
          }
        }
        const index = this.promotionData.promotionSkus.findIndex(item => item.skuid === sku.skuid)
        this.$store.commit('promotions/DELETE_SKU', index)
      }).catch(() => {
      })
    },
    handleDeleteSelection() {
      this.$confirm('请确认是否删除所选的优惠商品？', '删除商品', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dataLoading = true
        const promise = new Promise((resolve) => {
          for (const sku of this.selectedItems) {
            this.handleDeleteRow(sku)
          }
          resolve()
        })
        promise.then(() => {
          this.dataLoading = false
        })
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
        for (const sku of skus) {
          const found = this.promotionData.promotionSkus.findIndex(item => item.skuid === sku.skuid)
          if (found < 0) {
            const deleteIndex = this.deleteItems.findIndex(item => item.skuid === sku.skuid)
            if (deleteIndex >= 0) {
              this.deleteItems.splice(deleteIndex, 1)
              this.updateItems.push({ skuid: sku.skuid, discount: 0 })
            } else {
              this.addedItems.push({ skuid: sku.skuid, discount: 0 })
            }
            this.$store.commit('promotions/ADD_SKU', {
              skuid: sku.skuid,
              name: sku.intro,
              price: sku.price,
              discount: 0
            })
            total++
          }
        }
        if (total > 0) {
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
      this.$store.commit('promotions/SET_SKU_DISCOUNT', { skuid: row.skuid, discount: row.discount })

      const addedIndex = this.addedItems.findIndex(item => item.skuid === row.skuid)
      if (addedIndex >= 0) {
        this.addedItems[addedIndex].discount = row.discount
      } else {
        const updateIndex = this.updateItems.findIndex(item => item.skuid === row.skuid)
        if (updateIndex >= 0) {
          this.updateItems[updateIndex].discount = row.discount
        } else {
          this.updateItems.push({ skuid: row.skuid, discount: row.discount })
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
        this.console.log('updatePromotion:' + err)
      })
    },
    handleUpdateGoods() {
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
        Promise.all(promises).then(() => {
          this.dataLoading = false
          this.$emit('onUpdateSuccess')
        }).catch(err => {
          this.dataLoading = false
          console.log('SavePromotion:' + err)
        })
      } else {
        this.dataLoading = false
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
      this.dataLoading = true
      if (this.canChangeType) {
        this.handleUpdatePromotion()
      } else {
        this.handleUpdateGoods()
      }
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

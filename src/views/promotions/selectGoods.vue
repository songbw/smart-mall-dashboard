<template>
  <el-container v-loading="dataLoading">
    <el-header v-if="viewOnly" height="120px">
      <promotion-info />
    </el-header>
    <el-main>
      <div v-if="conflictedSkus.length > 0">
        <div style="font-size: 14px;margin-bottom: 10px">
          <i class="el-icon-warning-outline">
            此活动的下面商品列表与已发布的其它活动时间有冲突，同一个商品在一段时间内只能参加一个活动
          </i>
        </div>
        <el-table
          border
          :data="conflictedSkus"
          style="width: 100%"
        >
          <el-table-column label="商品SKU" align="center" width="150">
            <template slot="header">
              <el-button type="danger" size="mini" @click="handleDeleteConflictedMpus">
                全部删除
              </el-button>
            </template>
            <template slot-scope="scope">
              <span>{{ scope.row.skuid }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品名" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="商品价格(元)" align="center" width="120">
            <template slot-scope="scope">
              <span>{{ scope.row.price }}</span>
            </template>
          </el-table-column>
        </el-table>
        <el-divider />
      </div>
      <div v-if="promotionData.dailySchedule">
        <div style="font-size: 14px;margin-bottom: 10px">
          <i class="el-icon-warning-outline">最多添加5个活动时段，每个时段的默认结束时间为24小时。</i>
        </div>
        <el-form v-if="!viewOnly" ref="scheduleForm" :model="scheduleData" :rules="scheduleRules" inline>
          <el-form-item label="活动时段" prop="schedule">
            <el-time-select
              v-model="scheduleData.schedule"
              :picker-options="{start: '00:00', step: '01:00', end: '23:00'}"
              placeholder="选择时段开始时间"
              @input="onScheduleTimeChanged"
            />
          </el-form-item>
          <el-form-item label="开始时间">
            <span>{{ scheduleData.startTime }}</span>
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <span>{{ scheduleData.endTime }}</span>
          </el-form-item>
          <el-form-item>
            <el-button :disabled="scheduleTabs.length >= 5" type="primary" @click="handleAddScheduleTime">
              添加活动时段
            </el-button>
          </el-form-item>
        </el-form>
        <el-tabs
          v-model="currentScheduleId"
          :closable="!viewOnly"
          type="card"
          @tab-remove="onScheduleTabRemove"
        >
          <el-tab-pane
            v-for="item in scheduleTabs"
            :key="item.label"
            :label="item.label"
            :name="item.name"
          >
            <el-form inline>
              <el-form-item label="场次开始时间"><span>{{ item.startTime | dateFilter }}</span></el-form-item>
              <el-form-item label="场次结束时间"><span>{{ item.endTime | dateFilter }}</span></el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div v-if="opsButtonShow" class="header-container">
        <div class="header-ops-container">
          <el-button @click="dialogImportVisible = true">
            导入商品
          </el-button>
          <el-button type="primary" @click="dialogSelectionVisible = true">
            添加商品
          </el-button>
        </div>
        <div v-if="setDiscount" class="header-ops-container">
          <span style="width: 100px;text-align: end">优惠减价：</span>
          <el-input-number
            v-model="promotionValue"
            :min="1"
            :max="maxPromotionValue"
            step-strictly
          />
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
        border
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
        <el-table-column label="商品价格(元)" align="center" width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="setDiscount" :label="discountTypeLabel" align="center" width="250">
          <template slot-scope="scope">
            <template v-if="scope.row.editDiscount">
              <el-input-number
                v-model="scope.row.discount"
                :controls="false"
                size="mini"
                :min="1"
                :max="scope.row.price + 1"
                step-strictly
              />
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
        <el-table-column v-else label="促销价格(元)" align="center" width="250">
          <template slot-scope="scope">
            <template v-if="scope.row.editDiscount">
              <el-input-number
                :value="scope.row.discount > 0 ? scope.row.price - scope.row.discount : null"
                :controls="false"
                :precision="2"
                :step="0.01"
                :min="0"
                :max="scope.row.price + 1"
                step-strictly
                size="mini"
                @input="value => handleSetSecKillPrice(value, scope.row)"
                @blur="event => handleConfirmEditDiscount(scope.row)"
              />
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
              <span>{{ scope.row.discount > 0 ? (scope.row.price - scope.row.discount).toFixed(2) : null }}</span>
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
        <el-table-column label="限购数量" align="center" width="120">
          <template slot-scope="scope">
            <template>
              <span>{{ scope.row.perLimited | limitFilter }}</span>
              <el-button
                v-if="viewOnly === false"
                icon="el-icon-edit"
                size="mini"
                type="warning"
                circle
                style="margin-left: 10px"
                @click="handleEditPerLimited(scope.row)"
              />
            </template>
          </template>
        </el-table-column>
        <el-table-column label="促销封面图" align="center" width="140">
          <template slot-scope="scope">
            <image-upload
              :image-url="scope.row.promotionImage"
              :view-only="viewOnly"
              button-size="mini"
              path-name="promotions"
              tip=""
              @success="url => handleUploadImageSuccess(url, scope.row)"
            />
            <el-button
              :disabled="scope.row.promotionImage === ''"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="handleRemoveImage(scope.row)"
            >
              删除图片
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
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
        :product-promotion="true"
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
    <el-dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :visible.sync="limitedEditDialogVisible"
      title="修改限购数量"
    >
      <el-form ref="limitedForm" :model="limitedForm" :rules="limitedRules" label-width="80px">
        <el-form-item label="商品名">
          <el-input :value="limitedForm.name" readonly />
        </el-form-item>
        <el-form-item label="限购数量">
          <el-radio-group v-model="perLimitedRadio">
            <el-radio label="1">不限购</el-radio>
            <el-radio label="0">限购</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="perLimitedRadio === '0'" prop="perLimited">
          <el-input-number
            v-model="perLimitedValue"
            :step="1"
            :min="1"
            :max="100"
            step-strictly
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelSetPerLimited">取消</el-button>
        <el-button type="primary" @click="handleSetUserPerLimited">确定</el-button>
      </div>
    </el-dialog>
  </el-container>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import min from 'lodash/min'
import Pagination from '@/components/Pagination'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import ImageUpload from '@/components/ImageUpload'
import PromotionInfo from './promotionInfo'

export default {
  name: 'SelectGoods',
  components: { PromotionInfo, GoodsSelectionDialog, GoodsImportDialog, Pagination, ImageUpload },
  filters: {
    dateFilter: date => {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : ''
    },
    limitFilter: limit => {
      return limit === -1 || limit === null ? '不限购' : `${limit}`
    }
  },
  props: {
    viewOnly: {
      type: Boolean,
      default: false
    },
    promotionData: {
      type: Object,
      default: function() {
        return {}
      }
    },
    conflictedSkus: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      setDiscount: false,
      typeOptions: [{
        value: 0,
        label: '减价'
      }, {
        value: 1,
        label: '折扣'
      }],
      dataLoading: false,
      scheduleData: {
        schedule: null,
        startTime: '0000-00-00 00:00:00',
        endTime: null
      },
      currentScheduleId: null,
      promotionValue: '',
      dialogSelectionVisible: false,
      dialogImportVisible: false,
      offset: 1,
      limit: 80,
      selectedItems: [],
      addedItems: [],
      updateItems: [],
      deleteItems: [],
      scheduleRules: {
        schedule: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择此活动场次的开始时间'))
            } else {
              callback()
            }
          }
        }],
        endTime: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            const format = 'YYYY-MM-DD HH:mm:ss'
            const startDate = moment(this.scheduleData.startTime, format)
            const endDate = moment(this.scheduleData.endTime, format)
            if (endDate.isSameOrBefore(startDate)) {
              callback(new Error('结束时间必须晚于开始时间'))
            } else {
              callback()
            }
          }
        }]
      },
      limitedEditDialogVisible: false,
      limitedForm: {
        mpu: null,
        name: '',
        perLimited: -1,
        originalLimited: -1
      },
      limitedRules: {
        perLimited: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value === -1 || value > 0) {
              callback()
            } else {
              callback(new Error('请输入正确的限购数量'))
            }
          }
        }]
      }
    }
  },
  computed: {
    opsButtonShow() {
      if (this.viewOnly) {
        return false
      }
      if (this.promotionData.dailySchedule) {
        return this.scheduleTabs.length > 0
      }
      return true
    },
    scheduleTabs: {
      get() {
        return this.promotionData.promotionSchedules
          ? this.promotionData.promotionSchedules.map(item => ({
            name: item.id.toString(),
            label: item.schedule + '点场',
            startTime: item.startTime,
            endTime: item.endTime
          }))
          : []
      }
    },
    discountType: {
      get() {
        return this.promotionData.discountType
      },
      set(value) {
        this.$store.commit('setDiscountType', value)
      }
    },
    discountTypeLabel: {
      get() {
        if (this.discountType === 0) {
          return '减价(元)'
        } else {
          return '折扣'
        }
      }
    },
    skuTotal: {
      get() {
        return this.scheduleSkus.length
      }
    },
    scheduleId: {
      get() {
        if (this.promotionData.dailySchedule) {
          const scheduleId = Number.parseInt(this.currentScheduleId)
          return Number.isNaN(scheduleId) ? -1 : scheduleId
        } else {
          return -1
        }
      }
    },
    maxPromotionValue: {
      get() {
        const prices = this.promotionData.promotionSkus.map(sku => Number.parseInt(sku.price))
        return prices.length > 0 ? min(prices) : 1
      }
    },
    scheduleSkus: {
      get() {
        if (this.promotionData.dailySchedule) {
          const skus = this.promotionData.promotionSkus || []
          return skus.filter(sku => sku.scheduleId === this.scheduleId)
        } else {
          return this.promotionData.promotionSkus || []
        }
      }
    },
    skuData: {
      get() {
        if (this.skuTotal > 0) {
          const begin = (this.offset > 1 ? (this.offset - 1) : 0) * this.limit
          const end = begin + this.limit
          const skus = this.scheduleSkus.slice(begin, end)
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
    },
    perLimitedRadio: {
      get() {
        return this.limitedForm.perLimited === -1 ? '1' : '0'
      },
      set(value) {
        if (value === '1') {
          this.limitedForm.perLimited = -1
        } else {
          this.limitedForm.perLimited = this.limitedForm.originalLimited > 0 ? this.limitedForm.originalLimited : 1
        }
      }
    },
    perLimitedValue: {
      get() {
        return this.limitedForm.perLimited
      },
      set(value) {
        this.limitedForm.perLimited = value
      }
    }
  },
  created() {
    this.initData()
  },
  methods: {
    initData() {
      if (this.scheduleTabs.length > 0) {
        this.currentScheduleId = this.scheduleTabs[0].name
      }
      if (!isEmpty(this.promotionData.startDate)) {
        const format = 'YYYY-MM-DD HH:mm:ss'
        const startDateTime = moment(this.promotionData.startDate, format)
        startDateTime.hour(0)
        startDateTime.minute(0)
        startDateTime.second(0)
        this.scheduleData.startTime = startDateTime.format(format)
        this.scheduleData.endTime = startDateTime.add(1, 'days').format(format)
      }
    },
    productSelectable() {
      return this.viewOnly === false
    },
    getDiscountValue() {
      const discount = Number.parseFloat(this.promotionValue)
      if (this.skuTotal === 0) {
        this.$message({ message: '请先导入或者添加促销商品！', type: 'warning' })
        return -1
      }
      if (Number.isNaN(discount) || discount <= 0) {
        this.$message({ message: '请输入有效的优惠信息！', type: 'error' })
        return -1
      }
      if (this.discountType === 1 && discount >= 1) {
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
      if (this.discountType === 0) {
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
        if (this.discountType === 0) {
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
      this.offset = 1
      this.addPromotionContent(skus)
    },
    addPromotionContent(skus) {
      let total = 0
      const toAdd = []
      for (const sku of skus) {
        const found = this.promotionData.promotionSkus.findIndex(item => item.mpu === sku.mpu)
        const discount = 'discount' in sku ? sku.discount : 0
        if (found < 0) {
          const addItem = {
            skuid: sku.skuid,
            mpu: sku.mpu,
            discount,
            scheduleId: this.scheduleId
          }
          const deleteIndex = this.deleteItems.findIndex(item => item.mpu === sku.mpu)
          if (deleteIndex >= 0) {
            this.deleteItems.splice(deleteIndex, 1)
            this.updateItems.push({ mpu: sku.mpu, discount })
          } else {
            this.addedItems.push(addItem)
          }
          toAdd.push({
            ...addItem,
            name: sku.name,
            brand: sku.brand,
            price: Number.parseFloat(sku.price),
            promotionImage: '',
            perLimited: -1
          })
          total++
        } else {
          if (discount > 0) {
            const params = { mpu: sku.mpu, discount }
            const row = this.skuData.find(item => item.mpu === sku.mpu)
            if (row) {
              row.discount = discount
              row.originalDiscount = discount
            }
            this.$store.commit('promotions/SET_SKU_PROMOTION', params)
            this.updateCachedSku(params)
          }
        }
      }
      if (total > 0) {
        this.$store.commit('promotions/ADD_SKUS', toAdd)
      }
      return total
    },
    handleSetSecKillPrice(value, row) {
      const price = Math.round(row.price * 100)
      const pprice = Math.round(value * 100)
      row.discount = price >= pprice ? (price - pprice) / 100 : 0
    },
    handleCancelEditDiscount(row) {
      row.discount = row.originalDiscount
      row.editDiscount = false
    },
    async handleConfirmEditDiscount(row) {
      try {
        if (row.discount > 0 && row.discount / row.price > 0.5) {
          await this.$confirm('此商品促销价格低于原价的5折，是否继续设置？', '秒杀价格', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          })
        }
      } catch (e) {
        console.debug('Cancel set promotion discount')
        row.discount = row.originalDiscount
        return
      }
      row.editDiscount = false
      row.originalDiscount = row.discount
      const params = { mpu: row.mpu, discount: row.discount }
      this.$store.commit('promotions/SET_SKU_PROMOTION', params)
      this.updateCachedSku(params)
    },
    updateCachedSku(params) {
      const { mpu, ...rest } = params
      const addedIndex = this.addedItems.findIndex(item => item.mpu === mpu)
      if (addedIndex >= 0) {
        this.addedItems[addedIndex] = { ...this.addedItems[addedIndex], ...rest }
      } else {
        const updateIndex = this.updateItems.findIndex(item => item.mpu === mpu)
        if (updateIndex >= 0) {
          this.updateItems[updateIndex] = { ...this.updateItems[updateIndex], ...rest }
        } else {
          this.updateItems.push({ ...params })
        }
      }
    },
    handleUpdatePromotion() {
      const params = {
        id: this.promotionData.id,
        discountType: this.discountType
      }
      this.$store.dispatch('promotions/update', params).then(() => {
        this.handleUpdateGoods()
      }).catch(err => {
        console.warn('updatePromotion:' + err)
      })
    },
    async handleUpdateGoods() {
      if (this.addedItems.length > 0 ||
        this.updateItems.length > 0 ||
        this.deleteItems.length > 0
      ) {
        try {
          await this.$confirm('请确认是否保存此次促销活动的更改？', '保存活动', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning'
          })
          this.handleChangePromotion()
        } catch (e) {
          console.debug('Cancel update promotion')
        }
      } else {
        this.$emit('onUpdateSuccess')
      }
    },
    handleChangePromotion() {
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
        this.dataLoading = true
        Promise.all(promises).then(() => {
          this.$emit('onUpdateSuccess')
        }).catch(err => {
          console.log('SavePromotion:' + err)
        }).finally(() => {
          this.dataLoading = false
        })
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
    },
    onScheduleTimeChanged(value) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const timeFormat = 'HH:mm'
      if (!isEmpty(this.promotionData.startDate)) {
        const startDateTime = moment(this.promotionData.startDate, format)
        const timeMoment = moment(value, timeFormat)
        startDateTime.hour(timeMoment.hour())
        startDateTime.minute(timeMoment.minute())
        startDateTime.second(0)
        this.scheduleData.startTime = startDateTime.format(format)
        this.scheduleData.endTime = startDateTime.add(1, 'days').format(format)
      }
    },
    onScheduleTabRemove(tab) {
      const scheduleId = Number.parseInt(tab)
      if (Number.isNaN(scheduleId)) {
        return
      }
      const skus = this.promotionData.promotionSkus || []
      const count = skus.filter(sku => sku.scheduleId === scheduleId).length
      if (count > 0) {
        this.$message.warning('请先删除此时段活动的全部商品！')
        return
      }
      this.$confirm('请确认是否删除此场次活动？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        try {
          const index = this.scheduleTabs.findIndex(item => item.name === tab)
          const nextIndex = index > 1 ? index - 1 : 0
          await this.$store.dispatch('promotions/deleteScheduleTime', { id: scheduleId })
          if (this.scheduleTabs.length > 0) {
            this.currentScheduleId = this.scheduleTabs[nextIndex].name
          } else {
            this.currentScheduleId = null
          }
        } catch (e) {
          console.warn('Promotion delete schedule error:' + e)
        }
      }).catch(_ => {
      })
    },
    handleAddScheduleTime() {
      this.$refs.scheduleForm.validate(async(valid) => {
        if (valid) {
          try {
            const index = this.promotionData.promotionSchedules
              .findIndex(item => item.schedule === this.scheduleData.schedule)
            if (index < 0) {
              const id = await this.$store.dispatch('promotions/addScheduleTime',
                { promotionId: this.promotionData.id, ...this.scheduleData })
              this.currentScheduleId = id.toString()
            } else {
              this.$message.warning('此活动时段已添加，请选择其它的时段')
            }
          } catch (e) {
            console.debug('Promotion add schedule error:' + e)
          }
        }
      })
    },
    async handleDeleteConflictedMpus() {
      try {
        await this.$confirm('请确认是否删除有冲突的活动商品？', '修改活动', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const mpus = this.conflictedSkus.map(item => item.mpu)
        mpus.forEach(mpu => this.handleDeleteCachedItems(mpu))
        this.$store.commit('promotions/DELETE_SKUS', mpus)
        this.$emit('clearConflictedSkus')
      } catch (e) {
        console.debug('Cancel delete conflicted skus')
      }
    },
    handleUploadImageSuccess(url, row) {
      row.promotionImage = url
      const params = { mpu: row.mpu, promotionImage: url }
      this.$store.commit('promotions/SET_SKU_PROMOTION', params)
      this.updateCachedSku(params)
    },
    handleRemoveImage(row) {
      row.promotionImage = ''
      const params = { mpu: row.mpu, promotionImage: '' }
      this.$store.commit('promotions/SET_SKU_PROMOTION', params)
      this.updateCachedSku(params)
    },
    handleEditPerLimited(row) {
      this.limitedForm.mpu = row.mpu
      this.limitedForm.name = row.name
      this.limitedForm.perLimited = row.perLimited !== null ? row.perLimited : -1
      this.limitedForm.originalLimited = this.limitedForm.perLimited
      this.limitedEditDialogVisible = true
    },
    cancelSetPerLimited() {
      this.limitedEditDialogVisible = false
      this.$refs.limitedForm.clearValidate()
    },
    handleSetUserPerLimited() {
      this.$refs.limitedForm.validate(valid => {
        if (valid) {
          const row = this.skuData.find(item => item.mpu === this.limitedForm.mpu)
          if (row) {
            row.perLimited = this.limitedForm.perLimited
            const params = { mpu: row.mpu, perLimited: this.limitedForm.perLimited }
            this.$store.commit('promotions/SET_SKU_PROMOTION', params)
            this.updateCachedSku(params)
          }
          this.limitedEditDialogVisible = false
        }
      })
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

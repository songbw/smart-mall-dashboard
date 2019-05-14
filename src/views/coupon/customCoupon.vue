<template>
  <div class="app-container">
    <el-form ref="couponForm" :model="formData" :rules="viewOnly ? {} : formRules" label-width="120px">
      <el-divider content-position="left"><span class="divider-text">基础信息</span></el-divider>
      <el-form-item label="优惠券名称" prop="name">
        <el-input v-model="formData.name" :readonly="viewOnly" style="width: 350px" />
      </el-form-item>
      <el-form-item label="优惠券编码" prop="code">
        <div v-if="createCoupon">
          <el-checkbox v-model="autoCode">自动生成券码</el-checkbox>
          <el-input v-if="!autoCode" v-model="formData.rules.code" style="width: 350px" />
        </div>
        <span v-else>{{ formData.rules.code }}</span>
      </el-form-item>
      <el-form-item label="发布日期" required>
        <div style="display: flex; justify-content: start">
          <el-form-item prop="releaseStartDate">
            <el-date-picker type="datetime" v-model="formData.releaseStartDate" :readonly="viewOnly"
                            placeholder="选择开始日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="releaseEndDate">
            <el-date-picker type="datetime" v-model="formData.releaseEndDate" :readonly="viewOnly"
                            placeholder="选择结束日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="发放总数" required>
        <span v-if="viewOnly">{{ formData.releaseTotal }}</span>
        <el-input-number v-else v-model="formData.releaseTotal" :min="0" />
      </el-form-item>
      <el-form-item label="有效日期" required>
        <div style="display: flex; justify-content: start">
          <el-form-item prop="effectiveStartDate">
            <el-date-picker type="datetime" v-model="formData.effectiveStartDate" :readonly="viewOnly"
                            placeholder="选择开始日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="effectiveEndDate">
            <el-date-picker type="datetime" v-model="formData.effectiveEndDate" :readonly="viewOnly"
                            placeholder="选择结束日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss" />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="排除日期">
        <div>
          <div v-for="(exclude, index) in formData.excludeDates" :key="`exclude-${index}`"
               style="display: flex; justify-content: start;margin-bottom: 10px">
            <el-form-item>
              <el-date-picker type="datetime" v-model="exclude.start" :readonly="viewOnly"
                              placeholder="选择开始日期和时间"
                              value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
            <span style="margin: 0 10px">至</span>
            <el-form-item>
              <el-date-picker type="datetime" v-model="exclude.end" :readonly="viewOnly"
                              placeholder="选择结束日期和时间"
                              value-format="yyyy-MM-dd HH:mm:ss" />
            </el-form-item>
            <el-button v-if="!viewOnly" type="danger" icon="el-icon-delete" style="margin-left: 10px"
                       @click="handleDeleteExcludeDate(index)">
              删除
            </el-button>
          </div>
          <el-button v-if="!viewOnly" type="primary" icon="el-icon-edit"
                     @click="handleAddExcludeDate">
            添加
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="优惠券类别" prop="category">
        <el-select v-model="formData.category" clearable placeholder="选择类别" :disabled="viewOnly">
          <el-option
            v-for="item in firstCategoryOptions"
            :key="item.categoryId"
            :label="item.categoryName"
            :value="item.categoryId" />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠券标签">
        <el-tag v-for="tag in formData.tags" :key="tag" :disable-transitions="false" :closable="!viewOnly"
                @close="handleCloseTag(tag)">
          {{tag}}
        </el-tag>
        <el-input
          class="input-new-tag"
          v-if="tagInputVisible && !viewOnly"
          v-model="tagInputValue"
          ref="saveTagInput"
          @keyup.enter.native="handleTagInputConfirm"
          @blur="handleTagInputConfirm"
        >
        </el-input>
        <el-button v-else-if="!viewOnly" class="button-new-tag" @click="showTagInput">+ 新标签</el-button>
      </el-form-item>
      <el-form-item label="优惠券图片">
        <image-upload path-name="coupons" image-width="300px" :image-url="formData.imageUrl" :view-only="viewOnly"
                      @urlChanged="handleImageUrlChanged" />
      </el-form-item>
      <el-form-item label="优惠券链接" class="form-item" prop="url">
        <el-input v-model="formData.url" :readonly="viewOnly" />
      </el-form-item>
      <el-form-item label="优惠券描述" prop="description" class="form-item">
        <el-input type="textarea" resize="none" v-model="formData.description" :rows="4" :readonly="viewOnly" />
      </el-form-item>
      <el-divider content-position="left"><span class="divider-text">规则设置</span></el-divider>
      <el-form-item label="每人限领数量" required>
        <span v-if="viewOnly">{{ formData.rules.perLimited }}</span>
        <el-input-number v-else v-model="formData.rules.perLimited" :min="0" />
      </el-form-item>
      <el-form-item label="推广区域">
        <div v-if="viewOnly">
          <el-checkbox-group :value="formData.rules.scopes">
            <el-checkbox v-for="app in appScopes" :label="app.id" :key="app.id">
              {{ app.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div v-else>
          <el-checkbox v-model="checkAllScopes" :indeterminate="isScopesIndeterminate"
                       @change="handleCheckAllScopesChange">
            选择全部
          </el-checkbox>
          <el-checkbox-group v-model="formData.rules.scopes" @change="handleCheckedScopesChange">
            <el-checkbox v-for="app in appScopes" :label="app.id" :key="app.id">
              {{ app.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-form-item>
      <el-form-item label="优惠券类型">
        <span v-if="viewOnly">{{ formData.rules.couponRules.type | couponTypeFilter }}</span>
        <el-select v-else v-model="formData.rules.couponRules.type">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.rules.couponRules.type === 0" label="满减方式" required>
        <div style="display: flex; justify-content: start">
          <span style="margin-right: 10px">满</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.fullReduceCoupon.fullPrice }}</span>
            <el-input-number v-else v-model="formData.rules.couponRules.fullReduceCoupon.fullPrice" :min="0" />
          </el-form-item>
          <span style="margin: 0 10px">元 减</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.fullReduceCoupon.reducePrice }}</span>
            <el-input-number v-else v-model="formData.rules.couponRules.fullReduceCoupon.reducePrice" :min="0" />
          </el-form-item>
          <span style="margin: 0 10px">元</span>
        </div>
      </el-form-item>
      <el-form-item v-else-if="formData.rules.couponRules.type === 1" label="优惠券面值" required>
        <span v-if="viewOnly">{{ formData.rules.couponRules.cashCoupon.amount }}</span>
        <el-input-number v-else v-model="formData.rules.couponRules.cashCoupon.amount" :min="0" />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.couponRules.type === 2" label="优惠折扣" required>
        <span v-if="viewOnly">{{ formData.rules.couponRules.discountCoupon.discountRatio }}</span>
        <el-input-number v-else v-model="formData.rules.couponRules.discountCoupon.discountRatio"
                         :precision="2" :min="0" :step="0.05" :max="1" />
      </el-form-item>
      <el-form-item label="领取方式">
        <span v-if="viewOnly">{{ formData.rules.collect.type | couponCollectFilter }}</span>
        <el-select v-else v-model="formData.rules.collect.type">
          <el-option
            v-for="item in collectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.rules.collect.type === 3" label="所需积分">
        <span v-if="viewOnly">{{ formData.rules.collect.points }}</span>
        <el-input-number v-else v-model="formData.rules.collect.points" :min="0" />
      </el-form-item>
      <el-form-item label="可用商品范围" required>
        <span v-if="viewOnly">{{ formData.rules.scenario.type | couponScenarioFilter }}</span>
        <el-select v-else v-model="formData.rules.scenario.type">
          <el-option
            v-for="item in scenarioOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.rules.scenario.type === 1" label="活动商品" required>
        <span>已关联{{ formData.rules.scenario.couponSkus.length }}个商品(至多关联400个商品)</span>
        <coupon-goods key="include" :sku-id-list="formData.rules.scenario.couponSkus" :view-only="viewOnly"
                      @contentAdd="handleAddCouponSkus"
                      @contentDelete="handleDeleteCouponSkus" />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.scenario.type === 2" label="排除商品" required>
        <p>请确认是否要创建全场通用券,该券创建后可用于您发布的任何商品(排除商品除外)</p>
        <p>已排除{{ formData.rules.scenario.excludeSkus.length }}个商品(排除商品数量至多为100个)</p>
        <coupon-goods key="exclude" :sku-id-list="formData.rules.scenario.excludeSkus" :view-only="viewOnly"
                      @contentAdd="handleAddExcludeSkus"
                      @contentDelete="handleDeleteExcludeSkus" />
      </el-form-item>
      <el-form-item v-else>
        <div v-if="allCategoriesLoaded">
          <coupon-category v-for="(category, index) in formData.rules.scenario.categories" :key="'category-' + index"
                           :view-only="viewOnly"
                           :category-value="category"
                           :index="index"
                           @categorySet="handleSetCategory"
                           @categoryDelete="handleDeleteCategory" />
          <el-button type="primary" icon="el-icon-edit" :disabled="viewOnly"
                     @click="handleNewCategory">
            添加类别
          </el-button>
          <p>已排除{{ formData.rules.scenario.excludeSkus.length }}个商品(排除商品数量至多为100个)</p>
          <coupon-goods key="exclude" :sku-id-list="formData.rules.scenario.excludeSkus" :view-only="viewOnly"
                        @contentAdd="handleAddExcludeSkus"
                        @contentDelete="handleDeleteExcludeSkus" />
        </div>
        <div v-else-if="allCategoriesInLoading">
          <span>正在加载类别...</span>
        </div>
      </el-form-item>
      <el-form-item label="使用规则" class="form-item">
        <el-input type="textarea" resize="none" v-model="formData.rules.rulesDescription" :rows="4"
                  :readonly="viewOnly" />
      </el-form-item>
      <el-form-item label="优惠券概述" class="form-item">
        <ul style="list-style-type: decimal">
          <li>本券有效期为
            <span class="data-text">
              {{ formData.effectiveStartDate || 'xxxx-xx-xx xx:xx:xx' }}
            </span>至
            <span class="data-text">
              {{ formData.effectiveEndDate || 'xxxx-xx-xx xx:xx:xx'}}
            </span>
          </li>
          <li>
            本券发送总数为<span class="data-text">{{ formData.releaseTotal || 0 }}</span>张
          </li>
          <li>
            本券每人限领<span class="data-text">{{ formData.rules.perLimited || 0 }}</span>张
          </li>
          <li>
            本券为<span class="data-text">{{ formData.rules.couponRules.type | couponTypeFilter }}</span>，
            <span v-if="formData.rules.couponRules.type === 0">
              <span>满<span class="data-text">{{ formData.rules.couponRules.fullReduceCoupon.fullPrice }}</span>元减
                <span class="data-text">{{ formData.rules.couponRules.fullReduceCoupon.reducePrice }}</span>元</span>
            </span>
            <span v-else-if="formData.rules.couponRules.type === 1">
              <span>面值为
                <span class="data-text">{{ formData.rules.couponRules.cashCoupon.amount }}</span>
              </span>
            </span>
            <span v-else-if="formData.rules.couponRules.type === 2">
              <span>折扣为
                <span class="data-text">{{ formData.rules.couponRules.discountCoupon.discountRatio }}</span>
              </span>
            </span>
          </li>
        </ul>
      </el-form-item>
      <el-form-item>
        <el-button v-loading="inSubmitting" v-if="!viewOnly" type="primary" @click="handleSubmit">
          {{ createCoupon ? '创建' : '保存' }}
        </el-button>
        <el-button @click="handleCancel" :type="viewOnly ? 'primary' : 'default'">
          {{ viewOnly ? '确定' : '取消' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import merge from 'lodash/merge'
  import isEmpty from 'lodash/isEmpty'
  import isEqual from 'lodash/isEqual'
  import concat from 'lodash/concat'
  import difference from 'lodash/difference'
  import includes from 'lodash/includes'
  import moment from 'moment'
  import { validateURL } from '@/utils/validate'
  import CouponGoods from './couponGoods'
  import CouponCategory from './couponCategory'
  import ImageUpload from '@/components/Goods/ImageUpload'

  export default {
    name: 'CustomCoupon',
    components: { CouponGoods, CouponCategory, ImageUpload },
    filters: {
      couponTypeFilter: type => {
        switch (type) {
          case 0:
            return '满减券'
          case 1:
            return '代金券'
          case 2:
            return '折扣券'
        }
      },
      couponCollectFilter: type => {
        switch (type) {
          case 1:
            return '主动领取'
          case 2:
            return '主动发放'
          case 3:
            return '积分兑换'
        }
      },
      couponScenarioFilter: type => {
        switch (type) {
          case 1:
            return '指定商品类'
          case 2:
            return '全场类'
          case 3:
            return '类目品牌类'
        }
      }
    },
    data() {
      return {
        appScopes: [{
          id: '20190001',
          name: '无锡智慧城市',
        }, {
          id: '20190002',
          name: '北部湾智慧城市'
        }],
        typeOptions: [{
          value: 0,
          label: '满减券'
        }, {
          value: 1,
          label: '代金券'
        }, {
          value: 2,
          label: '折扣券'
        }],
        collectOptions: [{
          value: 1,
          label: '主动领取'
        }, {
          value: 2,
          label: '主动发放'
        }, {
          value: 3,
          label: '积分兑换'
        }],
        scenarioOptions: [{
          value: 1,
          label: '指定商品类'
        }, {
          value: 2,
          label: '全场类'
        }, {
          value: 3,
          label: '类目品牌类'

        }],
        createCoupon: false,
        viewOnly: true,
        couponId: -1,
        inSubmitting: false,
        checkAllScopes: false,
        isScopesIndeterminate: true,
        autoCode: true,
        tagInputVisible: false,
        tagInputValue: '',
        formData: {
          id: -1,
          name: '',
          releaseStartDate: null,
          releaseEndDate: null,
          releaseTotal: 0,
          effectiveStartDate: null,
          effectiveEndDate: null,
          excludeDates: [],
          category: null,
          tags: [],
          imageUrl: '',
          url: '',
          description: '',
          rules: {
            code: '',
            perLimited: 0,
            scopes: [],
            couponRules: {
              type: 0,
              fullReduceCoupon: {
                fullPrice: 0,
                reducePrice: 0
              },
              discountCoupon: {
                discountRatio: 1
              },
              cashCoupon: {
                amount: 0
              }
            },
            collect: {
              type: 1,
              points: 0
            },
            scenario: {
              type: 2,
              couponSkus: [],
              excludeSkus: [],
              categories: [],
              brands: []
            },
            rulesDescription: ''
          }
        },
        formRules: {
          name: [{
            required: true, trigger: 'change', validator: (rule, value, callback) => {
              if (value.length > 15) {
                callback(new Error('最多输入15个描述字符'))
              } else if (value.length < 3) {
                callback(new Error('最少输入3个描述字符'))
              } else {
                callback()
              }
            }
          }],
          code: [{
            required: true, trigger: 'change', validator: (rule, value, callback) => {
              if (this.autoCode) {
                callback()
              } else {
                if (isEmpty(value)) {
                  callback(new Error('请输入有效优惠券码'))
                } else {
                  callback()
                }
              }
            }
          }],
          releaseStartDate: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              if (value && this.formData.releaseEndDate &&
                moment(value).isAfter(this.formData.releaseEndDate)) {
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
          releaseEndDate: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              const now = moment()
              if (value && this.formData.releaseStartDate &&
                moment(value).isBefore(this.formData.releaseStartDate)) {
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
          category: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              if (value > 0) {
                callback()
              } else {
                callback(new Error('请选择此优惠券的类别'))
              }
            }
          }],
          url: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              if (validateURL(value)) {
                callback()
              } else {
                callback(new Error('请输入有效的链接地址'))
              }
            }
          }]
        }
      }
    },
    computed: {
      ...mapGetters({
        couponData: 'currentCoupon',
        allCategoriesOption: 'allCategoriesData',
        allCategoriesLoaded: 'allCategoriesLoaded',
        allCategoriesInLoading: 'allCategoriesInLoading'
      }),
      firstCategoryOptions: {
        get() {
          if (this.allCategoriesLoaded) {
            return this.allCategoriesOption.map(item => {
              return { categoryId: item.categoryId, categoryName: item.categoryName }
            })
          } else {
            return [{
              categoryId: -1,
              categoryName: '正在加载类别...'
            }]
          }
        }
      }
    },
    created() {
      if (isEqual(this.$route.name, 'CreateCoupon')) {
        this.createCoupon = true
        this.viewOnly = false
        this.$store.commit('resetCoupon')
      } else {
        this.couponId = this.$route.params.id
        if (this.$route.params.hasOwnProperty('readOnly')) {
          this.viewOnly = this.$route.params.readOnly
        }
        this.getCouponData()
      }
      this.getAllCategories()
    },
    methods: {
      backupCouponData() {
        this.formData.id = this.couponData.id
        this.formData.name = this.couponData.name.trim()
        this.formData.releaseStartDate = this.couponData.releaseStartDate.trim()
        this.formData.releaseEndDate = this.couponData.releaseEndDate.trim()
        this.formData.releaseTotal = this.couponData.releaseTotal
        this.formData.effectiveStartDate = this.couponData.effectiveStartDate.trim()
        this.formData.effectiveEndDate = this.couponData.effectiveEndDate.trim()
        if (!isEmpty(this.couponData.excludeDates)) {
          this.couponData.excludeDates.forEach(date => {
            const exclude = Object.assign({}, date)
            this.formData.excludeDates.push(exclude)
          })
        }
        this.formData.category = this.couponData.category
        if (!isEmpty(this.couponData.tags)) {
          this.couponData.tags.forEach(tag => this.formData.tags.push(tag.trim()))
        }
        if (this.couponData.imageUrl) {
          this.formData.imageUrl = this.couponData.imageUrl.trim()
        }
        if (this.couponData.url) {
          this.formData.url = this.couponData.url.trim()
        }
        if (this.couponData.description) {
          this.formData.description = this.couponData.description.trim()
        }
        this.formData.rules.code = this.couponData.rules.code.trim()
        this.formData.rules.perLimited = this.couponData.rules.perLimited
        if (!isEmpty(this.couponData.rules.scopes)) {
          this.couponData.rules.scopes.forEach(scope => this.formData.rules.scopes.push(scope.trim()))
          this.handleCheckedScopesChange(this.couponData.rules.scopes)
        }
        this.formData.rules.couponRules.type = this.couponData.rules.couponRules.type
        if (this.couponData.rules.couponRules.hasOwnProperty('fullReduceCoupon')) {
          this.formData.rules.couponRules.fullReduceCoupon.fullPrice =
            this.couponData.rules.couponRules.fullReduceCoupon.fullPrice
          this.formData.rules.couponRules.fullReduceCoupon.reducePrice =
            this.couponData.rules.couponRules.fullReduceCoupon.reducePrice
        }
        if (this.couponData.rules.couponRules.hasOwnProperty('discountCoupon')) {
          this.formData.rules.couponRules.discountCoupon.discountRatio =
            this.couponData.rules.couponRules.discountCoupon.discountRatio
        }
        if (this.couponData.rules.couponRules.hasOwnProperty('cashCoupon')) {
          this.formData.rules.couponRules.cashCoupon.amount =
            this.couponData.rules.couponRules.cashCoupon.amount
        }
        this.formData.rules.collect.type = this.couponData.rules.collect.type
        this.formData.rules.collect.points = this.couponData.rules.collect.points
        this.formData.rules.scenario.type = this.couponData.rules.scenario.type
        if (!isEmpty(this.couponData.rules.scenario.couponSkus)) {
          this.couponData.rules.scenario.couponSkus.forEach(sku =>
            this.formData.rules.scenario.couponSkus.push(sku.trim()))
        }
        if (!isEmpty(this.couponData.rules.scenario.excludeSkus)) {
          this.couponData.rules.scenario.excludeSkus.forEach(sku =>
            this.formData.rules.scenario.excludeSkus.push(sku.trim()))
        }
        if (!isEmpty(this.couponData.categories)) {
          this.couponData.rules.scenario.categories.forEach(category =>
            this.formData.rules.scenario.categories.push(category))
        }
        if (this.couponData.rules.rulesDescription) {
          this.formData.rules.rulesDescription = this.couponData.rules.rulesDescription.trim()
        }
      },
      async getCouponData() {
        try {
          await this.$store.dispatch('getCouponById', { id: this.couponId })
          this.backupCouponData()
        } catch (e) {
          this.$log.warn('Get coupon error:' + e)
        }
      },
      getAllCategories() {
        if (this.allCategoriesLoaded === false && this.allCategoriesInLoading === false) {
          this.$store.dispatch('getAllCategoryData', { offset: 1, limit: 100 }).then((total) => {
            this.$log.info(('Get Main Category ') + total)
          }).catch((error) => {
            this.$log.warn(('Get Main Category failed: ' + error))
          })
        }
      },
      handleAddExcludeDate() {
        this.formData.excludeDates.push({ start: null, end: null })
      },
      handleDeleteExcludeDate(index) {
        this.formData.excludeDates.splice(index, 1)
      },
      handleAddCouponSkus(skus) {
        if (this.formData.rules.scenario.couponSkus.length + skus.length <= 400) {
          this.formData.rules.scenario.couponSkus = concat(this.formData.rules.scenario.couponSkus, skus)
        } else {
          this.$message.warn('请重新选择活动商品，最多支持400个')
        }
      },
      handleDeleteCouponSkus(skus) {
        this.formData.rules.scenario.couponSkus = difference(this.formData.rules.scenario.couponSkus, skus)
      },
      handleAddExcludeSkus(skus) {
        if (this.formData.rules.scenario.excludeSkus.length + skus.length <= 100) {
          this.formData.rules.scenario.excludeSkus = concat(this.formData.rules.scenario.excludeSkus, skus)
        } else {
          this.$message.warn('请重新选择活动排除商品，最多支持100个')
        }
      },
      handleDeleteExcludeSkus(skus) {
        this.formData.rules.scenario.excludeSkus = difference(this.formData.rules.scenario.excludeSkus, skus)
      },
      handleNewCategory() {
        if (this.formData.rules.scenario.categories.length >= 5) {
          this.$message.warning('最多增加5条类别信息')
        } else {
          this.formData.rules.scenario.categories.push(-1)
        }
      },
      handleSetCategory(index, value) {
        if (includes(this.formData.rules.scenario.categories, value)) {
          this.$message.warn('此类别已添加，请选择其它类别')
        } else {
          this.formData.rules.scenario.categories[index] = value
        }
      },
      handleDeleteCategory(index) {
        this.formData.rules.scenario.categories.splice(index, 1)
      },
      async handleCreateCoupon() {
        const data = {}
        merge(data, this.formData)
        data.supplierMerchantId = 0
        data.supplierMerchantName = ''
        if (data.rules.scenario.type === 1) {
          data.rules.scenario.excludeSkus = []
          data.rules.scenario.categories = []
        } else {
          data.rules.scenario.couponSkus = []
        }
        const now = moment()
        const startDate = moment(data.releaseStartDate)
        if (startDate.isBefore(now)) {
          data.status = 1
        } else if (startDate.isAfter(now)) {
          data.status = 2
        }
        if (this.autoCode) {
          data.rules.code = ''
        }
        this.inSubmitting = true
        try {
          await this.$store.dispatch('createCoupon', data)
          this.$router.go(-1)
        } catch (e) {
          this.$log.warn('Create coupon:' + e)
        } finally {
          this.inSubmitting = false
        }
      },
      async handleUpdateCoupon() {
        const diff = { id: this.formData.id }
        let hasDiff = false
        Object.keys(this.formData).forEach(key => {
          if (isEqual(this.formData[key], this.couponData[key]) === false) {
            if (key !== 'rules') {
              diff[key] = this.formData[key]
            } else {
              diff.rules = {}
              Object.keys(this.formData.rules).forEach(ruleKey => {
                if (!isEqual(this.formData.rules[ruleKey], this.couponData.rules[ruleKey])) {
                  diff.rules[ruleKey] = this.formData.rules[ruleKey]
                }
              })
            }
            hasDiff = true
          }
        })
        if (hasDiff) {
          if (diff.hasOwnProperty('rules') && diff.rules.hasOwnProperty('scenario')) {
            if (diff.rules.scenario.type === 1) {
              diff.rules.scenario.excludeSkus = []
              diff.rules.scenario.categories = []
            } else {
              diff.rules.scenario.couponSkus = []
            }
          }
          try {
            await this.$store.dispatch('updateCoupon', diff)
            this.$router.go(-1)
          } catch (e) {
            this.$log.warn('Update coupon:' + e)
          }
        }
      },
      handleSubmit() {
        this.$refs['couponForm'].validate((valid) => {
          if (valid) {
            if (this.createCoupon) {
              this.handleCreateCoupon()
            } else {
              this.handleUpdateCoupon()
            }
          } else {
            this.$message.warning('请检查输入错误的优惠券信息')
          }
        })
      },
      handleCancel() {
        this.$router.go(-1)
      },
      handleCheckAllScopesChange(value) {
        this.isScopesIndeterminate = false
        this.formData.rules.scopes = value ? this.appScopes.map(app => app.id) : []
      },
      handleCheckedScopesChange(scopes) {
        const checkedCount = scopes.length
        this.checkAllScopes = checkedCount === this.appScopes.length
        this.isScopesIndeterminate = checkedCount > 0 && checkedCount < this.appScopes.length
      },
      handleCloseTag(tag) {
        const index = this.formData.tags.indexOf(tag)
        this.formData.tags.splice(index, 1);
      },
      handleTagInputConfirm() {
        const inputValue = this.tagInputValue;
        if (inputValue) {
          this.formData.tags.push(inputValue);
        }
        this.tagInputVisible = false;
        this.tagInputValue = '';
      },
      showTagInput() {
        this.tagInputVisible = true;
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      handleImageUrlChanged(url) {
        this.formData.imageUrl = url
      }
    }
  }
</script>

<style scoped>
  .el-tag + .el-tag {
    margin-left: 10px;
  }

  .form-item {
    width: 80%;
  }

  .divider-text {
    font-weight: bold;
    font-size: 18px;
  }

  .data-text {
    font-weight: bold;
    background: lightgray;
  }

  .button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>

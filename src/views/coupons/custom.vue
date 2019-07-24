<template>
  <div v-loading="dataLoading" class="app-container">
    <el-form ref="couponForm" :model="formData" :rules="viewOnly ? {} : formRules" label-width="120px">
      <el-divider content-position="left"><span class="divider-text">基础信息</span></el-divider>
      <el-form-item label="优惠券供应商" prop="supplierMerchantId">
        <span v-if="viewOnly">{{ formData.supplierMerchantName }}</span>
        <el-select
          v-else
          :value="selectVendorId"
          style="width: 50%"
          @change="onMerchantChanged"
        >
          <el-option
            v-for="item in vendorOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠券名称" prop="name">
        <el-input v-model="formData.name" :readonly="viewOnly" style="width: 350px" maxlength="20" />
      </el-form-item>
      <el-form-item label="优惠券编码" prop="code">
        <div v-if="createCoupon">
          <el-checkbox v-model="autoCode">自动生成优惠券编码</el-checkbox>
          <el-input v-if="!autoCode" v-model="formData.rules.code" style="width: 350px" />
        </div>
        <span v-else>{{ formData.rules.code }}</span>
      </el-form-item>
      <el-form-item label="上线日期" required>
        <div style="display: flex; justify-content: start">
          <el-form-item prop="releaseStartDate">
            <el-date-picker
              v-model="formData.releaseStartDate"
              type="datetime"
              :readonly="viewOnly"
              placeholder="选择开始日期和时间"
              default-time="00:00:00"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="releaseEndDate">
            <el-date-picker
              v-model="formData.releaseEndDate"
              type="datetime"
              :readonly="viewOnly"
              placeholder="选择结束日期和时间"
              default-time="23:59:59"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="font-size: 12px;margin-left: 10px">用户可查看和领取的日期区间</span>
        </div>
      </el-form-item>
      <el-form-item label="发放总数" required>
        <span v-if="viewOnly || isManualCollect">{{ formData.releaseTotal }}</span>
        <el-input-number v-else v-model="formData.releaseTotal" :min="1" :max="1000000" />
      </el-form-item>
      <el-form-item label="有效日期" required>
        <div style="display: flex; justify-content: start">
          <el-form-item prop="effectiveStartDate">
            <el-date-picker
              v-model="formData.effectiveStartDate"
              type="datetime"
              :readonly="viewOnly"
              placeholder="选择开始日期和时间"
              default-time="00:00:00"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="effectiveEndDate">
            <el-date-picker
              v-model="formData.effectiveEndDate"
              type="datetime"
              :readonly="viewOnly"
              placeholder="选择结束日期和时间"
              default-time="23:59:59"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="font-size: 12px;margin-left: 10px">用户可使用的日期区间</span>
        </div>
      </el-form-item>
      <el-form-item label="排除日期">
        <div>
          为有效期间的排除日期，禁止用户使用，最多支持5个区间
          <div
            v-for="(exclude, index) in formData.excludeDates"
            :key="`exclude-${index}`"
            style="display: flex; justify-content: start;margin-bottom: 10px"
          >
            <el-form-item>
              <el-date-picker
                v-model="exclude.start"
                type="datetime"
                :readonly="viewOnly"
                placeholder="选择开始日期和时间"
                default-time="00:00:00"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
            <span style="margin: 0 10px">至</span>
            <el-form-item>
              <el-date-picker
                v-model="exclude.end"
                type="datetime"
                :readonly="viewOnly"
                placeholder="选择结束日期和时间"
                default-time="23:59:59"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
            <el-button
              v-if="!viewOnly"
              type="danger"
              icon="el-icon-delete"
              style="margin-left: 10px"
              @click="handleDeleteExcludeDate(index)"
            >
              删除
            </el-button>
          </div>
          <div>
            <el-button
              v-if="!viewOnly"
              :disabled="formData.excludeDates.length >= 5"
              type="primary"
              icon="el-icon-edit"
              @click="handleAddExcludeDate"
            >
              添加
            </el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="优惠券类别" prop="category">
        <el-select
          :value="formData.category"
          :disabled="viewOnly"
          clearable
          placeholder="选择类别"
          @change="onCategoryChanged"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.categoryId"
            :label="item.categoryName"
            :value="item.categoryId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="优惠券标签">
        <span v-if="couponTags.length > 0">
          <el-tag
            v-for="tag in formData.tags"
            :key="tag"
            :disable-transitions="false"
            :closable="!viewOnly"
            @close="handleCloseTag(tag)"
          >
            {{ getCouponTagName(tag) }}
          </el-tag>
        </span>
        <el-select
          v-if="!viewOnly && tagInputVisible"
          :value="tagSelected"
          placeholder="选择标签"
          class="input-new-select"
          @change="handleTagSelected"
        >
          <el-option
            v-for="item in couponTags"
            :key="item.name"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <el-button v-if="!viewOnly && tagInputVisible" class="button-tag" @click="tagInputVisible = false">
          取消
        </el-button>
        <el-button v-else-if="!viewOnly" class="button-tag" @click="showTagInput">+ 新标签</el-button>
      </el-form-item>
      <el-form-item label="优惠券图片">
        <image-upload
          path-name="coupons"
          image-width="200px"
          :image-url="formData.imageUrl"
          :view-only="viewOnly"
          @success="handleImageUrlChanged"
        />
      </el-form-item>
      <el-form-item label="优惠券链接" class="form-item" prop="url">
        <coupon-url
          :url="formData.url"
          :read-only="viewOnly"
          :first-class-category="formData.category"
          @urlChanged="handleCouponUrlChanged"
        />
      </el-form-item>
      <el-form-item label="优惠券描述" prop="description" class="form-item">
        <el-input
          v-model="formData.description"
          type="textarea"
          resize="none"
          :rows="4"
          :readonly="viewOnly"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-divider content-position="left"><span class="divider-text">规则设置</span></el-divider>
      <el-form-item label="每人限领数量" required>
        <span v-if="viewOnly">{{ formData.rules.perLimited }}</span>
        <el-input-number v-else v-model="formData.rules.perLimited" :min="1" :max="1000000" />
      </el-form-item>
      <el-form-item label="推广区域">
        <div v-if="viewOnly">
          <el-checkbox-group :value="formData.rules.scopes">
            <el-checkbox v-for="app in appScopes" :key="app.id" :label="app.id">
              {{ app.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        <div v-else>
          <el-checkbox
            v-model="checkAllScopes"
            :indeterminate="isScopesIndeterminate"
            @change="handleCheckAllScopesChange"
          >
            选择全部
          </el-checkbox>
          <el-checkbox-group v-model="formData.rules.scopes" @change="handleCheckedScopesChange">
            <el-checkbox v-for="app in appScopes" :key="app.id" :label="app.id">
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
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.rules.couponRules.type === 0" label="满减方式" required>
        <div style="display: flex; justify-content: start">
          <span style="margin-right: 10px">满</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.fullReduceCoupon.fullPrice }}</span>
            <el-input-number v-else v-model="formData.rules.couponRules.fullReduceCoupon.fullPrice" :min="1" />
          </el-form-item>
          <span style="margin: 0 10px">元 减</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.fullReduceCoupon.reducePrice }}</span>
            <el-input-number
              v-else
              v-model="formData.rules.couponRules.fullReduceCoupon.reducePrice"
              :min="1"
              :max="formData.rules.couponRules.fullReduceCoupon.fullPrice"
            />
          </el-form-item>
          <span style="margin: 0 10px">元</span>
        </div>
      </el-form-item>
      <el-form-item v-else-if="formData.rules.couponRules.type === 1" label="优惠券面值" required>
        <span v-if="viewOnly">{{ formData.rules.couponRules.cashCoupon.amount }}</span>
        <el-input-number v-else v-model="formData.rules.couponRules.cashCoupon.amount" :min="0" />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.couponRules.type === 2" label="优惠折扣" required>
        <div style="display: flex; justify-content: start">
          <span style="margin-right: 10px">满</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.discountCoupon.fullPrice }}</span>
            <el-input-number v-else v-model="formData.rules.couponRules.discountCoupon.fullPrice" :min="0" />
          </el-form-item>
          <span style="margin: 0 10px">元 可用折扣：</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.discountCoupon.discountRatio }}</span>
            <el-input-number
              v-else
              v-model="formData.rules.couponRules.discountCoupon.discountRatio"
              :precision="2"
              :min="0"
              :step="0.05"
              :max="1"
            />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="领取方式">
        <span v-if="viewOnly">{{ formData.rules.collect.type | couponCollectFilter }}</span>
        <el-select v-else v-model="formData.rules.collect.type">
          <el-option
            v-for="item in collectOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
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
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.rules.scenario.type === 1" label="活动商品" required>
        <span>已关联{{ formData.rules.scenario.couponMpus.length }}个商品(至多关联400个商品)</span>
        <coupon-goods
          key="include"
          :mpu-list="formData.rules.scenario.couponMpus"
          :first-class-category="formData.category"
          :view-only="viewOnly"
          @contentAdd="handleAddCouponMpus"
          @contentDelete="handleDeleteCouponMpus"
        />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.scenario.type === 2" label="排除商品" required>
        <p>请确认是否要创建全场通用券,该券创建后可用于您发布的任何商品(排除商品除外)</p>
        <p>已排除{{ formData.rules.scenario.excludeMpus.length }}个商品(排除商品数量至多为100个)</p>
        <coupon-goods
          key="exclude"
          :mpu-list="formData.rules.scenario.excludeMpus"
          :view-only="viewOnly"
          @contentAdd="handleAddExcludeMpus"
          @contentDelete="handleDeleteExcludeMpus"
        />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.scenario.type === 3" label="活动类别" required>
        <div v-if="categoriesLoaded">
          <coupon-category
            v-for="(category, index) in formData.rules.scenario.categories"
            :key="'category-' + index"
            :view-only="viewOnly"
            :preset-first-category="formData.category"
            :category-value="category"
            :index="index"
            @categorySet="handleSetCategory"
            @categoryDelete="handleDeleteCategory"
          />
          <el-button
            type="primary"
            icon="el-icon-edit"
            :disabled="viewOnly"
            @click="handleNewCategory"
          >
            添加类别
          </el-button>
          <p>已排除{{ formData.rules.scenario.excludeMpus.length }}个商品(排除商品数量至多为100个)</p>
          <coupon-goods
            key="exclude"
            :mpu-list="formData.rules.scenario.excludeMpus"
            :first-class-category="formData.category"
            :view-only="viewOnly"
            @contentAdd="handleAddExcludeMpus"
            @contentDelete="handleDeleteExcludeMpus"
          />
        </div>
        <div v-else-if="categoriesLoading">
          <span>正在加载类别...</span>
        </div>
      </el-form-item>
      <el-form-item label="使用规则" class="form-item">
        <el-input
          v-model="formData.rules.rulesDescription"
          type="textarea"
          resize="none"
          :rows="4"
          :readonly="viewOnly"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>
      <el-form-item label="优惠券概述" class="form-item">
        <ul style="list-style-type: decimal">
          <li>本券有效期为
            <span class="data-text">
              {{ formData.effectiveStartDate || 'xxxx-xx-xx xx:xx:xx' }}
            </span>至
            <span class="data-text">
              {{ formData.effectiveEndDate || 'xxxx-xx-xx xx:xx:xx' }}
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
              <span>满</span>
              <span class="data-text">{{ formData.rules.couponRules.fullReduceCoupon.fullPrice }}</span>元
              <span>折扣为
                <span class="data-text">{{ formData.rules.couponRules.discountCoupon.discountRatio }}</span>
              </span>
            </span>
            <span style="margin-left: 10px; font-size: 12px">说明：满额数为0元表示不限制总额数</span>
          </li>
        </ul>
      </el-form-item>
      <el-form-item>
        <el-button :type="viewOnly ? 'primary' : 'default'" @click="handleCancel">
          {{ viewOnly ? '确定' : '取消' }}
        </el-button>
        <el-button v-if="!viewOnly" v-loading="inSubmitting" type="primary" @click="handleSubmit">
          {{ createCoupon ? '创建' : '保存' }}
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
import includes from 'lodash/includes'
import filter from 'lodash/filter'
import concat from 'lodash/concat'
import moment from 'moment'
import { validateURL } from '@/utils/validate'
import CouponGoods from './goods'
import CouponCategory from './category'
import CouponUrl from './couponUrl'
import ImageUpload from '@/components/ImageUpload'
import {
  getCouponTagsApi,
  getCouponByIdApi,
  createCouponApi,
  updateCouponApi
} from '@/api/coupons'
import { getVendorListApi } from '@/api/vendor'
import { vendor_status_approved } from '@/utils/constants'
import {
  CouponAppScopes,
  CouponTypeOptions,
  CouponCollectOptions,
  CouponScenarioOptions
} from './constants'

export default {
  name: 'CustomCoupon',
  components: { CouponGoods, CouponCategory, ImageUpload, CouponUrl },
  filters: {
    couponTypeFilter: type => {
      const item = CouponTypeOptions.find(coupon => coupon.value === type)
      return item ? item.label : ''
    },
    couponCollectFilter: type => {
      const item = CouponCollectOptions.find(coupon => coupon.value === type)
      return item ? item.label : ''
    },
    couponScenarioFilter: type => {
      const item = CouponScenarioOptions.find(coupon => coupon.value === type)
      return item ? item.label : ''
    }
  },
  data() {
    return {
      appScopes: CouponAppScopes,
      typeOptions: CouponTypeOptions,
      collectOptions: CouponCollectOptions,
      scenarioOptions: CouponScenarioOptions,
      selectVendorId: null,
      vendorOptions: [],
      dataLoading: false,
      createCoupon: false,
      viewOnly: true,
      couponDataLoaded: false,
      couponId: -1,
      inSubmitting: false,
      checkAllScopes: false,
      isScopesIndeterminate: true,
      autoCode: true,
      couponTags: [],
      tagInputVisible: false,
      tagInputValue: '',
      tagSelected: null,
      couponData: null,
      formData: {
        name: '',
        supplierMerchantId: null,
        supplierMerchantName: null,
        releaseStartDate: null,
        releaseEndDate: null,
        releaseTotal: 0,
        effectiveStartDate: null,
        effectiveEndDate: null,
        excludeDates: [],
        category: null,
        tags: [],
        imageUrl: '',
        url: 'route://listing',
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
              fullPrice: 0,
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
            type: 1,
            couponMpus: [],
            excludeMpus: [],
            categories: [],
            brands: []
          },
          rulesDescription: ''
        }
      },
      formRules: {
        supplierMerchantId: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择的优惠券供应商'))
            } else {
              callback()
            }
          }
        }],
        name: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入有效的优惠券名称'))
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
                const now = moment()
                if (moment(value).isBefore(now)) {
                  callback(new Error('开始时间必须晚于当前时间'))
                } else {
                  callback()
                }
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
                const now = moment()
                if (moment(value).isBefore(now)) {
                  callback(new Error('开始时间必须晚于当前时间'))
                } else if (this.formData.releaseStartDate &&
                  moment(value).isBefore(this.formData.releaseStartDate)) {
                  callback(new Error('有效开始时间必须晚于上线开始时间'))
                } else {
                  callback()
                }
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
            if (value.startsWith('aggregation://') ||
              value.startsWith('route://') ||
              validateURL(value)) {
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
      categoriesOption: 'categories',
      categoriesLoaded: 'categoriesLoaded',
      categoriesLoading: 'categoriesLoading'
    }),
    categoryOptions: {
      get() {
        if (this.categoriesLoaded) {
          return this.categoriesOption.map(item => {
            return { categoryId: item.categoryId, categoryName: item.categoryName }
          })
        } else {
          return [{
            categoryId: -1,
            categoryName: '正在加载类别...'
          }]
        }
      }
    },
    isManualCollect: {
      get() {
        // 优惠券的领取方式为人工分配，需要批量生成或导入
        return this.couponDataLoaded ? this.couponData.rules.collect.type === 4 : false
      }
    }
  },
  created() {
    if (isEqual(this.$route.name, 'CreateCoupon')) {
      this.createCoupon = true
      this.viewOnly = false
    } else {
      this.couponId = this.$route.params.id
      if ('readOnly' in this.$route.params) {
        this.viewOnly = this.$route.params.readOnly
      }
      this.getCouponData()
    }
    this.getVendorList()
    this.getCouponTags()
    this.getAllCategories()
  },
  methods: {
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 100,
          status: vendor_status_approved
        }
        this.dataLoading = true
        const data = await getVendorListApi(params)
        this.vendorOptions = data.rows.map(row => {
          return {
            value: row.company.id.toString(),
            label: row.company.name
          }
        })
      } catch (e) {
        console.warn('Coupon get vendor list error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getCouponTags() {
      try {
        this.dataLoading = true
        const { data } = await getCouponTagsApi({ offset: 1, limit: 100 })
        this.couponTags = data.result.list
      } catch (e) {
        console.warn('getCouponTags: ' + e)
      } finally {
        this.dataLoading = false
      }
    },
    getCouponTagName(tagId) {
      const item = this.couponTags.find(tag => tag.id === tagId)
      return item ? item.name : ''
    },
    backupCouponData() {
      this.formData.name = this.couponData.name
      if (this.couponData.supplierMerchantId !== null) {
        this.selectVendorId = this.couponData.supplierMerchantId
        this.couponData.supplierMerchantId = Number.parseInt(this.selectVendorId)
        this.formData.supplierMerchantId = Number.parseInt(this.selectVendorId)
      }
      this.formData.supplierMerchantName = this.couponData.supplierMerchantName
      this.formData.releaseStartDate = this.couponData.releaseStartDate
      this.formData.releaseEndDate = this.couponData.releaseEndDate
      this.formData.releaseTotal = this.couponData.releaseTotal
      this.formData.effectiveStartDate = this.couponData.effectiveStartDate
      this.formData.effectiveEndDate = this.couponData.effectiveEndDate
      this.formData.imageUrl = this.couponData.imageUrl
      this.formData.url = this.couponData.url
      this.formData.description = this.couponData.description
      this.formData.category = this.couponData.category
      if (Array.isArray(this.couponData.excludeDates)) {
        const items = this.couponData.excludeDates.filter(date => !isEmpty(date))
        this.couponData.excludeDates = [...items]
        this.formData.excludeDates = [...items]
      }
      if (Array.isArray(this.couponData.tags)) {
        const items = this.couponData.tags.filter(tag => Number.isSafeInteger(tag))
        this.couponData.tags = [...items]
        this.formData.tags = [...items]
      } else {
        this.couponData.tags = []
      }
      this.formData.rules.code = this.couponData.rules.code
      this.formData.rules.perLimited = this.couponData.rules.perLimited
      if (Array.isArray(this.couponData.rules.scopes)) {
        const items = this.couponData.rules.scopes.filter(scope => !isEmpty(scope))
        this.couponData.rules.scopes = [...items]
        this.formData.rules.scopes = [...items]
        this.handleCheckedScopesChange(this.formData.rules.scopes)
      }
      this.formData.rules.couponRules.type = this.couponData.rules.couponRules.type
      if ('fullReduceCoupon' in this.couponData.rules.couponRules) {
        this.formData.rules.couponRules.fullReduceCoupon.fullPrice =
          this.couponData.rules.couponRules.fullReduceCoupon.fullPrice
        this.formData.rules.couponRules.fullReduceCoupon.reducePrice =
          this.couponData.rules.couponRules.fullReduceCoupon.reducePrice
      }
      if ('discountCoupon' in this.couponData.rules.couponRules) {
        this.formData.rules.couponRules.discountCoupon.discountRatio =
          this.couponData.rules.couponRules.discountCoupon.discountRatio
        this.formData.rules.couponRules.discountCoupon.fullPrice =
          this.couponData.rules.couponRules.discountCoupon.fullPrice
      }
      if ('cashCoupon' in this.couponData.rules.couponRules) {
        this.formData.rules.couponRules.cashCoupon.amount =
          this.couponData.rules.couponRules.cashCoupon.amount
      }
      this.formData.rules.collect.type = this.couponData.rules.collect.type
      this.formData.rules.collect.points = this.couponData.rules.collect.points
      this.formData.rules.scenario.type = this.couponData.rules.scenario.type
      if (Array.isArray(this.couponData.rules.scenario.couponMpus)) {
        const items = this.couponData.rules.scenario.couponMpus.filter(mpu => !isEmpty(mpu))
        this.couponData.rules.scenario.couponMpus = [...items]
        this.formData.rules.scenario.couponMpus = [...items]
      }
      if (Array.isArray(this.couponData.rules.scenario.excludeMpus)) {
        const items = this.couponData.rules.scenario.excludeMpus.filter(mpu => !isEmpty(mpu))
        this.couponData.rules.scenario.excludeMpus = [...items]
        this.formData.rules.scenario.excludeMpus = [...items]
      }
      if (Array.isArray(this.couponData.rules.scenario.categories)) {
        const items = this.couponData.rules.scenario.categories.filter(category => !isEmpty(category))
        const categories = items.map(category => Number.parseInt(category))
        this.couponData.rules.scenario.categories = [...categories]
        this.formData.rules.scenario.categories = [...categories]
      }
      this.formData.rules.rulesDescription = this.couponData.rules.rulesDescription
    },
    async getCouponData() {
      try {
        this.dataLoading = true
        this.couponDataLoaded = false
        const { data } = await getCouponByIdApi({ id: this.couponId })
        this.couponData = data.result
        const category = Number.parseInt(this.couponData.category)
        if (!Number.isNaN(category)) {
          this.couponData.category = category
        }
        this.backupCouponData()
        this.couponDataLoaded = true
      } catch (e) {
        console.warn('Get coupon error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getAllCategories() {
      if (this.categoriesLoaded === false && this.categoriesLoading === false) {
        try {
          this.dataLoading = true
          await this.$store.dispatch('categories/getAllData')
        } catch (e) {
          console.log(('Get Main Category failed: ' + e))
        } finally {
          this.dataLoading = false
        }
      }
    },
    handleAddExcludeDate() {
      this.formData.excludeDates.push({ start: null, end: null })
    },
    handleDeleteExcludeDate(index) {
      this.formData.excludeDates.splice(index, 1)
    },
    handleAddCouponMpus(mpus) {
      const filterMpus = filter(mpus, mpu => !includes(this.formData.rules.scenario.couponMpus, mpu))
      if (this.formData.rules.scenario.couponMpus.length + filterMpus.length <= 400) {
        this.formData.rules.scenario.couponMpus = concat(this.formData.rules.scenario.couponMpus, filterMpus)
      } else {
        this.$message.warn('请重新选择活动商品，最多支持400个')
      }
    },
    handleDeleteCouponMpus(mpus) {
      const currents = this.formData.rules.scenario.couponMpus
      this.formData.rules.scenario.couponMpus = currents.filter(mpu => !mpus.includes(mpu))
    },
    handleAddExcludeMpus(mpus) {
      const filterMpus = filter(mpus, mpu => !includes(this.formData.rules.scenario.excludeMpus, mpu))
      if (this.formData.rules.scenario.excludeMpus.length + filterMpus.length <= 100) {
        this.formData.rules.scenario.excludeMpus = concat(this.formData.rules.scenario.excludeMpus, filterMpus)
      } else {
        this.$message.warn('请重新选择活动排除商品，最多支持100个')
      }
    },
    handleDeleteExcludeMpus(mpus) {
      const currents = this.formData.rules.scenario.excludeMpus
      this.formData.rules.scenario.excludeMpus = currents.filter(mpu => !mpus.includes(mpu))
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
    reviseScenarioRules(data) {
      if ('rules' in data && 'scenario' in data.rules) {
        switch (data.rules.scenario.type) {
          case 1: // 特定商品类
            data.rules.scenario.excludeMpus = []
            data.rules.scenario.categories = []
            break
          case 2: // 全场类
            data.rules.scenario.couponMpus = []
            data.rules.scenario.categories = []
            break
          case 3: // 特定类别类
            data.rules.scenario.couponMpus = []
            data.rules.scenario.categories = data.rules.scenario.categories.filter(category => category !== -1)
            break
          case 4: // 特定服务类
            data.rules.scenario.couponMpus = []
            data.rules.scenario.excludeMpus = []
            data.rules.scenario.categories = []
            break
        }
      }
    },
    reviseCouponStatus(data) {
      if ('rules' in data && 'collect' in data.rules && 'type' in data.rules.collect) {
        if (data.rules.collect.type === 4) { // 领取方式为人工分配，状态应为‘待分配’
          data.status = 4
        }
      }
      if ('status' in data && data.status !== 4 &&
        'releaseStartDate' in data) {
        const now = moment()
        const startDate = moment(data.releaseStartDate)
        if (startDate.isBefore(now)) {
          data.status = 2
        } else if (startDate.isAfter(now)) {
          data.status = 1
        }
      }
    },
    async handleCreateCoupon() {
      const params = {}
      merge(params, this.formData)
      if (this.autoCode) {
        params.rules.code = ''
      }
      this.reviseCouponStatus(params)
      this.reviseScenarioRules(params)
      this.inSubmitting = true
      try {
        const { data } = await createCouponApi(params)
        const id = data.couponId
        if (params.rules.collect.type === 4) {
          this.$router.replace({
            name: 'CouponUsages',
            params: { id }
          })
        } else {
          this.$router.go(-1)
        }
      } catch (e) {
        console.warn('Create coupon:' + e)
      } finally {
        this.inSubmitting = false
      }
    },
    async handleUpdateCoupon() {
      const diff = { id: this.couponData.id }
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
        this.reviseCouponStatus(diff)
        this.reviseScenarioRules(diff)
        try {
          this.inSubmitting = true
          await updateCouponApi(diff)
          this.$router.go(-1)
        } catch (e) {
          console.warn('Update coupon:' + e)
        } finally {
          this.inSubmitting = false
        }
      }
    },
    createOrUpdateCoupon() {
      if (this.createCoupon) {
        this.handleCreateCoupon()
      } else {
        this.handleUpdateCoupon()
      }
    },
    async handleSubmit() {
      try {
        const valid = await this.$refs['couponForm'].validate()
        if (valid) {
          if (this.formData.rules.collect.type === 4) {
            await this.$confirm('此优惠券的领取方式为人工分配，需要提前批量生成或导入用户券码。是否继续？', '提示', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'info'
            })
            this.createOrUpdateCoupon()
          } else {
            this.createOrUpdateCoupon()
          }
        } else {
          this.$message.warning('请检查输入错误的优惠券信息')
        }
      } catch (e) {
        console.warn('Coupon form ' + e)
        this.$message.warning('请检查输入错误的优惠券信息')
      }
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
      this.formData.tags.splice(index, 1)
    },
    handleTagInputConfirm() {
      const inputValue = this.tagInputValue
      if (!isEmpty(inputValue) && !includes(this.formData.tags, inputValue)) {
        this.formData.tags.push(inputValue)
      }
      this.tagInputVisible = false
      this.tagInputValue = ''
    },
    showTagInput() {
      this.tagInputVisible = true
      /*
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
         */
    },
    handleImageUrlChanged(url) {
      this.formData.imageUrl = url
    },
    handleTagSelected(value) {
      if (!includes(this.formData.tags, value)) {
        this.formData.tags.push(value)
      }
      this.tagSelected = null
      this.tagInputVisible = false
    },
    handleCouponUrlChanged(data) {
      this.formData.url = data.url
      if (data.url.startsWith('route://commodity')) {
        const mpu = data.url.substring('route://commodity/'.length)
        if (!isEmpty(mpu)) {
          this.formData.rules.scenario.type = 1
          this.formData.rules.scenario.couponMpus = [mpu]
        }
      }
    },
    onMerchantChanged(value) {
      this.selectVendorId = value
      this.formData.supplierMerchantId = isEmpty(value) ? null : Number.parseInt(value)
      this.formData.supplierMerchantName =
        isEmpty(value) ? null : this.vendorOptions.find(vendor => vendor.value === value).label
    },
    onCategoryChanged(value) {
      const id = Number.parseInt(value)
      if (Number.isNaN(id)) {
        this.formData.category = null
      } else {
        this.formData.category = id
        this.formData.rules.scenario.categories = []
      }
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

  .button-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-select {
    width: 120px;
    margin-left: 10px;
  }

  .input-new-tag {
    width: 90px;
    margin: 0 10px;
    vertical-align: bottom;
  }
</style>

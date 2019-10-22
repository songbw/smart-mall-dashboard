<template>
  <div v-loading="dataLoading" class="app-container">
    <el-form ref="couponForm" :model="formData" :rules="viewOnly ? {} : formRules" label-width="120px">
      <el-divider content-position="left"><span class="divider-text">基础信息</span></el-divider>
      <el-form-item label="优惠券供应商" prop="supplierMerchantId">
        <span v-if="viewOnly">{{ formData.supplierMerchantName }}</span>
        <el-select
          v-else
          :value="selectVendor"
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
        <el-input
          :value="formData.name"
          :readonly="viewOnly"
          maxlength="30"
          style="width: 350px"
          @input="value => formData.name = value.trim()"
        />
      </el-form-item>
      <el-form-item label="优惠券编码" prop="code">
        <div v-if="createCoupon">
          <el-checkbox v-model="autoCode">自动生成优惠券编码</el-checkbox>
          <el-input
            v-if="!autoCode"
            :value="formData.rules.code"
            style="width: 350px"
            maxlength="50"
            @input="value => formData.rules.code = value.trim()"
          />
        </div>
        <span v-else>{{ formData.rules.code }}</span>
      </el-form-item>
      <el-form-item label="上线日期">
        <div style="display: flex; justify-content: start">
          <el-form-item prop="releaseStartDate">
            <el-date-picker
              v-model="formData.releaseStartDate"
              :readonly="viewOnly"
              default-time="00:00:00"
              placeholder="选择开始日期和时间"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="releaseEndDate">
            <el-date-picker
              v-model="formData.releaseEndDate"
              :readonly="viewOnly"
              default-time="23:59:59"
              placeholder="选择结束日期和时间"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="font-size: 12px;margin-left: 10px">用户可查看和领取的日期区间</span>
        </div>
      </el-form-item>
      <el-form-item label="发放总数" prop="releaseTotal">
        <span v-if="viewOnly || isManualCollect">{{ formData.releaseTotal }}</span>
        <el-input-number v-else v-model="formData.releaseTotal" :max="1000000" :min="1" step-strictly />
      </el-form-item>
      <el-form-item label="有效日期">
        <div style="display: flex; justify-content: start">
          <el-form-item prop="effectiveStartDate">
            <el-date-picker
              v-model="formData.effectiveStartDate"
              :readonly="viewOnly"
              default-time="00:00:00"
              placeholder="选择开始日期和时间"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="effectiveEndDate">
            <el-date-picker
              v-model="formData.effectiveEndDate"
              :readonly="viewOnly"
              default-time="23:59:59"
              placeholder="选择结束日期和时间"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
            />
          </el-form-item>
          <span style="font-size: 12px;margin-left: 10px">用户可使用的日期区间</span>
        </div>
      </el-form-item>
      <el-form-item id="coupon-excludes" label="排除日期">
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
                :readonly="viewOnly"
                default-time="00:00:00"
                placeholder="选择开始日期和时间"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
            <span style="margin: 0 10px">至</span>
            <el-form-item>
              <el-date-picker
                v-model="exclude.end"
                :readonly="viewOnly"
                default-time="23:59:59"
                placeholder="选择结束日期和时间"
                type="datetime"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
            <el-button
              v-if="!viewOnly"
              icon="el-icon-delete"
              style="margin-left: 10px"
              type="danger"
              @click="handleDeleteExcludeDate(index)"
            >
              删除
            </el-button>
          </div>
          <div>
            <el-button
              v-if="!viewOnly"
              :disabled="formData.excludeDates.length >= 5"
              icon="el-icon-edit"
              type="primary"
              @click="handleAddExcludeDate"
            >
              添加
            </el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="优惠券类别" prop="category">
        <el-select
          :disabled="viewOnly"
          :value="selectCategoryId"
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
      <el-form-item id="coupon-tags" label="优惠券标签">
        <span v-if="couponTags.length > 0">
          <el-tag
            v-for="tag in formData.tags"
            :key="tag"
            :closable="!viewOnly"
            :disable-transitions="false"
            @close="handleCloseTag(tag)"
          >
            {{ getCouponTagName(tag) }}
          </el-tag>
        </span>
        <el-select
          v-if="!viewOnly && tagInputVisible"
          :value="tagSelected"
          class="input-new-select"
          placeholder="选择标签"
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
        <el-button v-else-if="!viewOnly && formData.tags.length === 0" class="button-tag" @click="showTagInput">
          + 新标签
        </el-button>
      </el-form-item>
      <el-form-item label="优惠券图片">
        <image-upload
          :image-url="formData.imageUrl"
          :view-only="viewOnly"
          image-width="200px"
          path-name="coupons"
          @success="handleImageUrlChanged"
        />
        <el-button v-if="!viewOnly" type="danger" icon="el-icon-delete" size="mini" @click="formData.imageUrl = ''">
          删除图片
        </el-button>
      </el-form-item>
      <el-form-item class="form-item" label="优惠券链接" prop="url">
        <coupon-url
          :merchant-id="formData.supplierMerchantId"
          :first-class-category="formData.category"
          :read-only="viewOnly"
          :url="formData.url"
          @urlChanged="handleCouponUrlChanged"
        />
      </el-form-item>
      <el-form-item class="form-item" label="优惠券描述" prop="description">
        <el-input
          v-model="formData.description"
          :readonly="viewOnly"
          :rows="4"
          maxlength="50"
          resize="none"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-divider content-position="left"><span class="divider-text">规则设置</span></el-divider>
      <el-form-item label="每人限领数量">
        <span v-if="viewOnly">{{ formData.rules.perLimited }}</span>
        <el-input-number
          v-else
          v-model="formData.rules.perLimited"
          :max="formData.releaseTotal"
          :min="1"
          step-strictly
        />
      </el-form-item>
      <el-form-item v-if="false" label="推广区域">
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
      <el-form-item v-if="formData.rules.couponRules.type === 0" label="满减方式">
        <div style="display: flex; justify-content: start">
          <span style="margin-right: 10px">满</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.fullReduceCoupon.fullPrice }}</span>
            <el-input-number
              v-else
              v-model="formData.rules.couponRules.fullReduceCoupon.fullPrice"
              :min="1"
              step-strictly
            />
          </el-form-item>
          <span style="margin: 0 10px">元 减</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.fullReduceCoupon.reducePrice }}</span>
            <el-input-number
              v-else
              v-model="formData.rules.couponRules.fullReduceCoupon.reducePrice"
              :max="formData.rules.couponRules.fullReduceCoupon.fullPrice"
              :min="1"
              step-strictly
            />
          </el-form-item>
          <span style="margin: 0 10px">元</span>
        </div>
      </el-form-item>
      <el-form-item v-else-if="formData.rules.couponRules.type === 1" label="优惠券面值">
        <span v-if="viewOnly">{{ formData.rules.couponRules.cashCoupon.amount }}</span>
        <el-input-number v-else v-model="formData.rules.couponRules.cashCoupon.amount" :min="0" step-strictly />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.couponRules.type === 2" label="优惠折扣">
        <div style="display: flex; justify-content: start">
          <span style="margin-right: 10px">满</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.discountCoupon.fullPrice }}</span>
            <el-input-number
              v-else
              v-model="formData.rules.couponRules.discountCoupon.fullPrice"
              :min="0"
              step-strictly
            />
          </el-form-item>
          <span style="margin: 0 10px">元 可用折扣：</span>
          <el-form-item>
            <span v-if="viewOnly">{{ formData.rules.couponRules.discountCoupon.discountRatio }}</span>
            <el-input-number
              v-else
              v-model="formData.rules.couponRules.discountCoupon.discountRatio"
              :max="1"
              :min="0"
              :precision="2"
              :step="0.05"
            />
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="适用会员">
        <span v-if="viewOnly">{{ formData.rules.customer.type | couponCustomerFilter }}</span>
        <el-select v-else v-model="formData.rules.customer.type">
          <el-option
            v-for="item in customerOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
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
        <el-input-number v-else v-model="formData.rules.collect.points" :min="0" step-strictly />
      </el-form-item>
      <el-form-item label="可用商品范围">
        <span v-if="viewOnly">{{ formData.rules.scenario.type | couponScenarioFilter }}</span>
        <el-select
          v-else
          :value="formData.rules.scenario.type"
          :disabled="disableScenarioType"
          @change="onScenarioTypeChanged"
        >
          <el-option
            v-for="item in scenarioOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
            :disabled="item.disabled"
          />
        </el-select>
        <span class="el-icon-warning-outline" style="font-size: 12px;margin-left: 10px">
          根据优惠券类别，商品范围会有区分，比如全部类别优惠券，只能选择全场类商品或特定商品
        </span>
      </el-form-item>
      <el-form-item v-if="formData.rules.scenario.type === 1" label="活动商品" prop="couponMpus">
        <span>已关联{{ formData.rules.scenario.couponMpus.length }}个商品(至多关联400个商品)</span>
        <coupon-goods
          key="include"
          :merchant-id="formData.supplierMerchantId"
          :first-class-category="formData.category"
          :mpu-list="formData.rules.scenario.couponMpus"
          :view-only="viewOnly || disableScenarioType"
          @contentAdd="handleAddCouponMpus"
          @contentDelete="handleDeleteCouponMpus"
        />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.scenario.type === 2" label="排除商品">
        <p>请确认是否要创建全场通用券,该券创建后可用于您发布的任何商品(排除商品除外)</p>
        <p>已排除{{ formData.rules.scenario.excludeMpus.length }}个商品(排除商品数量至多为100个)</p>
        <coupon-goods
          key="exclude"
          :mpu-list="formData.rules.scenario.excludeMpus"
          :merchant-id="formData.supplierMerchantId"
          :view-only="viewOnly"
          @contentAdd="handleAddExcludeMpus"
          @contentDelete="handleDeleteExcludeMpus"
        />
      </el-form-item>
      <el-form-item v-else-if="formData.rules.scenario.type === 3" label="活动类别" prop="couponCategories">
        <div v-if="categoriesLoaded">
          <coupon-category
            v-for="(category, index) in formData.rules.scenario.categories"
            :key="'category-' + index"
            :category-value="category"
            :index="index"
            :preset-first-category="formData.category"
            :view-only="viewOnly"
            @categoryDelete="handleDeleteCategory"
            @categorySet="handleSetCategory"
          />
          <el-button
            :disabled="viewOnly"
            icon="el-icon-edit"
            type="primary"
            @click="handleNewCategory"
          >
            添加类别
          </el-button>
          <p>已排除{{ formData.rules.scenario.excludeMpus.length }}个商品(排除商品数量至多为100个)</p>
          <coupon-goods
            key="exclude"
            :merchant-id="formData.supplierMerchantId"
            :first-class-category="formData.category"
            :mpu-list="formData.rules.scenario.excludeMpus"
            :view-only="viewOnly"
            @contentAdd="handleAddExcludeMpus"
            @contentDelete="handleDeleteExcludeMpus"
          />
        </div>
        <div v-else-if="categoriesLoading">
          <span>正在加载类别...</span>
        </div>
      </el-form-item>
      <el-form-item class="form-item" label="使用规则">
        <el-input
          v-model="formData.rules.rulesDescription"
          :readonly="viewOnly"
          :rows="4"
          maxlength="50"
          resize="none"
          show-word-limit
          type="textarea"
        />
      </el-form-item>
      <el-form-item class="form-item" label="优惠券概述">
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
              <span class="data-text">{{ formData.rules.couponRules.discountCoupon.fullPrice }}</span>元
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
import { createCouponApi, getCouponByIdApi, getCouponTagsApi, updateCouponApi } from '@/api/coupons'
import { getVendorListApi } from '@/api/vendor'
import { vendor_status_approved, coupon_status_distributing } from '@/utils/constants'
import {
  CouponAppScopes,
  CouponCollectOptions,
  CouponScenarioOptions,
  CouponTypeOptions,
  CustomerTypeOptions
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
    },
    couponCustomerFilter: type => {
      const item = CustomerTypeOptions.find(customer => customer.value === type)
      return item ? item.label : ''
    }
  },
  data() {
    return {
      appScopes: CouponAppScopes,
      typeOptions: CouponTypeOptions,
      collectOptions: CouponCollectOptions,
      customerOptions: CustomerTypeOptions,
      selectVendorId: null,
      vendorLoading: false,
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
      originalCategory: null,
      disableScenarioType: false,
      selectCategoryId: '',
      couponImageSet: false,
      formData: {
        name: '',
        supplierMerchantId: null,
        supplierMerchantName: null,
        releaseStartDate: null,
        releaseEndDate: null,
        releaseTotal: 1,
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
          perLimited: 1,
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
          customer: {
            type: 0,
            users: null
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
              if (isEmpty(this.formData.rules.code)) {
                callback(new Error('请输入有效优惠券码'))
              } else {
                callback()
              }
            }
          }
        }],
        releaseStartDate: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
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
                callback(new Error('请选择上线的开始日期和时间'))
              }
            }
          }
        }],
        releaseEndDate: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            const now = moment()
            const startDate = moment(this.formData.releaseStartDate).add(1, 'hours')
            if (value && this.formData.releaseStartDate &&
              moment(value).isBefore(startDate)) {
              callback(new Error('结束时间必须晚于开始时间至少一个小时'))
            } else if (value && moment(value).isBefore(now)) {
              callback(new Error('结束时间必须晚于当前时间'))
            } else {
              if (value) {
                callback()
              } else {
                callback(new Error('请选择上线的结束日期和时间'))
              }
            }
          }
        }],
        effectiveStartDate: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
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
                callback(new Error('请选择有效期的开始日期和时间'))
              }
            }
          }
        }],
        effectiveEndDate: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            const now = moment()
            const startDate = moment(this.formData.effectiveStartDate).add(1, 'hours')
            if (value && this.formData.effectiveStartDate &&
              moment(value).isBefore(startDate)) {
              callback(new Error('结束时间必须晚于开始时间至少一个小时'))
            } else if (value && moment(value).isBefore(now)) {
              callback(new Error('结束时间必须晚于当前时间'))
            } else if (value && this.formData.releaseEndDate &&
              moment(value).isBefore(this.formData.releaseEndDate)) {
              callback(new Error('结束时间必须晚于上线结束时间'))
            } else {
              if (value) {
                callback()
              } else {
                callback(new Error('请选择有效期的结束日期和时间'))
              }
            }
          }
        }],
        releaseTotal: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value > 0) {
              callback()
            } else {
              callback(new Error('请输入有效的发放总数'))
            }
          }
        }],
        category: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (this.selectCategoryId !== '') {
              callback()
            } else {
              // Check type 全场类
              if (this.formData.rules.scenario.type !== 2 &&
                this.formData.rules.scenario.type !== 4) {
                callback(new Error('请选择此优惠券的类别'))
              } else {
                callback()
              }
            }
          }
        }],
        couponMpus: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            // Check type 全场类
            if (this.formData.rules.scenario.type === 1 &&
              this.formData.rules.scenario.couponMpus.length === 0) {
              callback(new Error('请选择此优惠券的活动商品'))
            } else {
              callback()
            }
          }
        }],
        couponCategories: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            // Check type 全场类
            const categories = this.formData.rules.scenario.categories
              .filter(category => category !== -1)
            if (this.formData.rules.scenario.type === 3 && categories.length === 0) {
              callback(new Error('请选择此优惠券的活动类别'))
            } else {
              callback()
            }
          }
        }],
        url: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (value.startsWith('aggregation://') ||
              value.startsWith('route://') ||
              value.startsWith('about:blank') ||
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
          return [{ categoryId: '0', categoryName: '全部类别' }].concat(this.categoriesOption.map(item => {
            return { categoryId: item.categoryId.toString(), categoryName: item.categoryName }
          }))
        } else {
          return [{
            categoryId: -1,
            categoryName: '正在加载类别...'
          }]
        }
      }
    },
    scenarioOptions: {
      get() {
        return CouponScenarioOptions.map(option => {
          const item = {
            value: option.value,
            label: option.label
          }
          let disabled = false
          const category = Number.parseInt(this.selectCategoryId)
          if (!Number.isNaN(category)) {
            if (category === 0) {
              // 全场类
              if (option.value !== 1 && option.value !== 2) {
                disabled = true
              }
            } else {
              if (option.value === 2) {
                disabled = true
              }
            }
          }
          item.disabled = disabled
          return item
        })
      }
    },
    isManualCollect: {
      get() {
        // 优惠券的领取方式为人工分配，需要批量生成或导入
        return this.couponDataLoaded ? this.couponData.rules.collect.type === 4 : false
      }
    },
    selectVendor: {
      get() {
        return this.vendorLoading ? null : this.selectVendorId
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
          limit: 1000,
          status: vendor_status_approved
        }
        this.vendorLoading = true
        const data = await getVendorListApi(params)
        const vendorList = data.rows.map(row => {
          return {
            value: row.company.id.toString(),
            label: row.company.name
          }
        })
        this.vendorOptions = [{ value: '0', label: '运营平台' }].concat(vendorList)
      } catch (e) {
        console.warn('Coupon get vendor list error:' + e)
      } finally {
        this.vendorLoading = false
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
      this.formData.url = this.couponData.url || 'about:blank'
      this.formData.description = this.couponData.description
      const couponCategory = this.couponData.category
      this.couponData.category = couponCategory === '' ? null : this.couponData.category
      this.formData.category = this.couponData.category
      this.selectCategoryId = this.formData.category ? this.formData.category.toString() : '0'
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
      this.formData.rules.customer.type = this.couponData.rules.customer.type
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
      if (Array.isArray(this.couponData.rules.scenario.brands)) {
        const items = this.couponData.rules.scenario.brands.filter(brand => !isEmpty(brand))
        this.couponData.rules.scenario.brands = [...items]
        this.formData.rules.scenario.brands = [...items]
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
        this.$message.warning('请重新选择活动商品，最多支持400个')
      }
      this.$refs['couponForm'].validateField(['couponMpus'])
    },
    handleDeleteCouponMpus(mpus) {
      const currents = this.formData.rules.scenario.couponMpus
      this.formData.rules.scenario.couponMpus = currents.filter(mpu => !mpus.includes(mpu))
      this.$refs['couponForm'].validateField(['couponMpus'])
    },
    handleAddExcludeMpus(mpus) {
      const filterMpus = filter(mpus, mpu => !includes(this.formData.rules.scenario.excludeMpus, mpu))
      if (this.formData.rules.scenario.excludeMpus.length + filterMpus.length <= 100) {
        this.formData.rules.scenario.excludeMpus = concat(this.formData.rules.scenario.excludeMpus, filterMpus)
      } else {
        this.$message.warning('请重新选择活动排除商品，最多支持100个')
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
      console.debug('index:' + index + ' value:' + value)
      if (value) {
        if (includes(this.formData.rules.scenario.categories, value)) {
          this.$message.warning('此类别已添加，请选择其它类别')
        } else {
          this.formData.rules.scenario.categories[index] = value
        }
      } else {
        this.formData.rules.scenario.categories[index] = -1
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
          data.status = coupon_status_distributing
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
      const diffKeys = Object.keys(this.formData).filter(key => !isEqual(this.formData[key], this.couponData[key]))
      if (!isEmpty(diffKeys)) {
        for (const key of diffKeys) {
          diff[key] = this.formData[key]
        }
        hasDiff = true
      }
      if (hasDiff) {
        this.reviseCouponStatus(diff)
        this.reviseScenarioRules(diff)
        if ('category' in diff && diff.category === null) {
          diff.category = ''
        }
        try {
          this.inSubmitting = true
          await updateCouponApi(diff)
          this.$router.go(-1)
        } catch (e) {
          console.warn('Update coupon:' + e)
        } finally {
          this.inSubmitting = false
        }
      } else {
        this.handleCancel()
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
          if (this.formData.excludeDates.length > 0) {
            this.formData.excludeDates = this.formData.excludeDates
              .filter(item => item.start !== null && item.end !== null)
            for (const exclude of this.formData.excludeDates) {
              const start = moment(exclude.start)
              const end = moment(exclude.end)
              const effectiveStart = moment(this.formData.effectiveStartDate)
              const effectiveEnd = moment(this.formData.effectiveEndDate)
              if (start.isBefore(effectiveStart) ||
                end.isBefore(start) ||
                end.isAfter(effectiveEnd)) {
                this.$message.warning('排除日期必须处于此优惠券的有效日期之间！')
                this.$scrollTo('#coupon-excludes')
                return
              }
            }
          }
          if (this.selectCategoryId === '0' && this.formData.tags.length === 0) {
            this.$message.warning('此优惠券为全部类别，必须选择一个优惠券的标签！')
            this.$scrollTo('#coupon-tags')
            return
          }
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
      this.couponImageSet = true
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
        this.disableScenarioType = true
        const mpu = data.url.substring('route://commodity/'.length)
        if (!isEmpty(mpu)) {
          this.formData.rules.scenario.type = 1
          this.formData.rules.scenario.couponMpus = [mpu]
          if (data.meta && data.meta.commodityImage && !this.couponImageSet) {
            this.formData.imageUrl = data.meta.commodityImage
          }
        }
      } else {
        this.disableScenarioType = false
      }
      this.$refs['couponForm'].validateField(['url'])
    },
    onMerchantChanged(value) {
      this.selectVendorId = value
      this.formData.supplierMerchantId = isEmpty(value) ? null : Number.parseInt(value)
      this.formData.supplierMerchantName =
        isEmpty(value) ? null : this.vendorOptions.find(vendor => vendor.value === value).label
    },
    onCategoryChanged(value) {
      const id = Number.parseInt(value)
      this.selectCategoryId = value
      if (Number.isNaN(id) || id === 0) {
        if (id === 0) {
          // 全场类
          this.formData.rules.scenario.type = 2
        }
        this.formData.category = null
      } else {
        if (this.formData.rules.scenario.type === 2) {
          this.formData.rules.scenario.type = 1
        }
        this.formData.category = id
        this.formData.rules.scenario.categories = []
      }
    },
    onScenarioTypeChanged(value) {
      this.formData.rules.scenario.type = value
      if (value === 2) {
        // 全场类, no category, should have tag
        this.originalCategory = this.formData.category
        this.selectCategoryId = '0'
        this.formData.category = null
      } else {
        if (this.originalCategory !== null) {
          this.formData.category = this.originalCategory
        }
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

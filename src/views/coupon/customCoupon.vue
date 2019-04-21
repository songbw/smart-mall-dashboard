<template>
  <div class="app-container">
    <el-form ref="couponForm" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="优惠券名称" prop="name">
        <div style="display: flex; justify-content: start; align-items: center">
          <el-input v-model="formData.name" :readonly="viewOnly" style="width: 350px"/>
          <span style="font-size: small;">
            请按规范描述商家名、券面额、券类型这三种关键信息,如“A商户10元美妆券”、“B商户50元通用券”、“XX商户20元定向券”等，限15字
          </span>
        </div>
      </el-form-item>
      <el-form-item label="发布日期" required>
        <div style="display: flex; justify-content: start">
          <el-form-item prop="releaseStartDate">
            <el-date-picker type="datetime" v-model="formData.releaseStartDate" :readonly="viewOnly"
                            placeholder="选择开始日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss"/>
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="releaseEndDate">
            <el-date-picker type="datetime" v-model="formData.releaseEndDate" :readonly="viewOnly"
                            placeholder="选择结束日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss"/>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="发放总数" required>
        <el-input-number v-model="formData.releaseTotal" :min="0" :disabled="viewOnly"/>
      </el-form-item>
      <el-form-item label="每人限领数量" required>
        <el-input-number v-model="formData.limitPerUser" :min="0" :disabled="viewOnly"/>
      </el-form-item>
      <el-form-item label="优惠方式" required>
        <div style="display: flex; justify-content: start">
          <span style="margin-right: 10px">满</span>
          <el-form-item prop="priceBreak">
            <el-input-number v-model="formData.priceBreak" :min="0" :disabled="viewOnly"/>
          </el-form-item>
          <span style="margin: 0 10px">减</span>
          <el-form-item prop="discount">
            <el-input-number v-model="formData.discount" :min="0" :disabled="viewOnly"/>
          </el-form-item>
        </div>
      </el-form-item>
      <el-form-item label="优惠券描述" prop="description" class="form-item">
        <el-input type="textarea" resize="none" v-model="formData.description" :rows="4" :readonly="viewOnly"/>
      </el-form-item>
      <el-form-item label="有效日期" required>
        <div style="display: flex; justify-content: start">
          <el-form-item prop="effectiveStartDate">
            <el-date-picker type="datetime" v-model="formData.effectiveStartDate" :readonly="viewOnly"
                            placeholder="选择开始日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss"/>
          </el-form-item>
          <span style="margin: 0 10px">至</span>
          <el-form-item prop="effectiveEndDate">
            <el-date-picker type="datetime" v-model="formData.effectiveEndDate" :readonly="viewOnly"
                            placeholder="选择结束日期和时间"
                            value-format="yyyy-MM-dd HH:mm:ss"/>
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
                              value-format="yyyy-MM-dd HH:mm:ss"/>
            </el-form-item>
            <span style="margin: 0 10px">至</span>
            <el-form-item>
              <el-date-picker type="datetime" v-model="exclude.end" :readonly="viewOnly"
                              placeholder="选择结束日期和时间"
                              value-format="yyyy-MM-dd HH:mm:ss"/>
            </el-form-item>
            <el-button type="danger" icon="el-icon-delete" style="margin-left: 10px" :disabled="viewOnly"
                       @click="handleDeleteExcludeDate(index)">
              删除
            </el-button>
          </div>
          <el-button type="primary" icon="el-icon-edit" :disabled="viewOnly"
                     @click="handleAddExcludeDate">
            添加
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="优惠券类型" required>
        <span v-if="viewOnly">{{ formData.type | couponType }}</span>
        <el-select v-else v-model="formData.type">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item v-if="formData.type === 1" label="活动商品" required>
        <span>已关联{{ formData.couponSkus.length }}个商品(至多关联400个商品)</span>
        <coupon-goods key="include" :sku-list="formData.couponSkus" :view-only="viewOnly"
                      @contentAdd="handleAddCouponSkus"
                      @contentDelete="handleDeleteCouponSkus"/>
      </el-form-item>
      <el-form-item v-else-if="formData.type === 2" label="排除商品" required>
        <p>请确认是否要创建全场通用券,该券创建后可用于您发布的任何商品(排除商品除外)</p>
        <p>已排除{{ formData.excludeSkus.length }}个商品(排除商品数量至多为100个)</p>
        <coupon-goods key="exclude" :sku-list="formData.excludeSkus" :view-only="viewOnly"
                      @contentAdd="handleAddExcludeSkus"
                      @contentDelete="handleDeleteExcludeSkus"/>
      </el-form-item>
      <el-form-item v-else>
        <div v-if="allCategoriesLoaded">
          <coupon-category v-for="(category, index) in formData.categories" :key="'category-' + index"
                           :category-value="category"
                           :index="index"
                           @categorySet="handleSetCategory"
                           @categoryDelete="handleDeleteCategory"/>
          <el-button type="primary" icon="el-icon-edit"
                     @click="handleNewCategory">
            添加类别
          </el-button>
          <p>已排除{{ formData.excludeSkus.length }}个商品(排除商品数量至多为100个)</p>
          <coupon-goods key="exclude" :sku-list="formData.excludeSkus" :view-only="viewOnly"
                        @contentAdd="handleAddExcludeSkus"
                        @contentDelete="handleDeleteExcludeSkus"/>
        </div>
        <div v-else-if="allCategoriesInLoading">
          <span>正在加载类别...</span>
        </div>
      </el-form-item>
      <el-form-item label="使用规则" class="form-item">
        <ul style="list-style-type: decimal">
          <li>本券有效期为
            <span class="data-text">
              {{ formData.effectiveStartDate || 'xxxx-xx-xx xx:xx:xx' }}
            </span>至
            <span class="data-text">
              {{ formData.effectiveEndDate || 'xxxx-xx-xx xx:xx:xx'}}
            </span>
          </li>
          <li>本券每人限领
            <span class="data-text">{{ formData.limitPerUser || 0 }}</span>
            张，单笔订单限用1张，不可叠加使用、不找零、不兑现
          </li>
          <li>如用券订单交易取消，券退回账号；如部分交易取消，券优惠按商品金额拆分</li>
          <li>商品固定积分部分不参与优惠</li>
          <li>若发现多笔订单中用户ID、收货人姓名、详细地址、联系方式及与用户身份相关的其他信息，任意一项或数项存在相同相似，或其他非真实有效等情形的，
            视为黄牛订单，商家有权取消订单并不予发货
          </li>
          <li>优惠券使用范围:
            <el-form-item prop="rulesDescription">
              <el-input type="textarea" resize="none" v-model="formData.rulesDescription" :rows="4"
                        :readonly="viewOnly"/>
            </el-form-item>
          </li>
        </ul>
      </el-form-item>
      <el-form-item>
        <el-button v-loading="summiting" v-if="!viewOnly" type="primary" @click="handleSubmit">
          {{ createCoupon ? '创建' : '保存' }}
        </el-button>
        <el-button @click="handleCancel">
          {{ viewOnly ? '确定' : '取消' }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import isEqual from 'lodash/isEqual'
  import concat from 'lodash/concat'
  import difference from 'lodash/difference'
  import includes from 'lodash/includes'
  import moment from 'moment'
  import CouponGoods from './CouponGoods'
  import CouponCategory from './CouponCategory'

  export default {
    name: 'CustomCoupon',
    components: {CouponGoods, CouponCategory},
    filters: {
      couponType: type => {
        switch (type) {
          case 1:
            return 'SKU类'
          case 2:
            return '全场类'
          case 3:
            return '类目品牌类'
        }
      }
    },
    data() {
      return {
        typeOptions: [{
          value: 1,
          label: 'SKU类'
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
        summiting: false,
        formData: {
          name: '',
          releaseStartDate: null,
          releaseEndDate: null,
          releaseTotal: 0,
          limitPerUser: 0,
          priceBreak: 0,
          discount: 0,
          description: '',
          effectiveStartDate: null,
          effectiveEndDate: null,
          excludeDates: [],
          type: 1,
          couponSkus: [],
          excludeSkus: [],
          categories: [],
          rulesDescription: ''
        },
        formRules: {
          name: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              if (value.length > 15) {
                callback(new Error('最多输入15个描述字符'))
              } else if (value.length < 3) {
                callback(new Error('最少输入3个描述字符'))
              } else {
                callback()
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
              if (value && this.formData.releaseStartDate &&
                moment(value).isBefore(this.formData.releaseStartDate)) {
                callback(new Error('结束时间必须晚于开始时间'))
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
              if (value && this.formData.effectiveStartDate &&
                moment(value).isBefore(this.formData.effectiveStartDate)) {
                callback(new Error('结束时间必须晚于开始时间'))
              } else {
                if (value) {
                  callback()
                } else {
                  callback(new Error('请选择发布的结束日期和时间'))
                }
              }
            }
          }],
          rulesDescription: [{
            required: true, trigger: 'blur', validator: (rule, value, callback) => {
              if (value && value.length > 0) {
                callback()
              } else {
                callback(new Error('请输入使用范围描述'))
              }
            }
          }]
        }
      }
    },
    computed: {
      ...mapGetters({
        couponData: 'currentCoupon',
        allCategoriesLoaded: 'allCategoriesLoaded',
        allCategoriesInLoading: 'allCategoriesInLoading'
      }),
    },
    created() {
      if (isEqual(this.$route.name, 'CreateCoupon')) {
        this.createCoupon = true
        this.viewOnly = false
        this.$store.commit('resetCoupon')
      } else {
        this.couponId = this.$route.params.id
        this.viewOnly = this.$route.params.readOnly
        this.getCouponData()
      }
      if (!this.viewOnly) {
        this.getAllCategories()
      }
    },
    methods: {
      async getCouponData() {
        try {
          await this.$store.dispatch('getCouponById', {id: this.couponId})
          this.formData = Object.assign({}, this.couponData)
        } catch (e) {
          console.log('Get coupon error :' + e)
        }
      },
      getAllCategories() {
        if (this.allCategoriesLoaded === false && this.allCategoriesInLoading === false) {
          this.$store.dispatch('getAllCategoryData', {offset: 1, limit: 100}).then((total) => {
            console.log(('Get Main Category ') + total)
          }).catch((error) => {
            console.log(('Get Main Category failed: ' + error))
          })
        }
      },
      handleAddExcludeDate() {
        this.formData.excludeDates.push({start: null, end: null})
      },
      handleDeleteExcludeDate(index) {
        this.formData.excludeDates.splice(index, 1)
      },
      handleAddCouponSkus(skus) {
        if (this.formData.couponSkus.length + skus.length <= 400) {
          this.formData.couponSkus = concat(this.formData.couponSkus, skus)
        } else {
          this.$message.warning('请重新选择活动商品，最多支持400个')
        }
      },
      handleDeleteCouponSkus(skus) {
        this.formData.couponSkus = difference(this.formData.couponSkus, skus)
      },
      handleAddExcludeSkus(skus) {
        if (this.formData.excludeSkus.length + skus.length <= 100) {
          this.formData.excludeSkus = concat(this.formData.excludeSkus, skus)
        } else {
          this.$message.warning('请重新选择活动排除商品，最多支持100个')
        }
      },
      handleDeleteExcludeSkus(skus) {
        this.formData.excludeSkus = difference(this.formData.excludeSkus, skus)
      },
      handleNewCategory() {
        if (this.formData.categories.length >= 5) {
          this.$message.warning('最多增加5条类别信息')
        } else {
          this.formData.categories.push(-1)
        }
      },
      handleSetCategory(index, value) {
        if (includes(this.formData.categories, value)) {
          this.$message.warning('此类别已添加，请选择其它类别')
        } else {
          this.formData.categories[index] = value
        }
      },
      handleDeleteCategory(index) {
        this.formData.categories.splice(index, 1)
      },
      async handleCreateCoupon() {
        const data = Object.assign({}, this.formData)
        if (data.type === 1) {
          data.excludeSkus = []
          data.categories = []
        } else {
          data.couponSkus = []
        }
        this.summiting = true
        try {
          await this.$store.dispatch('createCoupon', data)
          this.$router.go(-1)
        } catch (e) {
          console.log(e)
        } finally {
          this.summiting = false
        }
      },
      handleUpdateCoupon() {
      },
      handleSubmit() {
        this.$refs['couponForm'].validate((valid) => {
          if (valid) {
            if (this.createCoupon) {
              this.handleCreateCoupon()
            } else {
              this.handleUpdateCoupon()
            }
          }
        })
      },
      handleCancel() {
        this.$router.go(-1)
      }
    }
  }
</script>

<style scoped>
  .form-item {
    width: 80%;
  }

  .data-text {
    font-weight: bold;
    background: lightgray;
  }
</style>

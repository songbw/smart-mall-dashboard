<template>
  <div v-loading="dataLoading" class="app-container">
    <el-form ref="barterCardForm" :model="formData" :rules="viewOnly ? {} : formRules" label-width="120px">
      <el-divider content-position="left"><span class="divider-text">基础信息</span></el-divider>
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="formData.name"
          :readonly="viewOnly"
          maxlength="30"
          style="width: 350px"
        />
      </el-form-item>
      <el-form-item v-if="viewOnly" label="提货卡状态">
        <span>{{ formData.status | statusFilter }}</span>
      </el-form-item>
      <el-form-item label="金额(元)" prop="amount">
        <span v-if="viewOnly"> {{ formData.amount }}</span>
        <el-input-number
          v-else
          v-model="formData.amount"
          :precision="2"
          :step="1"
          :min="0"
          :max="1000000"
        />
      </el-form-item>
      <el-form-item v-if="hasType" label="类型" prop="type">
        <span v-if="viewOnly">{{ formData.type | typeFilter }}</span>
        <el-select v-else v-model="formData.type">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="有效天数" prop="effectiveDays">
        <span v-if="viewOnly">{{ formData.effectiveDays }}</span>
        <el-input-number v-else v-model="formData.effectiveDays" :min="1" :max="100000000" step-strictly />
      </el-form-item>
    </el-form>
    <el-divider content-position="left"><span class="divider-text">优惠券信息</span></el-divider>
    <div>
      <div v-if="!viewOnly && hasViewCouponPermission" style="margin: 20px 0">
        <el-button
          type="primary"
          @click="handleShowCouponSelection"
        >
          添加优惠券
        </el-button>
      </div>
      <el-table
        v-loading="dataLoading"
        :data="couponList"
        style="width: 100%"
        border
      >
        <el-table-column label="编号" align="center" width="80">
          <template slot-scope="scope">
            <router-link
              :to="{ name: 'CouponDetail', params: { id: scope.row.couponId, readOnly: true }}"
              class="el-link el-link--primary is-underline"
            >
              {{ scope.row.couponId }}
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="名称" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" width="80">
          <template slot-scope="scope">
            <el-tag>{{ scope.row.status | couponStatusFilter }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="上线开始时间" align="center" width="140">
          <template slot-scope="scope">
            <div>{{ scope.row.releaseStartDate | dateFilter }}</div>
          </template>
        </el-table-column>
        <el-table-column label="上线结束时间" align="center" width="140">
          <template slot-scope="scope">
            <div>{{ scope.row.releaseEndDate | dateFilter }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100">
          <template slot-scope="scope">
            <el-tooltip :open-delay="1000" content="删除" placement="top">
              <el-button
                icon="el-icon-delete"
                type="danger"
                size="mini"
                circle
                :disabled="viewOnly"
                @click="handleDeleteCoupon(scope.row.id)"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-form style="margin: 20px 0">
      <el-form-item>
        <el-button :type="viewOnly ? 'primary' : 'default'" @click="handleGoBack">
          {{ viewOnly ? '确定' : '取消' }}
        </el-button>
        <el-button v-if="!viewOnly" v-loading="dataLoading" type="primary" @click="handleSubmit">
          {{ createBarterCard ? '创建' : '保存' }}
        </el-button>
        <el-button v-if="viewOnly" type="info" @click="handleViewTickets">
          提货券记录
        </el-button>
      </el-form-item>
    </el-form>
    <coupon-selection
      :app-id="appId"
      :coupon-type="couponType"
      :dialog-visible="dialogSelectionVisible"
      @onSelectionCancelled="onCouponSelectionCancelled"
      @onSelectionConfirmed="onCouponSelectionConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import {
  getBarterCardInfoApi,
  createBarterCardApi,
  updateBarterCardApi,
  bindCouponWithBarterCardApi,
  unbindCouponFromBarterCardApi
} from '@/api/barterCards'
import { getCouponByIdApi } from '@/api/coupons'
import {
  CouponStatusDefinition,
  BarterCardStatusDefinition,
  BarterCardTypeDefinition,
  barter_card_status_init,
  barter_card_type_gift,
  barter_card_type_voucher
} from '@/utils/constants'
import { CouponPermissions } from '@/utils/role-permissions'
import CouponSelection from './couponSelection'

const floatToFixed = (value, precision) =>
  parseFloat((Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision)).toFixed(precision))

const maxCouponNum = 5

export default {
  name: 'CustomBarterCard',
  components: { CouponSelection },
  filters: {
    couponStatusFilter: (status) => {
      const item = CouponStatusDefinition.find(coupon => coupon.value === status)
      return item ? item.label : ''
    },
    statusFilter: (status) => {
      const item = BarterCardStatusDefinition.find(item => item.value === status)
      return item ? item.label : ''
    },
    typeFilter: type => {
      const find = BarterCardTypeDefinition.find(option => option.value === type)
      return find ? find.label : ''
    },
    dateFilter(date) {
      const format = 'YYYY-MM-DD'
      const momentDate = moment(date)
      return momentDate.isValid() ? momentDate.format(format) : date
    }
  },
  data() {
    return {
      hasType: false,
      typeOptions: BarterCardTypeDefinition,
      dataLoading: false,
      createBarterCard: false,
      viewOnly: true,
      dialogSelectionVisible: false,
      barterCardId: null,
      barterCardInfo: null,
      couponList: [],
      formData: {
        name: '',
        amount: 0,
        status: barter_card_status_init,
        type: barter_card_type_gift,
        effectiveDays: 0
      },
      formRules: {
        name: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入有效的提货卡名称'))
            } else {
              callback()
            }
          }
        }],
        amount: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value > 0) {
              callback()
            } else {
              callback(new Error('请输入有效的提货卡有效金额'))
            }
          }
        }],
        type: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value === null) {
              callback(new Error('请选择有效的提货卡类型'))
            } else {
              callback()
            }
          }
        }],
        effectiveDays: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (value > 0) {
              callback()
            } else {
              callback(new Error('请输入有效的提货卡有效天数'))
            }
          }
        }]
      }
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions',
      appId: 'platformAppId'
    }),
    hasViewCouponPermission() {
      return this.userPermissions.includes(CouponPermissions.view)
    },
    couponType() {
      switch (this.formData.type) {
        case barter_card_type_gift:
          return 4 // 礼包券
        case barter_card_type_voucher:
          return 1 // 代金券
        default:
          return 0
      }
    }
  },
  created() {
    this.prepareData()
  },
  methods: {
    prepareData() {
      if (isEqual(this.$route.name, 'CreateBarterCard')) {
        this.createBarterCard = true
        this.viewOnly = false
      } else {
        this.barterCardId = this.$route.params.id
        if ('readOnly' in this.$route.params) {
          this.viewOnly = this.$route.params.readOnly
        }
        this.getBarterCardData()
      }
    },
    async getBarterCardData() {
      try {
        this.dataLoading = true
        const { code, data } = await getBarterCardInfoApi({ id: this.barterCardId })
        if (code === 200) {
          const barterCardInfo = data.result
          if (barterCardInfo.amount !== null) {
            const amount = Number.parseFloat(barterCardInfo.amount)
            barterCardInfo.amount = Number.isNaN(amount) ? null : floatToFixed(amount, 2)
          }
          this.barterCardInfo = barterCardInfo
          for (const key of Object.keys(this.formData)) {
            this.formData[key] = this.barterCardInfo[key]
          }
          if (Array.isArray(this.barterCardInfo.couponIds) && this.barterCardInfo.couponIds.length > 0) {
            for (const couponBind of this.barterCardInfo.couponIds) {
              const coupon = await this.getCouponData(couponBind.couponId)
              if (coupon != null) {
                this.couponList.push({
                  id: couponBind.id,
                  couponId: coupon.id,
                  name: coupon.name,
                  status: coupon.status,
                  releaseStartDate: coupon.releaseStartDate,
                  releaseEndDate: coupon.releaseEndDate
                })
              }
            }
          }
        }
      } catch (e) {
        console.warn('Get barter card error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async getCouponData(id) {
      let coupon = null
      try {
        this.dataLoading = true
        const { code, data } = await getCouponByIdApi({ id })
        if (code === 200) {
          coupon = data.result
        }
      } catch (e) {
        console.warn('Get coupon error:' + e)
      } finally {
        this.dataLoading = false
      }
      return coupon
    },
    async handleCreateBarterCard() {
      try {
        this.dataLoading = true
        const couponIds = this.couponList.map(item => item.couponId)
        const { code, msg } = await createBarterCardApi({ ...this.formData, appId: this.appId, couponIds })
        if (code === 200) {
          this.handleGoBack()
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('Create barter card error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    async handleBindCoupon() {
      let suc = true
      try {
        const couponIds = this.couponList.map(item => item.couponId)
        const toAddList = couponIds.filter(
          id => this.barterCardInfo.couponIds.findIndex(item => item.couponId === id) < 0)
        for (const couponId of toAddList) {
          const res = await bindCouponWithBarterCardApi({ couponId, cardId: this.barterCardId })
          if (res.code !== 200) {
            suc = false
          }
        }
      } catch (e) {
        console.warn('Bind coupon with barter card error:' + e)
      }
      return suc
    },
    async handleUpdateBarterCard() {
      try {
        this.dataLoading = true
        const params = {
          id: this.barterCardId
        }
        let needUpdate = false
        for (const key of Object.keys(this.formData)) {
          if (this.formData[key] !== this.barterCardInfo[key]) {
            params[key] = this.formData[key]
            needUpdate = true
          }
        }
        if (needUpdate) {
          const { code, msg } = await updateBarterCardApi(params)
          if (code !== 200) {
            this.$message.warning(msg)
          }
        }
        const ret = await this.handleBindCoupon()
        if (ret) this.handleGoBack()
      } catch (e) {
        console.warn('Update barter card error:' + e)
      } finally {
        this.dataLoading = false
      }
    },
    handleDeleteCoupon(id) {
      this.$confirm('是否继续删除此优惠券？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          this.dataLoading = true
          const { code } = await unbindCouponFromBarterCardApi({ id })
          if (code === 200) {
            this.couponList = this.couponList.filter(item => item.id !== id)
            this.barterCardInfo.couponIds = this.barterCardInfo.couponIds.filter(item => item.id !== id)
          }
        } catch (e) {
          console.warn(`Update product state error: ${e}`)
        } finally {
          this.dataLoading = false
        }
      }).catch(() => {
      })
    },
    handleShowCouponSelection() {
      if (this.hasType) {
        this.$refs.barterCardForm.validateField('type', errorMessage => {
          if (isEmpty(errorMessage)) {
            this.dialogSelectionVisible = true
          }
        })
      } else {
        this.dialogSelectionVisible = true
      }
    },
    onCouponSelectionCancelled() {
      this.dialogSelectionVisible = false
    },
    onCouponSelectionConfirmed(selection) {
      this.dialogSelectionVisible = false
      const filtered = selection.filter(item => this.couponList.findIndex(
        coupon => coupon.couponId === item.couponId) < 0)
      if (filtered.length > 0 && this.couponList.length + filtered.length < maxCouponNum) {
        this.couponList = this.couponList.concat(filtered)
      } else {
        this.$message.warning(`最多可以添加${maxCouponNum}个优惠券！`)
      }
    },
    handleGoBack() {
      this.$router.back()
    },
    handleSubmit() {
      this.$refs.barterCardForm.validate(valid => {
        if (valid) {
          if (this.createBarterCard && this.barterCardId === null) {
            this.handleCreateBarterCard()
          } else {
            this.handleUpdateBarterCard()
          }
        }
      })
    },
    handleViewTickets() {
      const id = this.barterCardId
      this.$router.push({
        name: 'BarterCardTickets',
        params: { id }
      })
    }
  }
}
</script>

<style scoped>

</style>

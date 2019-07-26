<template>
  <el-form
    ref="promotionForm"
    :model="formData"
    :rules="formRules"
    label-position="right"
    label-width="120px"
  >
    <el-form-item label="活动名称" prop="name">
      <el-input v-model="formData.name" maxlength="20" placeholder="请输入活动名称" style="width: 300px" />
    </el-form-item>
    <el-form-item label="活动标签" prop="tag">
      <el-select :value="promotionTagValue" @change="value => promotionTagValue = value">
        <el-option
          v-for="item in promotionOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item label="开始时间" prop="startDate">
      <el-date-picker
        :value="startDate"
        placeholder="选择开始日期"
        type="date"
        value-format="yyyy-MM-dd"
        @input="onStartDateChanged"
      />
      <el-time-select
        :value="startTime"
        :picker-options="{start: '00:00', step: '01:00', end: '23:00'}"
        placeholder="选择开始时间"
        style="margin-left: 10px"
        @input="onStartTimeChanged"
      />
    </el-form-item>
    <el-form-item label="结束时间" prop="endDate">
      <el-date-picker
        :value="endDate"
        placeholder="选择结束日期"
        type="date"
        value-format="yyyy-MM-dd"
        @input="onEndDateChanged"
      />
      <el-time-select
        :value="endTime"
        :picker-options="{start: '00:00', step: '01:00', end: '23:00'}"
        placeholder="选择结束时间"
        style="margin-left: 10px"
        @input="onEndTimeChanged"
      />
    </el-form-item>
    <el-form-item>
      <el-button @click="$emit('cancelCreation')">取消</el-button>
      <el-button type="primary" @click="savePromotion">{{ saveButtonLabel }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'CustomPromotion',
  props: {
    promotionData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      promotionOptions: [{
        value: 0,
        label: '当季新品'
      }, {
        value: 1,
        label: '新品特价'
      }, {
        value: 2,
        label: '爆款推荐'
      }, {
        value: 3,
        label: '人气热卖'
      }, {
        value: 4,
        label: '限时特价'
      }, {
        value: 5,
        label: '超值优惠'
      }, {
        value: 6,
        label: '惊喜价'
      }, {
        value: 7,
        label: '冰点价'
      }, {
        value: 8,
        label: '限时抢'
      }],
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      formData: {
        name: this.promotionData.name,
        tag: this.promotionData.tag,
        startDate: this.promotionData.startDate,
        endDate: this.promotionData.endDate
      },
      formRules: {
        name: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入有效的优惠券名称'))
            } else {
              callback()
            }
          }
        }],
        tag: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(this.formData.tag)) {
              callback(new Error('请选择有效的活动标签'))
            } else {
              callback()
            }
          }
        }],
        startDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(this.formData.startDate)) {
              callback(new Error('请选择有效的开始时间'))
            } else {
              const format = 'YYYY-MM-DD HH:mm:ss'
              const startDate = moment(this.formData.startDate, format)
              const now = moment()
              if (startDate.isBefore(now)) {
                callback(new Error('开始时间必须晚于当前时间'))
              } else {
                callback()
              }
            }
          }
        }],
        endDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (isEmpty(this.formData.endDate)) {
              callback(new Error('请选择有效的结束时间'))
            } else {
              const format = 'YYYY-MM-DD HH:mm:ss'
              const startDate = moment(this.formData.startDate, format)
              const endDate = moment(this.formData.endDate, format)
              if (!isEmpty(startDate) && endDate.isBefore(startDate)) {
                callback(new Error('结束时间必须晚于开始时间'))
              } else {
                callback()
              }
            }
          }
        }]
      }
    }
  },
  computed: {
    saveButtonLabel() {
      if (this.promotionData && this.promotionData.id >= 0) {
        return '更新并修改商品'
      } else {
        return '创建并选择商品'
      }
    },
    promotionTagValue: {
      get() {
        if (this.formData.tag) {
          for (const tag of this.promotionOptions) {
            if (tag.label === this.formData.tag) {
              return tag.value
            }
          }
        }
        return null
      },
      set(value) {
        for (const tag of this.promotionOptions) {
          if (tag.value === value) {
            this.formData.tag = tag.label
            break
          }
        }
      }
    }
  },
  created() {
    this.setDateValue()
  },
  methods: {
    handleSetPromotionType(id) {
      const params = {
        id,
        promotionType: 0
      }
      this.$store.dispatch('promotions/update', params).then(() => {
        this.$emit('onPromotionCreated')
      }).catch(err => {
        console.warn('updatePromotion:' + err)
      })
    },
    handleCreatePromotion() {
      this.$store.dispatch('promotions/create', this.formData).then((id) => {
        this.handleSetPromotionType(id)
      }).catch(err => {
        console.warn('createPromotion:' + err)
      })
    },
    handleUpdatePromotion() {
      let changed = false
      const params = { id: this.promotionData.id }
      Object.keys(this.formData).forEach(key => {
        if (this.promotionData[key] !== this.formData[key]) {
          params[key] = this.formData[key]
          changed = true
        }
      })
      if (changed) {
        this.$store.dispatch('promotions/update', params).then(() => {
          this.$emit('onPromotionCreated')
        }).catch(err => {
          console.warn('updatePromotion:' + err)
        })
      } else {
        this.$emit('onPromotionCreated')
      }
    },
    async savePromotion() {
      try {
        const valid = await this.$refs['promotionForm'].validate()
        if (valid) {
          if (this.promotionData.id >= 0) {
            this.handleUpdatePromotion()
          } else {
            this.handleCreatePromotion()
          }
        }
      } catch (e) {
        console.warn('Save promotion :' + e)
      }
    },
    setDateValue() {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const dateFormat = 'YYYY-MM-DD'
      const timeFormat = 'HH:mm'
      if (!isEmpty(this.promotionData.startDate)) {
        const startDate = moment(this.promotionData.startDate, format)
        this.startDate = startDate.format(dateFormat)
        this.startTime = startDate.format(timeFormat)
      }
      if (!isEmpty(this.promotionData.endDate)) {
        const endDate = moment(this.promotionData.endDate, format)
        this.endDate = endDate.format(dateFormat)
        this.endTime = endDate.format(timeFormat)
      }
    },
    parseDateFormat(date, time) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const dateFormat = 'YYYY-MM-DD'
      const timeFormat = 'HH:mm'
      if (!isEmpty(date) && !isEmpty(time)) {
        const dateMoment = moment(date, dateFormat)
        const timeMoment = moment(time, timeFormat)
        dateMoment.hour(timeMoment.hour())
        dateMoment.minute(timeMoment.minute())
        dateMoment.second(0)
        return dateMoment.format(format)
      } else {
        return null
      }
    },
    setPromotionStartDate() {
      const date = this.parseDateFormat(this.startDate, this.startTime)
      if (date) {
        this.formData.startDate = date
      }
    },
    onStartDateChanged(value) {
      console.debug('start date ' + value)
      this.startDate = value
      this.setPromotionStartDate()
    },
    onStartTimeChanged(value) {
      console.debug('start time ' + value)
      this.startTime = value
      this.setPromotionStartDate()
    },
    setPromotionEndDate() {
      const date = this.parseDateFormat(this.endDate, this.endTime)
      if (date) {
        this.formData.endDate = date
      }
    },
    onEndDateChanged(value) {
      this.endDate = value
      this.setPromotionEndDate()
    },
    onEndTimeChanged(value) {
      this.endTime = value
      this.setPromotionEndDate()
    }
  }
}
</script>


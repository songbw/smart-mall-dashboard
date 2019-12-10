<template>
  <div>
    <el-form
      ref="promotionForm"
      v-loading="promotionLoading"
      :model="formData"
      :rules="formRules"
      label-position="right"
      label-width="120px"
    >
      <el-form-item label="活动名称" prop="name">
        <el-input v-model="formData.name" maxlength="30" placeholder="请输入活动名称" style="width: 300px" />
      </el-form-item>
      <el-form-item label="活动组名" prop="type">
        <el-select v-model="formData.promotionTypeId">
          <el-option
            v-for="item in tabOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="hasTag" label="活动标签" prop="tag">
        <el-autocomplete
          v-model="formData.tag"
          :fetch-suggestions="queryTags"
          :maxlength="10"
          placeholder="请输入活动标签"
        />
      </el-form-item>
      <el-form-item label="全天分时段">
        <el-switch v-model="formData.dailySchedule" :disabled="scheduleDisabled" />
        <span style="font-size: 12px;margin-left: 10px">
          <i class="el-icon-warning-outline" />创建后将不能修改
        </span>
      </el-form-item>
      <el-form-item v-if="formData.dailySchedule" label="活动日期" prop="scheduleDate">
        <el-date-picker
          :value="scheduleDate"
          placeholder="选择活动日期"
          type="date"
          value-format="yyyy-MM-dd"
          @input="onScheduleDateChanged"
        />
      </el-form-item>
      <el-form-item v-if="formData.dailySchedule && promotionData.id < 0" label="活动时段" prop="scheduleDate">
        <span v-if="defaultSchedules.length > 0">
          <el-tag
            v-for="tag in defaultSchedules"
            :key="tag"
            :disable-transitions="false"
            style="margin-right: 10px"
          >
            {{ tag }}
          </el-tag>
        </span>
        <el-button size="mini" type="warning" @click="dialogScheduleVisible = true">修改时段</el-button>
      </el-form-item>
      <el-form-item v-if="!formData.dailySchedule" label="开始时间" prop="startDate">
        <el-date-picker
          :value="startDate"
          placeholder="选择开始日期"
          type="date"
          value-format="yyyy-MM-dd"
          @input="onStartDateChanged"
        />
        <el-time-picker
          :value="startTime"
          value-format="HH:mm:ss"
          placeholder="选择开始时间"
          style="margin-left: 10px"
          @input="onStartTimeChanged"
        />
      </el-form-item>
      <el-form-item v-if="!formData.dailySchedule" label="结束时间" prop="endDate">
        <el-date-picker
          :value="endDate"
          placeholder="选择结束日期"
          type="date"
          value-format="yyyy-MM-dd"
          @input="onEndDateChanged"
        />
        <el-time-picker
          :value="endTime"
          value-format="HH:mm:ss"
          placeholder="选择结束时间"
          style="margin-left: 10px"
          @input="onEndTimeChanged"
        />
      </el-form-item>
      <el-form-item label="结算类型">
        <el-select v-model="formData.accountType">
          <el-option
            v-for="item in accountTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <span style="font-size: 12px;margin-left: 10px">
          <i class="el-icon-warning-outline" />此类型对应不同的服务费，请仔细选择！
        </span>
      </el-form-item>
      <el-form-item>
        <el-button @click="$emit('cancelCreation')">取消</el-button>
        <el-button type="primary" @click="savePromotion">{{ saveButtonLabel }}</el-button>
      </el-form-item>
    </el-form>
    <el-dialog v-loading="scheduleUpdating" title="修改活动时段" :visible.sync="dialogScheduleVisible">
      <div style="margin-bottom: 10px"><i class="el-icon-warning-outline" />促销活动的默认时段，最多创建5个。</div>
      <el-checkbox-group v-model="checkSchedules" :max="5">
        <el-checkbox
          v-for="hour in scheduleOptions"
          :key="hour"
          :label="hour"
        />
      </el-checkbox-group>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancelSchedule">取消</el-button>
        <el-button type="primary" @click="handleUpdateSchedule">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import range from 'lodash/range'
import { PromotionAccountTypeDefinition } from '@/utils/constants'
import { PromotionPermissions } from '@/utils/role-permissions'

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
      hasTag: false,
      scheduleDate: null,
      scheduleDisabled: false,
      startDate: null,
      startTime: null,
      endDate: null,
      endTime: null,
      promotionLoading: false,
      dialogScheduleVisible: false,
      scheduleOptions: [],
      scheduleUpdating: false,
      checkSchedules: [],
      accountTypeOptions: [...PromotionAccountTypeDefinition],
      formData: {
        name: this.promotionData.name,
        promotionTypeId: this.promotionData.promotionTypeId,
        tag: this.promotionData.tag,
        dailySchedule: this.promotionData.dailySchedule,
        startDate: this.promotionData.startDate,
        endDate: this.promotionData.endDate,
        accountType: this.promotionData.accountType
      },
      formRules: {
        name: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (isEmpty(value)) {
              callback(new Error('请输入有效的活动名称'))
            } else {
              callback()
            }
          }
        }],
        type: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (this.formData.promotionTypeId === null) {
              callback(new Error('请选择有效的活动类型'))
            } else {
              callback()
            }
          }
        }],
        tag: [{
          required: true, trigger: 'change', validator: (rule, value, callback) => {
            if (this.hasTag) {
              if (isEmpty(this.formData.tag)) {
                callback(new Error('请输入有效的活动标签'))
              } else {
                callback()
              }
            } else {
              callback()
            }
          }
        }],
        scheduleDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (!this.formData.dailySchedule) {
              callback()
              return
            }
            if (isEmpty(this.formData.startDate)) {
              callback(new Error('请选择有效的活动日期'))
            } else {
              const format = 'YYYY-MM-DD HH:mm:ss'
              const startDate = moment(this.formData.startDate, format)
              const now = moment()
              if (startDate.year() < now.year() ||
                startDate.dayOfYear() < now.dayOfYear()) {
                callback(new Error('活动日期必须晚于当前日期'))
              } else {
                callback()
              }
            }
          }
        }],
        startDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (this.formData.dailySchedule) {
              callback()
              return
            }
            if (isEmpty(this.formData.startDate)) {
              callback(new Error('请选择有效的开始时间'))
            } else {
              const format = 'YYYY-MM-DD HH:mm:ss'
              const startDate = moment(this.formData.startDate, format)
              const now = moment()
              if (startDate.isSameOrBefore(now)) {
                callback(new Error('开始时间必须晚于当前时间'))
              } else {
                callback()
              }
            }
          }
        }],
        endDate: [{
          required: true, trigger: 'blur', validator: (rule, value, callback) => {
            if (this.formData.dailySchedule) {
              callback()
              return
            }
            if (isEmpty(this.formData.endDate)) {
              callback(new Error('请选择有效的结束时间'))
            } else {
              const format = 'YYYY-MM-DD HH:mm:ss'
              const startDate = moment(this.formData.startDate, format).add(1, 'hours')
              const endDate = moment(this.formData.endDate, format)
              if (!isEmpty(this.formData.startDate) && endDate.isSameOrBefore(startDate)) {
                callback(new Error('结束时间必须晚于开始时间至少一个小时'))
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
    ...mapGetters({
      userPermissions: 'userPermissions',
      promotionTypes: 'promotionTypes',
      promotionTypeId: 'promotionTypeId',
      defaultSchedules: 'defaultSchedules',
      appId: 'platformAppId'
    }),
    hasEditPermission() {
      return this.userPermissions.includes(PromotionPermissions.update)
    },
    saveButtonLabel() {
      if (this.promotionData && this.promotionData.id >= 0) {
        return '更新并修改商品'
      } else {
        return '创建并选择商品'
      }
    },
    tabOptions: {
      get() {
        return this.promotionTypes.map(type => ({ value: type.id, label: type.typeName }))
      }
    }
  },
  created() {
    this.setDateValue()
    this.getDefaultSchedules()
  },
  methods: {
    async handleSetDiscountType(id) {
      const params = {
        id,
        discountType: 0
      }
      await this.$store.dispatch('promotions/update', params)
    },
    async handleCreatePromotion() {
      this.promotionLoading = true
      try {
        const { id, msg } = await this.$store.dispatch('promotions/create', {
          appId: this.appId, ...this.formData
        })
        if (id >= 0) {
          await this.handleSetDiscountType(id)
          if (this.formData.dailySchedule) {
            for (const time of this.defaultSchedules) {
              await this.addScheduleTime(time, id)
            }
          }
          this.$emit('onPromotionCreated')
        } else {
          this.$message.warning(msg)
        }
      } catch (e) {
        console.warn('CreatePromotion error: ' + e)
        this.$message.warning('创建促销活动失败，请联系管理员！')
      } finally {
        this.promotionLoading = false
      }
    },
    async addScheduleTime(value, id) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const timeFormat = 'HH:mm'
      const startDateTime = moment(this.formData.startDate, format)
      const timeMoment = moment(value, timeFormat)
      startDateTime.hour(timeMoment.hour())
      startDateTime.minute(timeMoment.minute())
      startDateTime.second(0)
      await this.$store.dispatch('promotions/addScheduleTime', {
        promotionId: id,
        schedule: value,
        startTime: startDateTime.format(format),
        endTime: startDateTime.add(1, 'days').format(format)
      })
    },
    async handleUpdatePromotion() {
      let changed = false
      const params = { id: this.promotionData.id }
      Object.keys(this.formData).forEach(key => {
        if (this.promotionData[key] !== this.formData[key]) {
          params[key] = this.formData[key]
          changed = true
        }
      })
      if (changed) {
        try {
          const { code, msg } = await this.$store.dispatch('promotions/update', params)
          if (code === 200) {
            if (this.formData.dailySchedule) {
              for (const schedule of this.promotionData.promotionSchedules) {
                await this.updateScheduleTime(schedule)
              }
            }
            this.$emit('onPromotionCreated')
          } else {
            this.$message.warning(msg)
          }
        } catch (e) {
          console.warn('updatePromotion:' + e)
        }
      } else {
        this.$emit('onPromotionCreated')
      }
    },
    async updateScheduleTime(scheduleTime) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const timeFormat = 'HH:mm'
      const startDateTime = moment(this.formData.startDate, format)
      const timeMoment = moment(scheduleTime.schedule, timeFormat)
      startDateTime.hour(timeMoment.hour())
      startDateTime.minute(timeMoment.minute())
      startDateTime.second(0)
      await this.$store.dispatch('promotions/updateScheduleTime', {
        id: scheduleTime.id,
        schedule: scheduleTime.schedule,
        startTime: startDateTime.format(format),
        endTime: startDateTime.add(1, 'days').format(format)
      })
    },
    async savePromotion() {
      if (this.hasEditPermission) {
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
      } else {
        this.$message.warning('没有创建或修改促销活动的权限，请联系管理员！')
      }
    },
    setDateValue() {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const dateFormat = 'YYYY-MM-DD'
      const timeFormat = 'HH:mm:ss'
      if (this.promotionData.dailySchedule) {
        if (!isEmpty(this.promotionData.startDate)) {
          const startDate = moment(this.promotionData.startDate, format)
          this.scheduleDate = startDate.format(dateFormat)
        }
      } else {
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
      }
      if (this.promotionData.id !== null && this.promotionData.id >= 0) {
        this.scheduleDisabled = true
      }
    },
    parseDateFormat(date, time) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const dateFormat = 'YYYY-MM-DD'
      const timeFormat = 'HH:mm:ss'
      if (!isEmpty(date) && !isEmpty(time)) {
        const dateMoment = moment(date, dateFormat)
        const timeMoment = moment(time, timeFormat)
        dateMoment.hour(timeMoment.hour())
        dateMoment.minute(timeMoment.minute())
        dateMoment.second(timeMoment.second())
        return dateMoment.format(format)
      } else {
        return null
      }
    },
    setPromotionStartDate() {
      this.formData.startDate = this.parseDateFormat(this.startDate, this.startTime)
    },
    onStartDateChanged(value) {
      this.startDate = value
      this.startTime = '00:00:00'
      this.setPromotionStartDate()
    },
    onStartTimeChanged(value) {
      this.startTime = value
      this.setPromotionStartDate()
    },
    setPromotionEndDate() {
      this.formData.endDate = this.parseDateFormat(this.endDate, this.endTime)
    },
    onEndDateChanged(value) {
      this.endDate = value
      this.endTime = '23:59:59'
      this.setPromotionEndDate()
    },
    onEndTimeChanged(value) {
      this.endTime = value
      this.setPromotionEndDate()
    },
    queryTags(queryString, cb) {
      const options = [{
        value: '当季新品'
      }, {
        value: '新品特价'
      }, {
        value: '爆款推荐'
      }, {
        value: '人气热卖'
      }, {
        value: '限时特价'
      }, {
        value: '超值优惠'
      }, {
        value: '惊喜价'
      }, {
        value: '冰点价'
      }, {
        value: '限时抢'
      }]
      const results = isEmpty(queryString) ? options : options.filter(option => option.value.indexOf(queryString) >= 0)
      cb(results)
    },
    onScheduleDateChanged(date) {
      const format = 'YYYY-MM-DD HH:mm:ss'
      const dateFormat = 'YYYY-MM-DD'
      this.scheduleDate = date
      if (date) {
        const dateMoment = moment(date, dateFormat)
        dateMoment.hour(0)
        dateMoment.minute(0)
        dateMoment.second(0)
        this.startDate = date
        this.startTime = '00:00:00'
        this.formData.startDate = dateMoment.format(format)

        dateMoment.add(1, 'days')
        dateMoment.hour(23)
        dateMoment.minute(59)
        dateMoment.second(59)
        this.endDate = dateMoment.format(dateFormat)
        this.endTime = '23:59:59'
        this.formData.endDate = dateMoment.format(format)
      } else {
        this.formData.startDate = null
        this.formData.endDate = null
      }
    },
    async getDefaultSchedules() {
      try {
        this.scheduleOptions = range(24).map(i => i < 10 ? '0' + i + ':00' : i + ':00')
        await this.$store.dispatch('promotions/getDefaultSchedules', { appId: this.appId })
      } catch (e) {
        console.warn('getDefaultSchedules:' + e)
      }
    },
    handleCancelSchedule() {
      this.checkSchedules = []
      this.dialogScheduleVisible = false
    },
    async handleUpdateSchedule() {
      if (this.checkSchedules.length > 0) {
        try {
          const params = { appId: this.appId, initialSchedules: this.checkSchedules }
          this.scheduleUpdating = true
          await this.$store.dispatch('promotions/updateDefaultSchedules', params)
          this.scheduleUpdating = false
          this.checkSchedules = []
          this.dialogScheduleVisible = false
        } catch (e) {
          this.$message.warning('更新促销活动时段失败，请联系管理员!')
        }
      } else {
        this.$message.warning('请选择需要更新的活动时段，最多5个！')
      }
    }
  }
}
</script>


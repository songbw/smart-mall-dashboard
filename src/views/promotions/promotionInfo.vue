<template>
  <div>
    <el-form inline>
      <el-form-item label="活动名称">
        <el-input :value="promotionData.name" readonly />
      </el-form-item>
      <el-form-item label="活动类型">
        <el-input :value="type" readonly />
      </el-form-item>
    </el-form>
    <el-form inline>
      <el-form-item label="活动状态">
        <el-input :value="status" readonly />
      </el-form-item>
      <el-form-item v-if="!promotionData.dailySchedule" label="开始时间">
        <el-input :value="promotionData.startDate" readonly />
      </el-form-item>
      <el-form-item v-if="!promotionData.dailySchedule" label="结束时间">
        <el-input :value="promotionData.endDate" readonly />
      </el-form-item>
      <el-form-item v-if="promotionData.dailySchedule" label="时间类型">
        <el-input value="全天分时段" readonly />
      </el-form-item>
      <el-form-item v-if="promotionData.dailySchedule" label="活动日期">
        <el-input :value="scheduleDate" readonly />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import isEmpty from 'lodash/isEmpty'
import {
  PromotionStatusDefinition
} from '@/utils/constants'

export default {
  name: 'PromotionInfo',
  computed: {
    ...mapGetters({
      promotionTypes: 'promotionTypes',
      promotionData: 'currentPromotion'
    }),
    status: {
      get() {
        const status = this.promotionData.status
        const find = PromotionStatusDefinition.find(item => item.value === status)
        return find ? find.label : ''
      }
    },
    type: {
      get() {
        const found = this.promotionTypes.find(type => type.id === this.promotionData.promotionTypeId)
        return found ? found.typeName : ''
      }
    },
    scheduleDate: {
      get() {
        if (!isEmpty(this.promotionData.startDate)) {
          const format = 'YYYY-MM-DD HH:mm:ss'
          const dateFormat = 'YYYY-MM-DD'
          const startDate = moment(this.promotionData.startDate, format)
          return startDate.format(dateFormat)
        } else {
          return ''
        }
      }
    }
  }
}
</script>

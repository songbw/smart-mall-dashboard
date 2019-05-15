<template>
  <div class="app-container">
    <el-form inline :model="queryData">
      <el-form-item label="领取用户">
        <el-input v-model="queryData.userName" placeholder="输入领取用户名" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryData.status" style="width: 90px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="领取开始时间">
        <el-date-picker v-model="queryData.collectedStartDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" style="width: 150px" />
      </el-form-item>
      <el-form-item label="领取结束时间">
        <el-date-picker v-model="queryData.collectedEndDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" style="width: 150px" />
      </el-form-item>
    </el-form>
    <el-form inline :model="queryData">
      <el-form-item label="使用开始时间">
        <el-date-picker v-model="queryData.consumedStartDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" style="width: 150px" />
      </el-form-item>
      <el-form-item label="使用结束时间">
        <el-date-picker v-model="queryData.consumedEndDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" style="width: 150px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getUsageData">
          {{ $t('product_search_title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="dataLoading"
      ref="productsTable"
      :data="couponUsageData"
      border fit stripe highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="用户券码" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userCouponCode }}</span>
        </template>
      </el-table-column>
      <el-table-column label="领取用户名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | usageStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="领取时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.collectedTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.consumedTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消费订单" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.orderId }}</span>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total"
                :page.sync="queryData.offset" :limit.sync="queryData.limit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="getUsageData" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import isEmpty from 'lodash/isEmpty'
  import isString from 'lodash/isString'
  import isNumber from 'lodash/isNumber'
  import pagination from '@/components/Pagination'

  const statusOptions = [{
    value: 0,
    label: '全部'
  }, {
    value: 1,
    label: '未使用'
  }, {
    value: 2,
    label: '已使用'
  }, {
    value: 3,
    label: '已失效'
  }]

  export default {
    name: 'CouponUsages',
    components: { pagination },
    filter: {
      usageStatus: status => {
        const usage = statusOptions.find(option => status === option.value)
        if (usage) {
          return usage.label
        } else {
          return ''
        }
      }
    },
    data() {
      return {
        statusOptions: statusOptions,
        couponId: -1,
        queryData: {
          userName: '',
          status: 0,
          collectedStartDate: null,
          collectedEndDate: null,
          consumedStartDate: null,
          consumedEndDate: null,
          offset: 1,
          limit: 20
        },
        dataLoading: false
      }
    },
    computed: {
      ...mapGetters({
        couponUsageData: 'couponUsage',
        total: 'couponUsageTotal'
      }),
    },
    created() {
      this.couponId = this.$route.params.id
      this.getUsageData()
    },
    methods: {
      getFilterParams() {
        const params = { id: this.couponId }
        Object.keys(this.queryData).forEach(key => {
          const value = this.queryData[key]
          if (isString(value) && !isEmpty(value)) {
            params[key] = value
          }
          if (isNumber(value) && value > 0) {
            params[key] = value
          }
        })
        return params
      },
      getUsageData() {
        const params = this.getFilterParams()
        this.$log.debug(params)
        this.dataLoading = true
        this.$store.dispatch('getCouponUsageById', params).then(() => {
          this.dataLoading = false
        }).catch(err => {
          this.$log.warn('Get coupon usage: ' + err)
          this.dataLoading = false
        })
      }
    }
  }
</script>

<style scoped>

</style>

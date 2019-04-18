<template>
  <div class="app-container">
    <el-form :inline="true" :model="queryData">
      <el-form-item label="名称">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable/>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="queryStatus" style="width: 90px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-select v-model="queryType" style="width: 90px">
          <el-option
            v-for="item in typeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"/>
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间">
        <el-date-picker v-model="queryStartDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" style="width: 140px"/>
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker v-model="queryEndDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" style="width: 140px"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="getCouponData">
          {{ $t('product_search_title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <div class="ops-button-group">
      <el-button type="primary" icon="el-icon-edit" class="ops-button"
                 @click="handleCreateCoupon">
        新建优惠券
      </el-button>
    </div>
    <el-table
      v-loading="dataLoading"
      ref="productsTable"
      :data="couponData"
      border fit stripe highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="优惠券编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券类型" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.type | couponType }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券总量" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseTotal }}</span>
        </template>
      </el-table-column>
      <el-table-column label="已发放数量" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="优惠券状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | couponStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布开始时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseStartDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布结束时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.releaseEndDate }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('aggregation_table_ops_title')" align="center" width="250">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="handleEditCoupon(scope.row.id)">编辑</el-button>
          <el-button size="mini" type="danger">下线</el-button>
          <el-button size="mini" type="info">立即发布</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total"
                :page.sync="queryOffset" :limit.sync="queryLimit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="getCouponData"/>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import moment from 'moment'
  import pagination from '@/components/Pagination'

  export default {
    name: "Coupon",
    components: {pagination},
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
      },
      couponStatus: (status) => {
        switch (status) {
          case 1:
            return '未开始'
          case 2:
            return '已发布'
          case 3:
            return '已下线'
        }
      }
    },
    data() {
      return {
        statusOptions: [{
          value: 0,
          label: '全部'
        }, {
          value: 1,
          label: '未开始'
        }, {
          value: 2,
          label: '已发布'
        }, {
          value: 3,
          label: '已下线'
        }],
        typeOptions:[{
          value: 0,
          label: '全部'
        }, {
          value: 1,
          label: 'SKU类'
        }, {
          value: 2,
          label: '全场类'
        }, {
          value: 3,
          label: '类目品牌类'

        }],
        dataLoading: false,
      }
    },
    computed: {
      ...mapGetters({
        couponData: 'allCouponList',
        total: 'couponTotalNum',
        queryData: 'couponQuery'
      }),
      queryName: {
        get() {
          return this.queryData.name
        },
        set(value) {
          this.$store.commit('setQueryData', {name: value})
        }
      },
      queryStatus: {
        get() {
          return this.queryData.status
        },
        set(value) {
          this.$store.commit('setQueryData', {status: value})
        }
      },
      queryType: {
        get() {
          return this.queryData.type
        },
        set(value) {
          this.$store.commit('setQueryData', {type: value})
        }
      },
      queryStartDate: {
        get() {
          return this.queryData.startDate
        },
        set(value) {
          const start = moment(value).set({'hour': 0, 'minute': 0, 'second': 0})
          if (start.isValid() && (this.queryEndDate === null || start.isBefore(this.queryEndDate))) {
            this.$store.commit('setQueryData', {startDate: start.format('YYYY-MM-DD HH:mm:ss')})
          } else {
            if (value) {
              this.$message.warning('开始日前必须早于结束日期')
            }
            this.$store.commit('setQueryData', {startDate: null})
          }

        }
      },
      queryEndDate: {
        get() {
          return this.queryData.endDate
        },
        set(value) {
          const end = moment(value).set({'hour': 23, 'minute': 59, 'second': 59})
          if (end.isValid() && (this.queryStartDate === null || end.isAfter(this.queryStartDate))) {
            this.$store.commit('setQueryData', {endDate: end.format('YYYY-MM-DD HH:mm:ss')})
          } else {
           if (value) {
             this.$message.warning('结束日期必须晚于开始日期')
           }
            this.$store.commit('setQueryData', {endDate: null})
          }
        }
      },
      queryOffset: {
        get() {
          return this.queryData.offset
        },
        set(value) {
          this.$store.commit('setQueryData', {offset: value})
        }
      },
      queryLimit: {
        get() {
          return this.queryData.limit
        },
        set(value) {
          this.$store.commit('setQueryData', {limit: value})
        }
      }
    },
    created() {
      this.getCouponData()
    },
    methods: {
      getCouponData() {
        const params = this.getFilterParams()
        if (params !== null) {
          this.getFilterData(params)
        } else {
          this.queryAllCouponData()
        }
      },
      async queryAllCouponData() {
        this.dataLoading = true
        try {
          await this.$store.dispatch('getCoupons', {offset: this.queryOffset, limit: this.queryLimit})
        } catch (err) {
          console.log('Get Coupons:' + err)
        } finally {
          this.dataLoading = false
        }
      },
      getFilterParams() {
        const params = {}
        let needFilter = false
        if (this.queryName && this.queryName !== '') {
          params.name = this.queryName
          needFilter = true
        }
        if (this.queryStatus !== 0) {
          params.status = this.queryStatus
          needFilter = true
        }
        if (this.queryType !== 0) {
          params.type = this.queryType
          needFilter = true
        }
        if (this.queryStartDate && this.queryStartDate.trim()) {
          params.releaseStartDate = this.queryStartDate
          needFilter = true
        }
        if (this.queryEndDate && this.queryEndDate.trim()) {
          params.releaseEndDate = this.queryEndDate
          needFilter = true
        }
        if (needFilter) {
          params.offset = this.queryOffset
          params.limit = this.queryLimit
          return params
        } else {
          return null
        }
      },
      async getFilterData(params) {
        this.dataLoading = true
        try {
          await this.$store.dispatch('searchCoupons', params)
        } catch (err) {
          console.log('Search Coupons:' + err)
        } finally {
          this.dataLoading = false
        }
      },
      handleFilter() {
        this.queryOffset = 1
        this.getCouponData()
      },
      handleCreateCoupon() {
      },
      handleEditCoupon(couponId) {
      }
    }
  }
</script>

<style scoped>
  .ops-button-group {
    margin: 10px 0;
  }

  .ops-button {
    margin: 0 10px;
  }
</style>

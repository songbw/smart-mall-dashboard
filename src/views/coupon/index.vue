<template>
  <div class="app-container">
    <el-form :inline="true" :model="query">
      <el-form-item label="优惠券名称">
        <el-input v-model="query.name" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="优惠券状态">
        <el-select v-model="query.status" style="width: 100px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间">
        <el-date-picker v-model="query.startDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择开始日期" style="width: 150px" />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-date-picker v-model="query.endDate" type="date" value-format="yyyy-MM-dd"
                        placeholder="选择结束日期" style="width: 150px" />
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
                :page.sync="query.offset" :limit.sync="query.limit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="getCouponData" />
  </div>
</template>

<script>
  export default {
    name: "Coupon",
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
        query: {
          name: '',
          status: 0,
          startDate: null,
          endDate: null,
          offset: 1,
          limit: 20
        },
        dataLoading: false,
        couponData: [{
          id: 1111,
          name: '电器满300减50',
          type: 2,
          releaseTotal: 1000,
          releaseNum: 590,
          status: 2,
          releaseStartDate: '2019-03-13 16:00:00',
          releaseEndDate: '2019-03-14 16:00:00'
        }],
      }
    },
    methods: {
      getCouponData() {
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

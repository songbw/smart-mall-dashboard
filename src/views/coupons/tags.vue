<template>
  <div class="app-container">
    <div v-if="hasEditPermission" style="margin-bottom: 10px">
      <el-button type="primary" @click="handleCreate">创建标签</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="couponTags"
      border
      fit
      stripe
      highlight-current-row
      style="width: 60%;"
    >
      <el-table-column label="编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasEditPermission"
        label="操作"
        align="center"
        width="230"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="scope">
          <el-button
            type="warning"
            size="mini"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="handleDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="total"
      :page.sync="queryOffset"
      :limit.sync="queryLimit"
      @pagination="getCouponTags"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import isEmpty from 'lodash/isEmpty'
import Pagination from '@/components/Pagination'
import {
  getCouponTagsApi,
  createCouponTagApi,
  updateCouponTagApi,
  deleteCouponTagApi
} from '@/api/coupons'
import { CouponPermissions } from '@/utils/role-permissions'

export default {
  name: 'CouponTags',
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      queryOffset: 1,
      queryLimit: 20,
      total: 0,
      couponTags: []
    }
  },
  computed: {
    ...mapGetters({
      userPermissions: 'userPermissions'
    }),
    hasEditPermission() {
      return this.userPermissions.includes(CouponPermissions.update)
    }
  },
  created() {
    this.getCouponTags()
  },
  methods: {
    async getCouponTags() {
      this.listLoading = true
      try {
        const { data } = await getCouponTagsApi({ offset: this.queryOffset, limit: this.queryLimit })
        this.couponTags = data.result.list
        this.total = data.result.total
      } catch (e) {
        console.warn('Get coupon tags error :' + e)
      } finally {
        this.listLoading = false
      }
    },
    async handleCreate() {
      try {
        const { value } = await this.$prompt('请输入优惠券标签名称', '创建标签', {
          confirmButtonText: '创建',
          cancelButtonText: '取消'
        })
        if (!isEmpty(value)) {
          await createCouponTagApi({ name: value })
          this.getCouponTags()
        }
      } catch (e) {
        console.warn('CouponTag: create ' + e)
      }
    },
    async handleEdit(row) {
      try {
        const { value } = await this.$prompt('请输入优惠券标签名称', '修改标签', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        if (!isEmpty(value)) {
          await updateCouponTagApi({ id: row.id, name: value })
          this.getCouponTags()
        }
      } catch (e) {
        console.warn('CouponTag: create ' + e)
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm('是否确定删除此标签？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const { code } = await deleteCouponTagApi({ id: row.id })
        if (code === 200) {
          if (this.couponTags.length === 1 && this.queryOffset > 1) {
            this.queryOffset = this.queryOffset - 1
          }
          this.getCouponTags()
        } else {
          this.$message.warning('标签删除失败，请先删除此标签下优惠券！')
        }
      } catch (e) {
        console.warn('CouponTag: delete ' + e)
      }
    }
  }
}
</script>

<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button type="primary" @click="handleCreate">创建标签</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="couponTags"
      border fit stripe highlight-current-row
      style="width: 60%;">
      <el-table-column label="标签编号" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标签名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('brand_table_ops_title')" align="center" width="230"
                       class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="warning" size="mini"
                     @click="handleEdit(scope.row)">
            {{ $t('brand_table_ops_edit_title') }}
          </el-button>
          <el-button type="danger" size="mini"
                     @click="handleDelete(scope.row)">
            {{ $t('brand_table_ops_del_title') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :total="total"
                :page.sync="queryOffset" :limit.sync="queryLimit"
                :page-sizes="[20, 40, 80, 100]"
                @pagination="getCouponTags" />
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import pagination from '@/components/Pagination'

  export default {
    name: 'CouponTags',
    components: { pagination },
    data() {
      return {
        listLoading: false,
        queryOffset: 1,
        queryLimit: 20,
        total: 0
      }
    },
    computed: {
      ...mapGetters({
        couponTags: 'couponTags'
      }),
    },
    created() {
      this.getCouponTags()
    },
    methods: {
      getCouponTags() {
        if (this.couponTags.length === 0) {
          this.listLoading = true
          this.$store.dispatch('getCouponTags', { offset: this.queryOffset, limit: this.queryLimit }).then(data => {
            this.total = data.total
          }).catch(e => {
            this.$log.warn('getCouponTags: ' + e)
          }).finally(() => {
            this.listLoading = false
          })
        }
      },
      async handleCreate() {
        try {
          const { value } = await this.$prompt('请输入优惠券标签名称', '创建标签', {
            confirmButtonText: '创建',
            cancelButtonText: '取消'
          })
          this.$log.debug('CouponTag: create ' + value)
          await this.$store.dispatch('createCouponTag', { name: value })
        } catch (e) {
          this.$log.warn('CouponTag: create ' + e)
        }
      },
      async handleEdit(row) {
        try {
          const { value } = await this.$prompt('请输入优惠券标签名称', '修改标签', {
            confirmButtonText: '确定',
            cancelButtonText: '取消'
          })
          this.$log.debug('CouponTag: update ' + value)
          await this.$store.dispatch('updateCouponTag', { id: row.id, name: value })
        } catch (e) {
          this.$log.warn('CouponTag: create ' + e)
        }
      },
      async handleDelete(row) {
        try {
          await this.$confirm('是否确定删除此标签？', '警告', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
          await this.$store.dispatch('deleteCouponTag', { id: row.id })
        } catch (e) {
          this.$log.warn('CouponTag: delete ' + e)
        }
      }
    }
  }
</script>

<style scoped>

</style>

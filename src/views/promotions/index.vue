<template>
  <div class="app-container">
    <el-form :inline="true" :model="query">
      <el-form-item label="活动名称">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable />
      </el-form-item>
      <el-form-item label="活动状态">
        <el-select v-model="query.status">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div v-if="isAdminUser" class="ops-button-group">
      <el-button
        type="primary"
        icon="el-icon-edit"
        class="ops-button"
        @click="handleCreatePromotion"
      >
        创建促销活动
      </el-button>
      <el-button
        :disabled="promotionSelection.length === 0"
        type="danger"
        icon="el-icon-sold-out"
        class="ops-button"
        @click="handleBatchStopPromotions"
      >
        批量结束活动
      </el-button>
    </div>
    <el-table
      ref="productsTable"
      v-loading="dataLoading"
      :data="promotionData"
      border
      fit
      stripe
      highlight-current-row
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        align="center"
        type="selection"
        width="55"
      />
      <el-table-column label="活动编号" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动标签" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.tag }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.status | promotionStatus }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="有效开始时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.startDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="有效结束时间" align="center" width="180">
        <template slot-scope="scope">
          <span>{{ scope.row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-dropdown v-if="isAdminUser" placement="bottom" trigger="click" @command="handleOpsAction">
            <el-button type="primary" icon="el-icon-arrow-down">
              选择操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="`start:${scope.$index}`"
                :disabled="scope.row.status !== 1"
                icon="el-icon-time"
              >
                立即开始
              </el-dropdown-item>
              <el-dropdown-item
                :command="`view:${scope.$index}`"
                icon="el-icon-view"
                divided
              >
                查看活动
              </el-dropdown-item>
              <el-dropdown-item
                :command="`edit:${scope.$index}`"
                :disabled="scope.row.status !== 1"
                icon="el-icon-edit"
              >
                修改活动
              </el-dropdown-item>
              <el-dropdown-item
                :command="`stop:${scope.$index}`"
                :disabled="scope.row.status === 3"
                icon="el-icon-sold-out"
                divided
              >
                结束活动
              </el-dropdown-item>
              <el-dropdown-item
                :command="`delete:${scope.$index}`"
                :disabled="scope.row.status === 2"
                icon="el-icon-delete"
              >
                删除活动
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button v-else type="primary" icon="el-icon-view" @click="handleViewPromotion(scope.$index)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      :total="promotionTotal"
      :page.sync="query.offset"
      :limit.sync="query.limit"
      :page-sizes="[10, 20, 60, 100]"
      @pagination="getPromotionData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import memont from 'moment'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import {
  getPromotionsApi,
  searchPromotionsApi,
  updatePromotionApi,
  deletePromotionApi
} from '@/api/promotions'

export default {
  name: 'PromotionActivity',
  components: { Pagination },
  filters: {
    promotionStatus: (status) => {
      switch (status) {
        case 1:
          return '未开始'
        case 2:
          return '进行中'
        case 3:
          return '已结束'
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
        label: '进行中'
      }, {
        value: 3,
        label: '已结束'
      }],
      query: {
        name: '',
        status: 0,
        offset: 1,
        limit: 20
      },
      dataLoading: false,
      promotionSelection: [],
      promotionData: [],
      promotionTotal: 0
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser'
    }),
    queryName: {
      get() {
        return this.query.name
      },
      set(value) {
        this.query.name = trim(value)
      }
    }
  },
  created() {
    this.getPromotionData()
  },
  methods: {
    getPromotionData() {
      const params = this.getFilterParams()
      if (params !== null) {
        this.getFilterData(params)
      } else {
        this.queryAllPromotionData()
      }
    },
    async queryAllPromotionData() {
      this.dataLoading = true
      try {
        const { data } = await getPromotionsApi({ offset: this.query.offset, limit: this.query.limit })
        this.promotionData = data.result.list
        this.promotionTotal = data.result.total
      } catch (e) {
        console.warn('Get all promotions error: ' + e)
      } finally {
        this.dataLoading = false
      }
    },
    getFilterParams() {
      const params = {}
      let needFilter = false
      if (this.query.name) {
        params.name = this.query.name
        needFilter = true
      }
      if (this.query.status !== 0) {
        params.status = this.query.status
        needFilter = true
      }
      if (needFilter) {
        params.offset = this.query.offset
        params.limit = this.query.limit
        return params
      } else {
        return null
      }
    },
    async getFilterData(params) {
      this.dataLoading = true
      try {
        const { data } = await searchPromotionsApi(params)
        this.promotionData = data.result.list
        this.promotionTotal = data.result.total
      } catch (e) {
        console.warn('Search all promotions error: ' + e)
      } finally {
        this.dataLoading = false
      }
    },
    handleFilter() {
      this.query.offset = 1
      this.getPromotionData()
    },
    handleSelectionChange(selection) {
      this.promotionSelection = selection
    },
    handleCreatePromotion() {
      this.$router.push({
        name: 'CreatePromotion'
      })
    },
    async handleStartPromotion(index) {
      this.$confirm('请确认是否立即开始此优惠活动？', '优惠设置', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const id = this.promotionData[index].id
        const dateNow = memont()
        dateNow.minute(0)
        dateNow.second(0)
        const params = { id: id, status: 2 }
        params.startDate = dateNow.format('YYYY-MM-DD HH:mm:ss')
        try {
          await updatePromotionApi(params)
          this.$message({ message: '活动开始成功！', type: 'success' })
          this.getPromotionData()
        } catch (e) {
          console.warn('Start Promotion: ' + e)
          this.$message({ message: '活动开始失败！', type: 'error' })
        }
      }).catch(() => {
      })
    },
    handleViewPromotion(index) {
      const id = this.promotionData[index].id
      this.$router.push({
        name: 'ViewPromotion',
        params: { id: id }
      })
    },
    handleEditPromotion(index) {
      const id = this.promotionData[index].id
      this.$router.push({
        name: 'EditPromotion',
        params: { id: id }
      })
    },
    handleStopPromotion(index) {
      this.$confirm('请确认是否结束此优惠活动？', '优惠设置', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const id = this.promotionData[index].id
        const params = { id: id, status: 3 }
        try {
          await updatePromotionApi(params)
          this.$message({ message: '活动结束成功！', type: 'success' })
          this.getPromotionData()
        } catch (e) {
          console.warn('Start Promotion: ' + e)
          this.$message({ message: '活动结束失败！', type: 'error' })
        }
      }).catch(() => {
      })
    },
    handleDeletePromotion(index) {
      this.$confirm('请确认是否删除此优惠活动？', '优惠设置', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const id = this.promotionData[index].id
        const params = { id: id }
        deletePromotionApi(params).then(() => {
          this.$message({ message: '活动删除成功！', type: 'success' })
          if (this.promotionData.length === 1 && this.query.offset > 1) {
            this.query.offset = this.query.offset - 1
          }
          this.getPromotionData()
        }).catch(err => {
          console.log('Start Promotion: ' + err)
          this.$message({ message: '活动删除失败！', type: 'error' })
        })
      }).catch(() => {
      })
    },
    handleOpsAction(action) {
      const cmd = action.split(':')[0]
      const index = Number.parseInt(action.split(':')[1])
      switch (cmd) {
        case 'start':
          this.handleStartPromotion(index)
          break
        case 'view':
          this.handleViewPromotion(index)
          break
        case 'edit':
          this.handleEditPromotion(index)
          break
        case 'stop':
          this.handleStopPromotion(index)
          break
        case 'delete':
          this.handleDeletePromotion(index)
          break
      }
    },
    handleBatchStopPromotions() {
      this.$confirm('请确认是否结束所选的优惠活动？', '优惠设置', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const promises = []
        for (const item of this.promotionSelection) {
          if (item.status !== 3) {
            const params = { id: item.id, status: 3 }
            promises.push(updatePromotionApi(params))
          }
        }
        if (promises.length > 0) {
          Promise.all(promises).then(() => {
            this.getPromotionData()
            this.$message({ message: '活动结束成功！', type: 'success' })
          }).catch(err => {
            console.log('Start Promotion: ' + err)
            this.$message({ message: '活动结束失败！', type: 'error' })
          })
        }
      }).catch(() => {
      })
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

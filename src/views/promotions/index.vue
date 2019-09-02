<template>
  <div class="app-container">
    <el-form :inline="true" :model="query">
      <el-form-item label="活动名称">
        <el-input v-model="queryName" placeholder="输入名称关键字" clearable maxlength="20" />
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
      <el-form-item label="全天分时段活动">
        <el-switch v-model="query.dailySchedule" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
      </el-form-item>
    </el-form>
    <div>
      <el-tabs v-model="currentType" type="card" @tab-click="onTypeClicked">
        <el-tab-pane
          v-for="item in typeTabs"
          :key="item.label"
          :label="item.label"
          :name="item.name"
        >
          <div v-if="isAdminUser" style="display: flex;justify-content: space-between">
            <el-button-group>
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
                type="warning"
                icon="el-icon-sold-out"
                class="ops-button"
                @click="handleBatchStopPromotions"
              >
                批量结束活动
              </el-button>
            </el-button-group>
            <el-button-group>
              <el-button
                type="info"
                icon="el-icon-folder"
                @click="handleCreateType"
              >
                创建活动类
              </el-button>
              <el-button
                :disabled="item.name === '-1'"
                type="success"
                icon="el-icon-edit"
                @click="handleUpdateType"
              >
                修改活动类
              </el-button>
              <el-button
                :disabled="item.name === '-1'"
                type="danger"
                icon="el-icon-delete"
                @click="handleDeleteType"
              >
                删除活动类
              </el-button>
            </el-button-group>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-table
      ref="productsTable"
      v-loading="dataLoading"
      :data="promotionData"
      border
      fit
      style="width: 100%; margin-top: 20px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        align="center"
        type="selection"
        width="55"
      />
      <el-table-column label="编号" align="center" width="50">
        <template slot-scope="scope">
          <el-button type="text" @click="handleViewPromotion(scope.$index)">
            {{ scope.row.id }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="活动名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="全天分时段" align="center" width="100">
        <template slot-scope="scope">
          <span>{{ scope.row.dailySchedule ? '是' : '否' }}</span>
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
      <el-table-column label="开始时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.startDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ scope.row.endDate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140">
        <template slot-scope="scope">
          <el-dropdown v-if="isAdminUser" placement="bottom" trigger="click" @command="handleOpsAction">
            <el-button type="primary" icon="el-icon-arrow-down">
              选择操作
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                :command="`publish:${scope.$index}`"
                :disabled="scope.row.status !== statusInit"
                icon="el-icon-sell"
              >
                发布活动
              </el-dropdown-item>
              <el-dropdown-item
                :command="`start:${scope.$index}`"
                :disabled="scope.row.dailySchedule || scope.row.status !== statusReadyForSale"
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
                :disabled="scope.row.status !== statusInit"
                icon="el-icon-edit"
              >
                修改活动
              </el-dropdown-item>
              <el-dropdown-item
                :command="`stop:${scope.$index}`"
                :disabled="scope.row.status === statusInit || scope.row.status === statusOffShelves"
                icon="el-icon-sold-out"
                divided
              >
                结束活动
              </el-dropdown-item>
              <el-dropdown-item
                :command="`delete:${scope.$index}`"
                :disabled="scope.row.status !== statusInit"
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
      @pagination="getPromotionData"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import trim from 'lodash/trim'
import Pagination from '@/components/Pagination'
import {
  getPromotionsApi,
  searchPromotionsApi,
  updatePromotionApi,
  deletePromotionApi
} from '@/api/promotions'

import {
  promotion_status_init,
  promotion_status_published,
  promotion_status_off_shelves,
  promotion_status_ready_for_sale,
  promotion_status_on_sale,
  PromotionStatusDefinition
} from '@/utils/constants'

export default {
  name: 'PromotionActivity',
  components: { Pagination },
  filters: {
    promotionStatus: (status) => {
      const find = PromotionStatusDefinition.find(item => item.value === status)
      return find ? find.label : ''
    }
  },
  data() {
    return {
      statusInit: promotion_status_init,
      statusOffShelves: promotion_status_off_shelves,
      statusReadyForSale: promotion_status_ready_for_sale,
      statusOptions: [{
        value: 0,
        label: '全部'
      }].concat(PromotionStatusDefinition),
      query: {
        name: '',
        status: 0,
        dailySchedule: false,
        offset: 1,
        limit: 20
      },
      dataLoading: false,
      promotionSelection: [],
      promotionData: [],
      promotionTotal: 0,
      queryTypeId: '-1'
    }
  },
  computed: {
    ...mapGetters({
      isAdminUser: 'isAdminUser',
      promotionTypes: 'promotionTypes',
      promotionTypeId: 'promotionTypeId'
    }),
    queryName: {
      get() {
        return this.query.name
      },
      set(value) {
        this.query.name = trim(value)
      }
    },
    typeTabs: {
      get() {
        return [{
          name: '-1',
          label: '全部'
        }].concat(this.promotionTypes.map(type => ({ name: type.id.toString(), label: type.typeName })))
      }
    },
    currentType: {
      get() {
        return this.promotionTypeId.toString()
      },
      set(value) {
        this.$store.commit('promotions/SET_CURRENT_TYPE', Number.parseInt(value))
      }
    }
  },
  created() {
    this.$store.commit('promotions/SET_CONFLICTED_MPUS', [])
    this.getPromotionTypes()
    this.getPromotionData()
  },
  methods: {
    async getPromotionTypes() {
      try {
        await this.$store.dispatch('promotions/getTypes', { pageNo: 1, pageSize: 100 })
      } catch (e) {
        console.warn('getPromotionTypes:' + e)
      }
    },
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
        this.promotionTotal = 0
        this.promotionData = []
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
      if (this.query.dailySchedule) {
        params.dailySchedule = true
        needFilter = true
      }
      if (this.promotionTypeId >= 0) {
        this.queryTypeId = this.promotionTypeId.toString()
        params.promotionTypeId = this.promotionTypeId
        needFilter = true
      } else {
        this.queryTypeId = '-1'
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
        this.promotionTotal = 0
        this.promotionData = []
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
      this.$confirm('请确认是否立即开始此促销活动？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const id = this.promotionData[index].id
        const dateNow = moment()
        dateNow.minute(0)
        dateNow.second(0)
        const params = { id: id, status: promotion_status_on_sale }
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
      this.$confirm('请确认是否结束此促销活动？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const id = this.promotionData[index].id
        const params = { id: id, status: promotion_status_off_shelves }
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
      this.$confirm('请确认是否删除此促销活动？', '警告', {
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
    handlePublishSkuConflict(res, index) {
      this.$confirm('活动发布失败，部分商品活动时间与已发布活动冲突!', '提示', {
        confirmButtonText: '去编辑',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const mpus = Array.isArray(res.data.mpus) ? res.data.mpus : []
        if (mpus.length > 0) {
          this.$store.commit('promotions/SET_CONFLICTED_MPUS', mpus)
        }
        this.handleEditPromotion(index)
      }).catch(() => {
      })
    },
    handlePublishPromotionConflict(res) {
      this.$confirm('活动发布失败，与已发布活动冲突，此类型活动每天只能发布一个!', '提示', {
        confirmButtonText: '去查看',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const id = res.data.promotionId
        if (id) {
          this.$router.push({
            name: 'ViewPromotion',
            params: { id: id }
          })
        }
      }).catch(() => {
      })
    },
    handlePublishPromotion(index) {
      this.$confirm('请确认是否发布此促销活动，发布后将不能修改？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const id = this.promotionData[index].id
        const params = { id: id, status: promotion_status_published }
        try {
          const res = await updatePromotionApi(params)
          if (res.code === 200) {
            this.$message({ message: '活动发布成功！', type: 'success' })
            this.getPromotionData()
          } else {
            if (res.code === 500) {
              this.handlePublishSkuConflict(res, index)
            } else if (res.code === 501) {
              this.handlePublishPromotionConflict(res)
            } else {
              this.$message.error('活动发布失败，请联系管理员！')
            }
          }
        } catch (e) {
          console.warn('Start Promotion: ' + e)
          this.$message({ message: '活动发布失败！', type: 'error' })
        }
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
        case 'publish':
          this.handlePublishPromotion(index)
          break
        default:
          break
      }
    },
    handleBatchStopPromotions() {
      this.$confirm('请确认是否结束所选的促销活动？', '警告', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const promises = []
        for (const item of this.promotionSelection) {
          if (item.status === promotion_status_ready_for_sale || item.status === promotion_status_on_sale) {
            const params = { id: item.id, status: promotion_status_off_shelves }
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
    },
    onTypeClicked(type) {
      if (this.queryTypeId !== type.name) {
        this.getPromotionData()
      }
    },
    handleChangeType(name) {
      this.currentType = name
      this.getPromotionData()
    },
    async handleCreateType() {
      try {
        const action = await this.$prompt('请输入活动类的名称', '创建活动类', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await this.$store.dispatch('promotions/createType', { typeName: action.value })
        this.handleChangeType(this.typeTabs[this.typeTabs.length - 1].name)
      } catch (e) {
        console.warn('Crete prmotion type: ' + e)
      }
    },
    async handleUpdateType() {
      try {
        const action = await this.$prompt('请输入活动类的名称', '更改活动类', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        })
        await this.$store.dispatch('promotions/updateType',
          { id: this.promotionTypeId, typeName: action.value })
      } catch (e) {
        console.warn('Crete promotion type: ' + e)
      }
    },
    async handleDeleteType() {
      if (this.listLoading) {
        this.$message.warning('正在加载活动列表，请稍后操作！')
        return
      }
      if (this.promotionTotal > 0) {
        this.$message.warning('请删除此组内所有活动！')
        return
      }
      try {
        await this.$confirm('是否要删除此活动类？', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const index = this.typeTabs.findIndex(type => type.name === this.currentType)
        const nextIndex = index > 1 ? index - 1 : 0
        await this.$store.dispatch('promotions/deleteType', { promotionTypeId: this.promotionTypeId })
        this.handleChangeType(this.typeTabs[nextIndex].name)
      } catch (e) {
        console.warn('Delete promotion type:' + e)
      }
    }
  }
}
</script>

<style scoped>

  .ops-button {
    margin: 0 10px;
  }
</style>

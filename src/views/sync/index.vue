<template>
  <div v-loading="dataLoading" class="app-container">
    <el-form label-width="120px" label-position="left">
      <el-form-item label="同步平台">
        <el-radio-group v-model="platformId">
          <el-radio label="09">关爱通自营</el-radio>
          <el-radio disabled label="10">关爱通苏宁</el-radio>
          <el-radio label="11">无锡市民卡商城</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <el-divider />
    <el-tabs v-model="syncTab" type="card">
      <el-tab-pane name="products" label="商品同步">
        <div>
          <div class="tip-title">
            <i class="el-icon-warning-outline">将所选商品同步到指定平台，该平台相同商品信息将会被覆盖！</i>
          </div>
          <el-form label-width="120px">
            <el-form-item label="同步方式">
              <el-radio-group v-model="syncType">
                <el-radio label="merchant">按供应商</el-radio>
                <el-radio label="category">按类别</el-radio>
                <el-radio label="brand">按品牌</el-radio>
                <el-radio label="mpu">按商品</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="syncType === 'merchant'" label="已选供应商">
              <el-button type="primary" style="margin-bottom: 20px" @click="vendorSelectionVisible = true">
                添加供应商
              </el-button>
              <el-table
                :data="selectedMerchants"
                border
                fit
              >
                <el-table-column label="供应商名" align="center">
                  <template slot-scope="scope">
                    <span>{{ scope.row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="160px">
                  <template slot-scope="scope">
                    <el-button type="danger" @click="handleDeleteMerchant(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item v-if="syncType === 'category'" label="已选类别">
              <div v-if="categoriesLoaded">
                <el-button
                  icon="el-icon-edit"
                  type="primary"
                  style="margin-bottom: 20px"
                  @click="handleAddCategory"
                >
                  添加三级类别
                </el-button>
                <span style="margin-left: 10px"><i class="el-icon-warning-outline">只同步所选三级类别</i></span>
                <sync-category
                  v-for="(category, index) in selectedCategories"
                  :key="'category-' + index"
                  :category-value="category"
                  :index="index"
                  @categoryDelete="handleDeleteCategory"
                  @categorySet="handleSetCategory"
                />
              </div>
              <div v-else-if="categoriesLoading">
                <span>正在加载类别...</span>
              </div>
            </el-form-item>
            <el-form-item v-if="syncType === 'brand'" label="已选品牌">
              <div>
                <brands-selection
                  :brand-list="selectedBrands"
                  @add="handleAddBrand"
                  @delete="handleDeleteBrand"
                />
              </div>
            </el-form-item>
            <el-form-item v-if="syncType === 'mpu'" label="已选商品">
              <div style="margin-bottom: 20px">
                <el-button type="primary" @click="dialogSelectionVisible = true">
                  添加商品
                </el-button>
                <el-button type="info" @click="dialogImportVisible = true">
                  导入商品
                </el-button>
              </div>
              <div>已选同步{{ selectedMpus.length }}个商品</div>
              <el-table
                :data="selectedMpus"
                border
                fit
              >
                <el-table-column label="商品SKU" align="center" width="150">
                  <template slot-scope="scope">
                    <el-link :href="'/goods/viewProduct/' + scope.row.mpu" target="_blank" type="primary">
                      {{ scope.row.skuid }}
                    </el-link>
                  </template>
                </el-table-column>
                <el-table-column label="商品名" align="center">
                  <template slot-scope="scope">
                    <span>{{ scope.row.intro || scope.row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="160px">
                  <template slot-scope="scope">
                    <el-button type="danger" @click="handleDeleteMpu(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
          <el-button type="warning" @click="handleSyncProducts">开始同步商品</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane name="categories" label="类别同步">
        <div>
          <div class="tip-title">
            <i class="el-icon-warning-outline">将所选类别同步到指定平台，该平台相同类别信息将会被覆盖！</i>
          </div>
          <div style="margin-bottom: 20px">
            <categories-selection
              :category-level="selectedSyncCategoryLevel"
              :includes-sub="syncCategoryAllSubs"
              @level="value => selectedSyncCategoryLevel = value"
              @sub="value => syncCategoryAllSubs = value"
              @changed="onSyncCategoriesChanged"
            />
          </div>
          <el-button type="warning" @click="handleSyncCategories">开始同步类别</el-button>
        </div>
      </el-tab-pane>
      <el-tab-pane name="brands" label="品牌同步">
        <div>
          <div class="tip-title">
            <i class="el-icon-warning-outline">将所选品牌信息同步到指定平台，该平台相同品牌信息将会被覆盖！</i>
          </div>
          <div style="margin-bottom: 20px">
            <brands-selection
              :brand-list="selectedSyncBrands"
              @add="handleAddBrand"
              @delete="handleDeleteBrand"
            />
          </div>
          <el-button type="warning" @click="handleSyncBrands">开始同步品牌</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>
    <vendor-selection
      :dialog-visible="vendorSelectionVisible"
      :vendor-list="vendorList"
      :single-selection="false"
      @cancelled="vendorSelectionVisible = false"
      @confirmed="handleVendorSelected"
    />
    <goods-selection-dialog
      :on-sale="false"
      :dialog-visible="dialogSelectionVisible"
      @onSelectionCancelled="onGoodsSelectionCancelled"
      @onSelectionConfirmed="onGoodsSelectionConfirmed"
    />
    <goods-import-dialog
      :on-sale="false"
      :dialog-visible="dialogImportVisible"
      @onSelectionCancelled="onGoodsImportCancelled"
      @onSelectionConfirmed="onGoodsImportConfirmed"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import includes from 'lodash/includes'
import GoodsSelectionDialog from '@/components/GoodsSelectionDialog'
import GoodsImportDialog from '@/components/GoodsImportDialog'
import VendorSelection from '@/components/VendorSelection'
import { vendor_status_approved } from '@/utils/constants'
import { getVendorListApi } from '@/api/vendor'
import SyncCategory from './category'
import BrandsSelection from './brandsSelection'
import CategoriesSelection from './categoriesSelection'

export default {
  name: 'ProductSync',
  components: {
    VendorSelection,
    SyncCategory,
    GoodsSelectionDialog,
    GoodsImportDialog,
    CategoriesSelection,
    BrandsSelection
  },
  data() {
    return {
      syncTab: 'products',
      platformId: '09',
      syncType: 'merchant',
      dataLoading: false,
      vendorSelectionVisible: false,
      vendorList: [],
      selectedMerchants: [],
      selectedCategories: [],
      selectedBrands: [],
      dialogSelectionVisible: false,
      dialogImportVisible: false,
      selectedMpus: [],
      selectedSyncBrands: [],
      selectedSyncCategoryLevel: 3,
      syncCategoryAllSubs: false,
      selectedSyncCategories: []
    }
  },
  computed: {
    ...mapGetters({
      firstCategoryData: 'categories',
      secondCategoryData: 'secondClassCategories',
      categoriesLoaded: 'categoriesLoaded',
      categoriesLoading: 'categoriesLoading'
    })
  },
  created() {
    this.prepareSyncData()
  },
  methods: {
    async prepareSyncData() {
      this.dataLoading = true
      await this.getVendorList()
      await this.getAllCategories()
      this.dataLoading = false
    },
    async getVendorList() {
      try {
        const params = {
          page: 1,
          limit: 1000,
          status: vendor_status_approved
        }
        const data = await getVendorListApi(params)
        this.vendorList = data.rows.map(row => {
          return {
            id: row.company.id,
            name: row.company.name
          }
        })
      } catch (e) {
        console.warn('Product get vendor list error:' + e)
      }
    },
    async getAllCategories() {
      if (this.categoriesLoaded === false && this.categoriesLoading === false) {
        try {
          await this.$store.dispatch('categories/getAllData')
        } catch (e) {
          console.log(('Get Main Category failed: ' + e))
        }
      }
    },
    handleDeleteMerchant(index) {
      this.selectedMerchants.splice(index, 1)
    },
    handleVendorSelected(vendors) {
      this.vendorSelectionVisible = false
      const filteredList = vendors.filter(item => this.selectedMerchants.findIndex(sel => sel.id === item.id) < 0)
      this.selectedMerchants = this.selectedMerchants.concat(filteredList)
    },
    handleAddCategory() {
      if (this.selectedCategories.length <= 20) {
        this.selectedCategories.push(-1)
      } else {
        this.$message.warning('一次最多同步20个商品类别！')
      }
    },
    handleSetCategory(index, value) {
      if (value) {
        if (includes(this.selectedCategories, value)) {
          this.$message.warning('此类别已添加，请选择其它类别')
        } else {
          this.selectedCategories[index] = value
        }
      } else {
        this.selectedCategories[index] = -1
      }
    },
    handleDeleteCategory(index) {
      this.selectedCategories.splice(index, 1)
    },
    handleAddBrand(brand) {
      if (this.syncTab === 'products') {
        this.selectedBrands.push(brand)
      } else {
        this.selectedSyncBrands.push(brand)
      }
    },
    handleDeleteBrand(index) {
      if (this.syncTab === 'products') {
        this.selectedBrands.splice(index, 1)
      } else {
        this.selectedSyncBrands.splice(index, 1)
      }
    },
    onGoodsSelectionConfirmed(skus) {
      this.dialogSelectionVisible = false
      this.handleAddMpu(skus)
    },
    onGoodsSelectionCancelled() {
      this.dialogSelectionVisible = false
    },
    onGoodsImportConfirmed(skus) {
      this.dialogImportVisible = false
      this.handleAddMpu(skus)
    },
    onGoodsImportCancelled() {
      this.dialogImportVisible = false
    },
    handleDeleteMpu(index) {
      this.selectedMpus.splice(index, 1)
    },
    handleAddMpu(skus) {
      const filtered = skus.filter(sku => this.selectedMpus.findIndex(item => item.mpu === sku.mpu) < 0)
      if (filtered.length > 0 && filtered.length + this.selectedMpus.length <= 100) {
        this.selectedMpus = this.selectedMpus.concat(filtered)
      } else {
        if (filtered.length > 0) this.$message.warning('一次最多同步100个商品类别！')
      }
    },
    onSyncCategoriesChanged(values) {
      this.selectedSyncCategories = values
    },
    handleSyncProducts() {
      const validCategories = this.selectedCategories.filter(category => category !== -1)
      if (this.syncType === 'merchant' && this.selectedMerchants.length === 0) {
        this.$message.warning('请添加所需同步的供应商！')
        return
      }
      if (this.syncType === 'category' && validCategories.length === 0) {
        this.$message.warning('请添加所需同步的商品类别！')
        return
      }
      if (this.syncType === 'brand' && this.selectedBrands.length === 0) {
        this.$message.warning('请添加所需同步的商品品牌！')
        return
      }
      if (this.syncType === 'mpu' && this.selectedMpus.length === 0) {
        this.$message.warning('请添加所需同步的商品！')
        return
      }
      this.$confirm('此操作将覆盖指定同步平台相同的商品信息，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        const params = { platformId: this.platformId }
        switch (this.syncType) {
          case 'merchant':
            params.merchants = this.selectedMerchants.map(item => item.id)
            break
          case 'category':
            params.categories = validCategories
            break
          case 'brand':
            params.brands = this.selectedBrands.map(item => item.value)
            break
          case 'mpu':
            params.mpus = this.selectedMpus.map(item => item.mpu)
            break
          default:
            break
        }
        console.debug(JSON.stringify(params))
      }).catch(() => {
      })
    },
    getAllSubCategories(level, categoryId) {
      if (level === 1) {
        const firstLevel = this.firstCategoryData.find(item => item.categoryId === categoryId)
        const secondLevelList = firstLevel ? firstLevel.subs.map(item => item.categoryId) : []
        let thirdLevelList = []
        for (const secondId of secondLevelList) {
          thirdLevelList = thirdLevelList.concat(this.getAllSubCategories(2, secondId))
        }
        return secondLevelList.concat(thirdLevelList)
      } else if (level === 2) {
        const secLevel = this.secondCategoryData.find(item => item.categoryId === categoryId)
        return secLevel ? secLevel.subs.map(item => item.categoryId) : []
      }
      return []
    },
    handleSyncCategories() {
      const validCategoryList = this.selectedSyncCategories
      if (validCategoryList.length === 0) {
        this.$message.warning('请添加所需同步的商品类别！')
        return
      }
      this.$confirm('此操作将覆盖指定同步平台相同的类别信息，是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        let categoryList = validCategoryList
        if (this.syncCategoryAllSubs) {
          for (const categoryId of validCategoryList) {
            const subList = this.getAllSubCategories(this.selectedSyncCategoryLevel, categoryId)
            categoryList = categoryList.concat(subList)
          }
        }
        console.debug(categoryList)
      }).catch(() => {
      })
    },
    handleSyncBrands() {
    }
  }
}
</script>

<style scoped>
  .tip-title {
    font-size: 13px;
    margin: 10px 0;
  }
</style>

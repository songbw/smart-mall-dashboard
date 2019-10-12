<template>
  <div>
    <div style="margin-bottom: 20px">
      <el-select
        v-model="brandSelectedId"
        filterable
        remote
        placeholder="请输入商品品牌关键词"
        :remote-method="remoteBrandOptions"
        :loading="brandLoading"
      >
        <el-option
          v-for="item in brandOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button
        icon="el-icon-edit"
        type="primary"
        style="margin-left: 20px"
        @click="handleAddBrand"
      >
        添加品牌
      </el-button>
    </div>
    <el-table
      :data="brandList"
      border
      fit
    >
      <el-table-column label="品牌名" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.label }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160px">
        <template slot-scope="scope">
          <el-button type="danger" @click="handleDeleteBrand(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import isEmpty from 'lodash/isEmpty'
import { searchBrandsApi } from '@/api/brands'

export default {
  name: 'BrandsSelection',
  props: {
    brandList: {
      type: Array,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      brandLoading: false,
      brandOptions: [],
      brandSelectedId: null
    }
  },
  methods: {
    async remoteBrandOptions(query) {
      if (isEmpty(query)) {
        this.brandOptions = []
      } else {
        try {
          this.brandLoading = true
          const { data } = await searchBrandsApi({ offset: 1, limit: 20, query })
          this.brandOptions = data.result.list.map(brand => {
            // If no english name, jus return chinese name
            const name = isEmpty(brand.brandEname) ? brand.brandCname : brand.brandName
            return { value: brand.brandId, label: (name || brand.brandName) }
          })
        } catch (e) {
          console.log('Remote brand options: ' + e)
          this.brandOptions = []
        } finally {
          this.brandLoading = false
        }
      }
    },
    handleAddBrand() {
      if (this.brandSelectedId !== null) {
        const brand = this.brandOptions.find(item => item.value === this.brandSelectedId)
        this.$emit('add', brand)
      }
    },
    handleDeleteBrand(index) {
      this.$emit('delete', index)
    }
  }
}
</script>

<style scoped>

</style>

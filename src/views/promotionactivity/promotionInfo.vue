<template>
  <div>
    <el-form inline>
      <el-form-item label="活动名称">
        <el-input v-model="name" readonly />
      </el-form-item>
      <el-form-item label="活动状态">
        <el-input v-model="status" readonly />
      </el-form-item>
      <el-form-item label="活动标签">
        <el-input v-model="tag" readonly />
      </el-form-item>
    </el-form>
    <el-form inline>
      <el-form-item label="开始时间">
        <el-input v-model="startDate" readonly />
      </el-form-item>
      <el-form-item label="结束时间">
        <el-input v-model="endDate" readonly />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'PromotionInfo',
    computed: {
      ...mapGetters({
        promotionData: 'currentPromotionInfo'
      }),
      name: {
        get() {
          return this.promotionData.name
        }
      },
      status: {
        get() {
          const status = this.promotionData.status
          switch (status) {
            case 1:
              return '未开始'
            case 2:
              return '进行中'
            case 3:
              return '已结束'
            default:
              return ''
          }
        }
      },
      tag: {
        get() {
          return this.promotionData.tag
        }
      },
      startDate: {
        get() {
          return this.promotionData.startDate
        }
      },
      endDate: {
        get() {
          return this.promotionData.endDate
        }
      }
    }
  }
</script>

<style scoped>

</style>

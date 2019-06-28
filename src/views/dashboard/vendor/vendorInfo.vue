<template>
  <el-row class="panel-group">
    <el-col class="card-panel-col">
      <div class="card-panel">
        <div class="card-panel-icon-wrapper">
          <svg-icon icon-class="vendor-info" class-name="card-panel-icon" />
        </div>
        <div class="card-panel-description">
          <div class="card-panel-text">
            {{ vendorName }}
          </div>
          <div class="card-panel-button">
            <el-button type="primary" @click="handleViewVendor">
              {{ buttonLabel }}
            </el-button>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'VendorInfo',
  data() {
    return {
      loading: true
    }
  },
  computed: {
    ...mapGetters([
      'vendorProfile'
    ]),
    vendorStatus() {
      return this.vendorProfile.status
    },
    vendorName() {
      return this.vendorStatus === 0 ? '未登记企业信息' : this.vendorProfile.name
    },
    buttonLabel() {
      return this.vendorStatus === 0 ? '去登记' : '查看'
    }
  },
  methods: {
    handleViewVendor() {
      this.$router.push({ name: 'VendorProfile' })
    }
  }
}
</script>

<style lang="scss" scoped>
  .panel-group {
    margin-top: 18px;

    .card-panel-col {
      margin-bottom: 10px;
    }

    .card-panel {
      height: 108px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      color: #666;
      background: #fff;
      box-shadow: 4px 4px 40px rgba(0, 0, 0, .05);
      border-color: rgba(0, 0, 0, .05);

      .card-panel-icon-wrapper {
        float: left;
        transition: all 0.38s ease-out;
        border-radius: 6px;
      }

      .card-panel-icon {
        float: left;
        font-size: 100px;
      }

      .card-panel-description {
        float: right;
        font-weight: bold;
        margin: 26px;
        margin-left: 0;

        .card-panel-text {
          line-height: 18px;
          color: rgba(0, 0, 0, 0.45);
          font-size: 16px;
          margin-bottom: 12px;
        }
      }
    }
  }
</style>

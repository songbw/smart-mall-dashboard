<template>
  <div class="drawer-container">
    <div v-loading="loading">
      <h3 class="drawer-title">选择运营平台</h3>
      <div v-for="platform in platformOptions" :key="platform.appId" class="drawer-item">
        <span>{{ platform.name }}</span>
        <el-switch
          v-model="platform.selected"
          class="drawer-switch"
          @change="value => onPlatformChanged(value, platform.appId)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Settings',
  data() {
    return {
      loading: false,
      platformOptions: []
    }
  },
  computed: {
    ...mapGetters([
      'platformAppId',
      'validAppList'
    ])
  },
  created() {
    this.getAppPlatformList()
  },
  methods: {
    selectPlatform(appId) {
      const platform = this.platformOptions.find(option => option.appId === appId)
      if (platform) {
        platform.selected = true
      }
    },
    async getAppPlatformList() {
      try {
        if (this.validAppList.length === 0) {
          await this.$store.dispatch('app/getPlatformList')
        }
        this.platformOptions = this.validAppList.map(option => ({ selected: false, ...option }))
        this.selectPlatform(this.platformAppId)
      } catch (e) {
        console.warn('Get platform list error:' + e)
      }
    },
    async onPlatformChanged(selected, appId) {
      try {
        if (selected) {
          await this.$store.dispatch('app/setPlatformId', appId)
          for (const platform of this.platformOptions) {
            if (platform.appId !== appId) {
              platform.selected = false
            }
          }
        } else {
          if (appId === this.platformAppId) {
            this.selectPlatform(appId)
          }
        }
      } catch (e) {
        console.warn('onPlatformChanged: error ' + e)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .drawer-container {
    padding: 24px;
    font-size: 14px;
    line-height: 1.5;
    word-wrap: break-word;

    .drawer-title {
      margin-bottom: 12px;
      color: rgba(0, 0, 0, .85);
      font-size: 14px;
      line-height: 22px;
    }

    .drawer-item {
      color: rgba(0, 0, 0, .65);
      font-size: 14px;
      padding: 12px 0;
    }

    .drawer-switch {
      float: right
    }
  }
</style>

<template>
  <div v-loading="dataLoading" class="app-container">
    <el-form label-width="6rem">
      <el-form-item label="运营平台">
        <el-input readonly :value="currentAppName" style="width: 480px" />
      </el-form-item>
      <el-form-item label="热词数量">
        <el-select v-model="queryCount">
          <el-option label="TOP10" value="10" />
          <el-option label="TOP20" value="20" />
          <el-option label="TOP30" value="30" />
          <el-option label="TOP50" value="50" />
        </el-select>
      </el-form-item>
      <el-form-item label="日期范围">
        <el-date-picker
          v-model="queryDates"
          type="daterange"
          start-placeholder="选择查询开始日期"
          end-placeholder="选择查询结束日期"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="queryHotWords">
          查询
        </el-button>
        <el-button v-if="couldEdit" type="info" @click="onCreateClicked">
          添加热词
        </el-button>
      </el-form-item>
      <el-form-item v-if="wordList.length > 0">
        <span
          v-for="word in wordList"
          :key="word.value"
          style="margin-right: 12px"
        >
          <el-tag
            :closable="couldEdit"
            :type="word.type"
            effect="dark"
            @close="() => onWordCloseClicked(word)"
          >
            <span>{{ `${word.value}（${word.count}）` }}</span>
          </el-tag>
          <el-button
            v-if="couldEdit"
            :type="word.type"
            size="small"
            icon="el-icon-edit"
            style="margin-left: 6px"
            @close="() => onEditClicked(word)"
          />
        </span>
      </el-form-item>
      <el-form-item v-if="wordList.length === 0">
        <span style="font-size: 16px"><i class="el-icon-warning-outline" />未产生搜索数据</span>
      </el-form-item>
    </el-form>
    <el-dialog
      title="编辑热词"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <el-form
        ref="wordForm"
        :model="wordForm"
        :rules="wordFormRules"
        label-position="right"
        label-width="6rem"
      >
        <el-form-item label="热词名称" prop="value">
          <el-input v-model.trim="wordForm.value" maxlength="10" />
        </el-form-item>
        <el-form-item label="热词排序">
          <el-input-number v-model="wordForm.count" />
          <span style="font-size: 12px;margin-left: 12px">
            <i class="el-icon-warning-outline" />数值越大优先级越高
          </span>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="onCancelClicked">取消</el-button>
        <el-button type="primary" @click="onSubmitClicked">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getHotWordListApi } from '@/api/products'

const typeList = ['success', 'info', 'warning', 'danger']

export default {
  name: 'HotWords',
  data() {
    return {
      couldEdit: false,
      dataLoading: false,
      dialogFormVisible: false,
      queryDates: null,
      queryCount: '10',
      maxCount: 0,
      wordForm: {
        value: '',
        count: 0
      },
      wordFormRules: {},
      wordList: []
    }
  },
  computed: {
    ...mapGetters({
      appList: 'platformAppList',
      appId: 'platformAppId'
    }),
    currentAppName() {
      const find = this.appList.find(item => item.appId === this.appId)
      return find ? find.name : ''
    }
  },
  watch: {
    appId: function (value, old) {
      this.queryHotWords()
    }
  },
  created() {
    this.initData()
  },
  methods: {
    async initData() {
      await this.queryHotWords()
    },
    async queryHotWords() {
      let list = []
      try {
        this.dataLoading = true
        const params = {
          pageSize: this.queryCount
        }
        if (Array.isArray(this.queryDates) && this.queryDates.length === 2) {
          params.startTime = this.queryDates[0]
          params.endTime = this.queryDates[1]
        }
        const { code, data } = await getHotWordListApi(params)
        if (code === 200 && Array.isArray(data)) {
          const typeLength = typeList.length
          list = data
            .filter(item => item.appId === this.appId)
            .flatMap(item => item.hotWordList)
            .map((item, index) => ({
              value: item.work,
              count: item.count,
              type: typeList[index % typeLength]
            }))
        }
      } catch (e) {
        console.warn('Get hot word list error:' + e)
      } finally {
        this.dataLoading = false
        this.wordList = list
      }
    },
    onCreateClicked() {
      this.wordForm.value = ''
      this.wordForm.count = this.maxCount + 1
      this.dialogFormVisible = true
    },
    onWordCloseClicked(word) {
      console.debug(JSON.stringify(word))
    },
    onEditClicked(word) {
    },
    onCancelClicked() {
      this.$refs.wordForm.clearValidate()
      this.dialogFormVisible = false
    },
    onSubmitClicked() {
    }
  }
}
</script>

<style scoped>

</style>

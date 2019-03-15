<template>
  <el-form v-loading="creatingPage" ref="ruleForm" :model="pageForm" :rules="pageRules"
           label-position="right" label-width="120px" status-icon>
    <el-form-item :label="$t('aggregation_creation_form_name_title')" prop="name" required>
      <el-input v-model="pageName"/>
    </el-form-item>
    <el-form-item :label="$t('aggregation_creation_form_home_title')" prop="homePage">
      <el-switch v-model="homePage"/>
    </el-form-item>
    <el-form-item :label="$t('aggregation_creation_form_date_title')" prop="effectiveDate" required>
      <el-date-picker
        :placeholder="$t('aggregation_creation_form_date_placeholder')"
        v-model="pageDate"
        type="date"
        format="yyyy/MM/dd"
        value-format="yyyy-MM-dd"
      />
    </el-form-item>
    <el-form-item :label="$t('aggregation_creation_form_color_title')" prop="backgroundColor">
      <el-color-picker v-model="pageColor"/>
      <el-tag>{{ pageColor }}</el-tag>
    </el-form-item>
    <el-form-item>
      <el-button @click="$emit('cancelCreation')">{{ $t('confirm_button_cancel_title') }}</el-button>
      <el-button type="primary" @click="onSubmit">{{ $t('aggregation_creation_form_confirm_title') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    name: 'CreationForm',
    data() {
      return {
        creatingPage: false,
        pageForm: {
          name: null,
          homePage: null,
          effectiveDate: null,
          backgroundColor: null
        },
        pageRules: {
          name: [
            { required: true, message: this.$t('aggregation_creation_form_name_validator'), trigger: 'change' }
          ],
          effectiveDate: [
            { required: true, message: this.$t('aggregation_creation_form_date_validator'), trigger: 'change' }
          ]
        }
      }
    },
    computed: {
      ...mapGetters({
        pageInfo: 'currentAggregationInfo'
      }),
      pageName: {
        get() {
          return this.pageForm.name ? this.pageForm.name : this.pageInfo.name
        },
        set(newValue) {
          this.pageForm.name = newValue
        }
      },
      homePage: {
        get() {
          return this.pageForm.homePage !== null ? this.pageForm.homePage : this.pageInfo.homePage
        },
        set(newValue) {
          this.pageForm.homePage = newValue
        }
      },
      pageDate: {
        get() {
          return this.pageForm.effectiveDate ? this.pageForm.effectiveDate : this.pageInfo.effectiveDate
        },
        set(newValue) {
          this.pageForm.effectiveDate = newValue
        }
      },
      pageColor: {
        get() {
          return this.pageForm.backgroundColor ? this.pageForm.backgroundColor : this.pageInfo.backgroundColor
        },
        set(newValue) {
          this.pageForm.backgroundColor = newValue
        }
      }
    },
    methods: {
      onSubmit() {
        let changed = false
        if (this.pageForm.name === null) {
          this.pageForm.name = this.pageInfo.name
        } else {
          if (this.pageForm.name !== this.pageInfo.name) {
            changed = true
          }
        }
        if (this.pageForm.homePage == null) {
          this.pageForm.homePage = this.pageInfo.homePage
        } else {
          if (this.pageForm.homePage !== this.pageInfo.homePage) {
            changed = true
          }
        }
        if (this.pageForm.effectiveDate === null) {
          this.pageForm.effectiveDate = this.pageInfo.effectiveDate
        } else {
          if (this.pageForm.effectiveDate !== this.pageInfo.effectiveDate) {
            changed = true
          }
        }
        if (this.pageForm.backgroundColor === null) {
          this.pageForm.backgroundColor = this.pageInfo.backgroundColor
        } else {
          if (this.pageForm.backgroundColor !== this.pageInfo.backgroundColor) {
            changed = true
          }
        }
        const pageID = this.pageInfo.id
        this.$refs.ruleForm.validate((valid) => {
          if (valid) {
            this.creatingPage = true
            if (pageID === -1) {
              this.$store.dispatch('createAggregationPage', this.pageForm).then((id) => {
                this.$emit('createPage', id)
              }).catch(err => {
                this.$message(err)
              }).finally(() => {
                this.creatingPage = false
              })
            } else {
              if (changed) {
                const params = { id: pageID, ...this.pageForm }
                this.$store.dispatch('updateAggregationPage', params).then(() => {
                  this.$emit('createPage', pageID)
                }).catch(err => {
                  this.$message(err)
                }).finally(() => {
                  this.creatingPage = false
                })
              } else {
                this.$emit('createPage', pageID)
                this.creatingPage = false
              }
            }
          }
        })
      }
    }
  }
</script>

<style scoped>

</style>

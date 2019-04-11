<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :rules="formRules" class="order_form">
      <el-row :gutter="0" class="form_row">
        <el-col :span="1.5" class="form_col">
          <el-form-item class="order_form_label" label="订单编号:" />
        </el-col>
        <el-col :span="3" prop="mainId" class="form_col">
          <el-form-item prop="mainId">
            <el-input class="order_form_input" v-model="form.mainId" name="mainId" />
          </el-form-item>
        </el-col>
        <el-col :span="1.5" :offset="1" class="form_col">
          <el-form-item class="order_form_label" label="快递单号:" />
        </el-col>
        <el-col :span="3" class="form_col">
          <el-form-item prop="deliveryId">
            <el-input class="order_form_input" v-model="form.deliveryId" name="deliveryId" />
          </el-form-item>
        </el-col>
        <el-col :span="1.5" :offset="1" class="form_col">
          <el-form-item class="order_form_label" label="用户编号:" />
        </el-col>
        <el-col :span="3" class="form_col">
          <el-form-item prop="userId">
            <el-input class="order_form_input" v-model="form.userId" name="userId" />
          </el-form-item>
        </el-col>
        <el-col :span="1.5" :offset="1" class="form_col">
          <el-form-item class="order_form_label" label="子订单号:" />
        </el-col>
        <el-col :span="3" class="form_col">
          <el-form-item prop="subId">
            <el-input class="order_form_input" v-model="form.subId" name="subId" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" class="form_row" type="flex">
        <el-col :span="1.5" class="form_col">
          <el-form-item class="order_form_label" label="支付日期:" />
        </el-col>
        <el-col :span="3" class="form_col">
          <el-date-picker class="order_form_input"
                          v-model="form.payDateBegin"
                          type="date"
                          value-format="yyyy-MM-dd"
                          format="yyyy-MM-dd"
                          placeholder="请选择日期" />
        </el-col>
        <el-col :span="1.5" :offset="2" class="form_col">
          <el-form-item class="order_form_label" label="至:" />
        </el-col>
        <el-col :span="3" class="form_col">
          <el-date-picker class="order_form_input"
                          v-model="form.payDateEnd"
                          type="date"
                          value-format="yyyy-MM-dd"
                          format="yyyy-MM-dd"
                          placeholder="请选择日期" />
        </el-col>
        <el-col :span="2" :offset="3" class="form_col">
          <el-form-item class="order_form_label" label="手机号码:" />
        </el-col>
        <el-col :span="3" class="form_col">
          <el-form-item prop="phoneNum">
            <el-input class="order_form_input" v-model="form.phoneNum" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="0" class="form_row">
        <!--el-col :span="1.5" class="form_col">
          <el-form-item :class="order_form_label" label="配送状态:" />
        </el-col-->
        <!--el-col :span="3" class="form_col">
          <el-select :class="order_form_input" v-model="form.deliveryStat" placeholder="请选择配送状态">
            <el-option label="全部" value="0" />
            <el-option label="待配送" value="1" />
            <el-option label="配送成功" value="2" />
            <el-option label="配送失败" value="3" />
            <el-option label="配送取消" value="4" />
            <el-option label="已发货" value="5" />
          </el-select>
        </el-col-->
        <el-col :span="1.5" :offset="1" class="form_col">
          <el-form-item>
            <el-button type="primary" @click="order_onSubmit">查询</el-button>
            <el-button @click="order_onCancel">重置</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div v-if="isShowTable">
      <el-table
        v-loading="listLoading"
        :row-class-name="order_tableRowClassName"
        :data="list"
        :span-method="order_getSpan"
        :header-cell-style="order_setHeadStyle"
        :row-style="order_setRowStyle"
        :cell-style="order_setCellStyle"
        element-loading-text="Loading"
        show-header
        border
        stripe
        fit
        style="width:97%"
        highlight-current-row
      >
        <el-table-column label="大订单编号" width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column label="子订单编号" width="200" align="center">
          <template slot-scope="scope">
            {{ scope.row.subOrderId }}
          </template>
        </el-table-column>
        <el-table-column label="商品编号" width="100" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.skuId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="商品图片" width="100" align="center">
          <template slot-scope="scope">
            <img :src="scope.row.image" width="80" height="80">
          </template>
        </el-table-column>
        <el-table-column class-name="status-col" label="商品名称" width="300" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="购买数量" width="60">
          <template slot-scope="scope">
            <span>{{ scope.row.num }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="支付时间" width="120">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span>{{ scope.row.paymentAt | formatDateTime }}</span>
          </template>
        </el-table-column>
        <!--el-table-column align="center" label="配送完成时间" width="120">
          <template slot-scope="scope">
            <i class="el-icon-time" />
            <span>{{ scope.row.deliveryDate }}</span>
          </template>
        </el-table-column-->
        <el-table-column align="center" label="订单状态" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.status | formatDeliveryStat }}</span>
          </template>
        </el-table-column>
        <!--el-table-column align="center" label="操作类型" width="80">
          <template slot-scope="scope">
            <span>{{ scope.row.deliveryType | formatDeliveryType }}</span>
          </template>
        </el-table-column-->
        <!--el-table-column align="center" label="支付编号" width="140">
          <template slot-scope="scope">
            <span>{{ scope.row.payNo }}</span>
          </template>
        </el-table-column-->
        <el-table-column align="center" label="操 作" width="150">
          <template slot-scope="scope">
            <!--a target="_self" href="##" onmouseover="style='color:blue'" onmouseleave="style='color:black'">查看详情</a-->
            <el-button type="text" @click="order_rowClick(scope.row, true)">查看详情</el-button>
            <span style="margin-left: 20px" />
            <el-button type="text" @click="order_rowClick(scope.row, false)">备注</el-button>
            <!--a target="_self" href="##" onclick="alert('add notes')" onmouseover="style='color:blue'" onmouseleave="style='color:black'" >备注</a-->
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :page-sizes="pageSizeList"
        :page-size="pageSize"
        :current-page="pageNo"
        :total="totalNum"
        :background="true"
        layout="prev, pager, next, jumper, ->, total"
        @size-change="order_handleSizeChange"
        @current-change="order_handleCurrentChange" />
    </div>
    <order-dialog v-if="dialogVisible"
                  :id="currentMainId"
                  :can-change-address="mayChangeAddress"
                  :remark="notes"
                  title="备注:"
                  @apply="order_handleAddNotes"
                  @close="order_handleDialogClose" />
    <order-detail v-if="detailVisible"
                  :id="currentMainId"
                  :can-change-address="mayChangeAddress"
                  @close="order_handleDetailClose" />
  </div>
</template>

<script>
  import { getOrderList } from '@/api/orders'
  import { addOrderNotes } from '@/api/orders'
  import OrderDetail from './orderDetail'
  import OrderDialog from './orderDialog'

  export default {
    components: {
      OrderDetail,
      OrderDialog
    },
    filters: {
      formatDateTime(val){
        if (null === val) {
          return ' '
        } else {
          var origStr = val + ' '
          var dateStr = origStr.slice(0, 10)
          var timeStr = origStr.slice(11, 19)
          var resultStr = dateStr.concat(' ', timeStr)
          return resultStr
        }
      },
      formatDeliveryStat(val) {
        switch (val) {
          case 0:
            return '待付款'
          case 1:
            return '待收货'
          case 2:
            return '已完成'
          case 3:
            return '已取消'
          default:
            return '删除'
        }
      },
      formatDeliveryType(val) {
        switch (val) {
          case 0:
            return '首次配送'
          default:
            return '多次配送'
        }
      }
    },
    data() {
      const ruleValidateMainId = (rule, value, callback) => {
        if (value.length > 0 && value.length < 2) {
          callback(new Error('不能小于1位'))
        } else {
          callback()
        }
      }
      const validateSubId = (rule, value, callback) => {
        // console.log('sub id')
        if (value.length > 0 && value.length < 1) {
          callback(new Error('不能小于1位'))
        } else {
          callback()
        }
      }
      const validateUserId = (rule, value, callback) => {
        // console.log('user id')
        if (value.length > 0 && value.length < 2) {
          callback(new Error('不能小于2位'))
        } else {
          callback()
        }
      }
      const validateDeliveryId = (rule, value, callback) => {
        // console.log('delivery id')
        if (value.length > 0 && value.length < 2) {
          callback(new Error('不能小于2位'))
        } else {
          callback()
        }
      }
      const validatePhoneNum = (rule, value, callback) => {
        // console.log('phone number')
        if (value.length > 0 && value.length < 8) {
          callback(new Error('不能小于8位'))
        } else {
          callback()
        }
      }
      return {
        form: {
          mainId: '',
          deliveryId: '',
          userId: '',
          subId: '',
          payDateBegin: '',
          payDateEnd: '',
          deliveryDateBegin: '',
          deliveryDateEnd: '',
          deliveryStat: '',
          phoneNum: ''
        },
        postData: {
          pageIndex: 1,
          pageSize: 10,
          userId: '',
          detailId: 0,
          orderId: '',
          deliveryId: '',
          deliveryStatus: '',
          mobile: '',
          payDateStart: '',
          payDateEnd: ''
        },
        formRules: {
          mainId: [{ required: false, trigger: 'blur', validator: ruleValidateMainId }],
          subId: [{ required: false, trigger: 'blur', validator: validateSubId }],
          userId: [{ required: false, trigger: 'blur', validator: validateUserId }],
          deliveryId: [{ required: false, trigger: 'blur', validator: validateDeliveryId }],
          phoneNum: [{ required: false, trigger: 'blur', validator: validatePhoneNum }]
        },
        list: null,
        notes: '',
        currRow: 0,
        currentMainId: '',
        mayChangeAddress: false,
        listLoading: false,
        isShowTable: false,
        dialogVisible: false,
        detailVisible: false,
        pageNo: 1,
        pageSize: 10,
        totalNum: 5,
        pageSizeList: [10, 20, 100, 200]
      }
    },
    created() {
      this.order_fetchData(this.pageNo, this.pageSize)
    },
    methods: {
      order_clearUpForm() {
        this.form.mainId = ''
        this.form.deliveryId = ''
        this.form.userId = ''
        this.form.subId = ''
        this.form.payDateBegin = ''
        this.form.payDateEnd = ''
        this.form.deliveryDateBegin = ''
        this.form.deliveryDateEnd = ''
        this.form.deliveryStat = ''
        this.form.phoneNum = ''
      },
      order_onSubmit() {
        // this.$message('submit!')
        this.pageNo = 1
        this.pageSize = 10
        this.order_fetchData(this.pageNo, this.pageSize)
      },
      order_onCancel() {
        this.$message({
          message: 'cancel!',
          type: 'warning'
        })
        this.isShowTable = false
        this.order_clearUpForm()
      },
      order_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'border-style:outset;'
      },
      order_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5; border: 1px; solid #0094ff; border-collapse: collapse;'
      },
      order_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      order_sortByKey(a, k) {
        return a.sort(function (c, d) {
          var x = c[k]
          var y = d[k]
          return ((x > y) ? -1 : ((x < y) ? 1 : 0))
        })
      },
      order_countRowSpan(l, key) {
        var k = 0
        var j = 0
        var i = 0
        for (k = 0; k < l.length; k++) {
          this.$set(l[k], 'rowSpan', 1)
          this.$set(l[k], 'isShow', true)
        }
        for (k = 0; k < l.length; k = k + j + 1) {
          j = 0
          for (i = k + 1; i < l.length; i++) {
            if (l[k][key] === l[i][key]) {
              l[k]['rowSpan']++
              l[i]['isShow'] = false
              j++
            } else {
              break
            }
          }
        }
      },
      order_getSpan({ row, column, rowIndex, columnIndex }) {
        if ((columnIndex === 0 || columnIndex === 10) && this.list[rowIndex].rowSpan > 1) {
          return {
            rowspan: this.list[rowIndex].rowSpan,
            colspan: 1
          }
        } else {
          if ((columnIndex === 0 || columnIndex === 10) && this.list[rowIndex].isShow === false) {
            return {
              rowspan: 0,
              colspan: 0
            }
          } else {
            return {
              rowspan: 1,
              colspan: 1
            }
          }
        }
      },
      order_fetchData(pageIndex, pageSize) {
        this.isShowTable = true
        this.listLoading = true
        // console.log('try get list')
        this.postData.pageIndex = pageIndex
        this.postData.pageSize = pageSize
        if (this.form.userId !== null) {
          this.postData.userId = this.form.userId
        }
        if (this.form.mainId !== null) {
          this.postData.orderId = this.form.mainId
        }
        if (this.form.subId !== null) {
          this.postData.detailId = (this.form.subId)
        }
        if (this.form.deliveryId !== null) {
          this.postData.deliveryId = this.form.deliveryId
        }

        if (this.form.phoneNum !== null) {
          this.postData.mobile = this.form.phoneNum
        }
        if (this.form.payDateBegin !== null) {
          this.postData.payDateStart = this.form.payDateBegin
        }
        if (this.form.payDateEnd !== null) {
          this.postData.payDateEnd = this.form.payDateEnd
        }

        getOrderList(this.postData).then(response => {
          // console.log('got list')
          this.list = response.result.list
          this.listLoading = false
          this.pageNo = pageIndex
          this.pageSize = response.result.pageSize
          this.totalNum = response.result.total
          this.order_sortByKey(this.list, 'id')
          this.order_countRowSpan(this.list, 'id')
        }).catch(error => {
          this.listLoading = false
        })
      },
      order_tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex
      },
      order_rowClick(row, isDetail) {
        this.currRow = row.index
        this.notes = row.remark
        this.currentMainId = row.id
        if (row.status === 0) {
          this.mayChangeAddress = true
        } else {
          this.mayChangeAddress = false
        }
        if (isDetail) {
          this.detailVisible = true
        } else {
          this.dialogVisible = true
        }
        // console.log('row click at :' + row.id)
      },
      order_handleSizeChange(val) {
        // val is the number per page
        this.pageSize = val
        this.pageNo = 1
        this.order_fetchData(1, val)
      },
      order_handleCurrentChange(val) {
        if (val === 0) {
          val = 1
        }
        this.pageNo = val
        this.order_fetchData(val, this.pageSize)
      },
      order_handleDialogClose() {
        // console.log('got emit close')
        this.dialogVisible = false
        this.notes = ''
        // console.log('set dialogVisible to false')
      },
      order_handleAddNotes(val) {
        // console.log('got emit apply with : ' + val)
        addOrderNotes(this.currentMainId, val)
        this.dialogVisible = false
      },
      order_handleDetailClose() {
        // console.log('detail dialog closed')
        this.detailVisible = false
      }
    }
  }
</script>

<style scope>

  .order_form {
    margin-left: 5px;
    align: right;
  }

  .order_form_label {
    font-family: "宋体", "Verdana", "Arial", "Helvetica", "sans-serif";
    font-size: 12px;
    color: #000000;
    align: right;
  }

  .order_form_input {
    font-size: 12px;
    color: #000000;
    word-break: break-all;
    text-align: right;
    height: 22px;
  }

</style>


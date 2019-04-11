<template>
  <div>
    <el-dialog
      :before-close="order_handleDialogClose"
      :visible.sync="isVisible"
      width="96%">
      <table :class="$style.order_detail_table">
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" width="100px" align="center">订单编号</td>
          <td :class="$style.order_detail_table" width="500px">{{ trade_no }}</td>
          <td :class="$style.order_detail_table" width="100px" align="center">创建者</td>
          <td :class="$style.order_detail_table" width="100px">{{ owner_name }}</td>
          <td :class="$style.order_detail_table" width="100px" align="center">创建时间</td>
          <td :class="$style.order_detail_table" width="400px">{{ create_date | formatDateTime }}</td>
          <td :class="$style.order_detail_table" width="100px" align="center">下单时间</td>
          <td :class="$style.order_detail_table" width="260px">{{ order_date | formatDateTime }}</td>
        </tr>
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" align="center">收件人</td>
          <td :class="$style.order_detail_table">{{ user }}</td>
          <td :class="$style.order_detail_table" align="center">收件人电话</td>
          <td :class="$style.order_detail_table">{{ phone }}</td>
          <td :class="$style.order_detail_table" align="center">邮编</td>
          <td :class="$style.order_detail_table">{{ zip_code }}</td>
          <td :class="$style.order_detail_table" align="center">延长收货</td>
          <td :class="$style.order_detail_table">{{ day_delay }}</td>
        </tr>
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" align="center">是否开票</td>
          <td :class="$style.order_detail_table">{{ need_invoice }}</td>
          <td :class="$style.order_detail_table" align="center">开票金额</td>
          <td :class="$style.order_detail_table">{{ invoice_amount }}</td>
          <td :class="$style.order_detail_table" align="center">开票抬头</td>
          <td :class="$style.order_detail_table">{{ invoice_title }}</td>
          <td :class="$style.order_detail_table" align="center">纳税人识别号</td>
          <td :class="$style.order_detail_table">{{ taxpayer_id }}</td>
        </tr>
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" align="center">收货地址</td>
          <td rowspan="1" colspan="8">{{ delivery_address }}</td>
        </tr>
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" align="center">配送说明</td>
          <td rowspan="1" colspan="8">{{ delivery_notes }}</td>
        </tr>
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" align="center">总金额</td>
          <td :class="$style.order_detail_table">{{ payment_amount }}</td>
          <td :class="$style.order_detail_table" align="center">商品金额</td>
          <td :class="$style.order_detail_table">{{ goods_fee }}</td>
          <td :class="$style.order_detail_table" align="center">运费金额</td>
          <td rowspan="1" colspan="4">{{ delivery_fee }}</td>
        </tr>
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" align="center">支付明细</td>
          <td rowspan="1" colspan="8">{{ payment_detail }}</td>
        </tr>
        <tr :class="$style.order_detail_table">
          <td :class="$style.order_detail_table" align="center">商家备注</td>
          <td rowspan="1" colspan="8">{{ seller_notes }}</td>
        </tr>
      </table>
      <br>
      <div v-if="canChangeAddress" align="left">
        <span>新收货地址:</span>
        <input v-model="newAddress" size="60" maxlength="200">
        <button v-if="newAddress.length > 0" type="primary" @click="order_handleChange">
          修改收货地址
        </button>
      </div>
      <br>
      <div>
        <el-table
          :data="list"
          :header-cell-style="order_setHeadStyle"
          :row-style="order_setRowStyle"
          :cell-style="order_setCellStyle"
          element-loading-text="Loading"
          show-header
          border
          stripe
          fit
          style="width:100%"
          highlight-current-row>
          <el-table-column label="子订单编号" width="160" align="center">
            <template slot-scope="scope">
              {{ scope.row.id }}
            </template>
          </el-table-column>
          <el-table-column label="渠道编号" width="150" align="center">
            <template slot-scope="scope">
              {{ scope.row.aoyiProdIndex.id }}
            </template>
          </el-table-column>
          <el-table-column label="兑换品编号" width="160" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.aoyiProdIndex.skuid }}</span>
            </template>
          </el-table-column>
          <el-table-column label="兑换品图片" width="100" align="center">
            <template slot-scope="scope">
              <img :src="scope.row.aoyiProdIndex.image" width="60" height="60">
            </template>
          </el-table-column>
          <el-table-column class-name="status-col" label="兑换品名称" width="330" align="center">
            <template slot-scope="scope">
              <span>{{ scope.row.aoyiProdIndex.name }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="商品供应商" width="130">
            <template slot-scope="scope">
              <span>{{ scope.row.aoyiProdIndex.brand }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="配送供应商" width="130">
            <template slot-scope="scope">
              <span>{{ scope.row.brand }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="订单状态" width="100">
            <template slot-scope="scope">
              <span>{{ scope.row.status | formatOrderStatus}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="支付类型" width="140">
            <template slot-scope="scope">
              <span>{{ scope.row.paymentType | formatPaymentType }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="积分/元" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.virtualCoin }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="兑换数量" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.exchangeAmount }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="退货次数" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.returnTimes }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="换货次数" width="80">
            <template slot-scope="scope">
              <span>{{ scope.row.exchangeTimes }}</span>
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
      <div align="center">
        <el-button type="primary" @click="order_handleDialogClose">
          关闭
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { changeAddress, getOrderDetail } from '@/api/orders'

  export default {
    name: 'OrderDetail',
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
      formatOrderStatus(val) {
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
      formatDeliveryStat(val) {
        switch (val) {
          case 0:
            return '配送成功'
          case 1:
            return '配送取消'
          default:
            return '配送进行中'
        }
      },
      formatPaymentType(val) {
        switch (val) {
          case 0:
            return '可变积分'
          default:
            return '可变积分+现金'
        }
      }
    },
    props: {
      id: {
        type: Number,
        required: true
      },
      canChangeAddress: {
        type: Boolean,
        required: true
      }
    },
    data() {
      return {
        trade_no: '',
        order_id: 1,
        owner_name: '',
        order_date: '',
        create_date: '',
        user: '',
        phone: '',
        zip_code: '',
        day_delay: '',
        need_invoice: '否',
        invoice_amount: 1.10,
        invoice_title: '',
        taxpayer_id: '',
        delivery_address: '',
        delivery_notes: '',
        payment_amount: 1.1,
        goods_fee: 1.1,
        delivery_fee: 1.1,
        payment_detail: '',
        seller_notes: '',
        pageNo: 1,
        pageSize: 10,
        totalNum: 5,
        pageSizeList: [10, 20, 100, 200],
        newAddress: '',
        status: '',
        list: null,
        response: null,
        listLoading: false,
        dialogVisible: false,
        isVisible: true,
        closed: false
      }
    },
    created() {
      this.isVisible = true
      this.order_fetchData(this.id, this.pageNo, this.pageSize)
    },
    methods: {
      order_fetchData(id, pageIndex, pageSize) {
        this.listLoading = true
        getOrderDetail(id, pageIndex, pageSize).then(response => {
          this.response = response.result.object
          this.list = this.response.skus
          this.trade_no = this.response.tradeNo
          this.order_id = this.response.id
          this.owner_name = this.response.openId
          this.order_date = this.response.createdAt
          this.create_date = this.response.createdAt
          this.user = this.response.receiverName
          this.phone = this.response.telephone
          this.zip_code = this.response.zip
          this.status = this.response.status
          this.day_delay = 0
          if (this.response.invoiceState !== null) {
            if (this.response.invoiceState === '1') {
              this.need_invoice = '是'
            }
          }
          this.invoice_amount = this.response.amount
          this.invoice_title = this.response.invoiceTitle
          this.taxpayer_id = this.response.companyCustNo
          this.delivery_address = this.response.address
          this.delivery_notes = ' '
          this.payment_amount = this.response.amount
          this.goods_fee = this.response.amount - this.response.servFee
          this.delivery_fee = this.response.servFee
          this.payment_detail = this.response.invoiceContent
          this.seller_notes = this.response.remark
          this.listLoading = false
          this.pageNo = pageIndex
          this.pageSize = this.response.pageSize
          this.totalNum = this.response.total
          if (null !== this.list) {
            var k = 0
            for (k = 0; k < this.list.length; k++) {
              this.list[k].status = this.status
            }
          }
        })
      },
      order_handleChange() {
        changeAddress(this.id, this.newAddress)
        this.delivery_address = this.newAddress
        this.newAddress = ''
      },
      order_handleDialogClose() {
        this.$emit('close')
        this.closed = true
        this.isVisible = false
        // console.log('detail dialog close')
      },
      order_setCellStyle(row, column, rowIndex, columnIndex) {
        return 'border-style:outset;'
      },
      order_setRowStyle(row, rowIndex) {
        return 'background-color: #f7f6f5'
      },
      order_setHeadStyle(row, column, rowIndex, columnIndex) {
        return 'background-color:#b0c4de; color:#565552;border-style:outset;'
      },
      order_handleSizeChange(val) {
        // val is the number per page
        this.pageSize = val
        this.pageNo = 1
        this.order_fetchData(this.id, 1, val)
      },
      order_handleCurrentChange(val) {
        this.pageNo = val
        this.order_fetchData(this.id, val, this.pageSize)
      }
    }
  }
</script>
<style module>
  .order_detail_table {
    border: 1px solid #0094ff;
    min-height: 25px;
    line-height: 25px;
    border-collapse: collapse;
  }
</style>


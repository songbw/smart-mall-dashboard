export const app_upload_url = `${process.env.VUE_APP_BASE_URL}/bases/upload/relative`
export const storage_key_token = 'user_token'
export const storage_key_name = 'user_name'
export const storage_key_phone = 'user_phone'
export const storage_key_role = 'user_role'
export const storage_merchant_id = 'merchant_id'

export const role_vendor_name = 'vendor'
export const role_admin_name = 'admin'

export const vendor_status_init = 0
export const vendor_status_editing = 1
export const vendor_status_reviewing = 2
export const vendor_status_approved = 3
export const vendor_status_rejected = 4

export const product_state_off_shelves = 0
export const product_state_on_sale = 1
export const product_state_is_editing = -1
export const ProductStateOptions = [
  {
    value: product_state_is_editing,
    label: '编辑中'
  }, {
    value: product_state_on_sale,
    label: '销售中'
  }, {
    value: product_state_off_shelves,
    label: '已下架'
  }
]

export const OrderStatusDefinitions = [{
  value: -1,
  label: '已删除'
}, {
  value: 0,
  label: '待付款'
}, {
  value: 1,
  label: '待收货'
}, {
  value: 2,
  label: '已完成'
}, {
  value: 3,
  label: '已取消'
}]

export const PaymentStatusDefinitions = [{
  value: 0,
  label: '初始状态'
}, {
  value: 1,
  label: '等待支付'
}, {
  value: 2,
  label: '支付中'
}, {
  value: 3,
  label: '超时未支付'
}, {
  value: 4,
  label: '支付失败'
}, {
  value: 5,
  label: '支付成功'
}, {
  value: 11,
  label: '记账成功'
}, {
  value: 12,
  label: '记账失败'
}, {
  value: 14,
  label: '退款失败'
}, {
  value: 15,
  label: '退款成功'
}]


export const orderStatus = [{
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

export const paymentStatus = [{
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

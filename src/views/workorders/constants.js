export const WorkOrderStatus = [{
  value: 1,
  label: '待审核'
}, /* {
  value: 2,
  label: '审核中'
}, */{
  value: 3,
  label: '审核通过'
}, /* {
  value: 4,
  label: '审核有问题'
}, */{
  value: 5,
  label: '处理中'
}, {
  value: 6,
  label: '处理完成'
}, {
  value: 7,
  label: '退款中'
}]

export const type_return_all = 1
export const type_change_good = 2
export const type_refund_only = 3

export const WorkOrderTypes = [{
  value: type_return_all,
  label: '退货退款'
}, {
  value: type_change_good,
  label: '客户换货'
}, {
  value: type_refund_only,
  label: '仅退款'
}]

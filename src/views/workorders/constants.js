import { WorkOrderStatusDefinition } from '@/utils/constants'

export const WorkOrderStatus = WorkOrderStatusDefinition

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

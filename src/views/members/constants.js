export const balance_flow_type_init = -1
export const balance_flow_type_pay = 0
export const balance_flow_type_refund = 1
export const balance_flow_type_charge = 2

export const BalanceFlowTypeDefinitions = [
  {
    value: balance_flow_type_init,
    label: '初始化'
  }, {
    value: balance_flow_type_pay,
    label: '支付'
  }, {
    value: balance_flow_type_charge,
    label: '充值'
  }, {
    value: balance_flow_type_refund,
    label: '退款'
  }
]

export const balance_flow_status_prepaid = 0
export const balance_flow_status_paid = 1

export const BalanceFlowStatusDefinitions = [{
  value: balance_flow_status_prepaid,
  label: '预支付'
}, {
  value: balance_flow_status_paid,
  label: '已支付'
}]

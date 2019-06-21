import {
  vendor_status_init,
  vendor_status_editing,
  vendor_status_reviewing,
  vendor_status_approved,
  vendor_status_rejected
} from '@/utils/constants'

export const IndustryDefinitions = [
  {
    value: 'FINANCE',
    label: '金融'
  },
  {
    value: 'GAME',
    label: '游戏'
  },
  {
    value: 'TRAFFIC',
    label: '交通'
  },
  {
    value: 'LIFE',
    label: '生活'
  },
  {
    value: 'E_BUSINESS',
    label: '电商'
  },
  {
    value: 'SOCIAL',
    label: '社交'
  },
  {
    value: 'CATERERS',
    label: '餐饮'
  },
  {
    value: 'CAR',
    label: '汽车'
  },
  {
    value: 'RECRUIT',
    label: '招聘'
  },
  {
    value: 'OTHER',
    label: '其他'
  }
]

export const VendorStatus = [
  {
    value: vendor_status_init,
    label: '未登记'
  },
  {
    value: vendor_status_editing,
    label: '编辑中'
  },
  {
    value: vendor_status_reviewing,
    label: '审核中'
  },
  {
    value: vendor_status_approved,
    label: '审核通过'
  },
  {
    value: vendor_status_rejected,
    label: '审核失败'
  }
]

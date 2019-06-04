import request from '@/utils/request'

export function getGroupBuyingListApi(params) {
  return request({
    url: '/adminGroupBuying/campaigns',
    method: 'get',
    params
  })
}

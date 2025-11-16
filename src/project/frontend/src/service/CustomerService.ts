import { PageParam, PageResult } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import { Customer, CustomerInfo } from '@/model/Customer'

const client = new RequestClient('admin/v1/user/customer')

export default {
  /** 用户列表 */
  list(param?: PageParam & { status?: number }) {
    return client.get<PageResult<Customer>>('list', param)
  },
  /** 更新C端用户 */
  updateUser(param?: {
    id: number
    vip_type?: number
    status?: number
    vip_subjects?: { stage_id?: number; subject_ids?: number[] }
  }) {
    return client.post('update_user', param)
  },
  info(param: { user_ids: number[] } | { user_no_list: string[] }) {
    return client.post<PageResult<CustomerInfo>>('info', param)
  },
  markNceeVintage(param: { tag_ncee_vintage: number; user_id: number; [property: string]: any }) {
    return client.post('mark_ncee_vintage', param)
  },
  /** 获取用户学习记录 */
  learnRecord(param: {
    limit?: number
    page?: number
    subject_id?: number
    unlimited?: boolean
    user_id?: number
    [property: string]: any
  }) {
    return client.get('learn_record', param)
  },
  /** 获取用户课程商品信息 */
  courseGoods(param: { subject_id?: number; user_id?: number; [property: string]: any }) {
    return client.get('course_goods', param)
  }
}

import { PageParam } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import { PrepareCourseware } from '@/model/PrepareCourseware'
import { PageResult } from '@/components/CardList'

const client = new RequestClient('content/admin/v1/prepare/courseware')

export default {
  /** 创建备课 */
  create(param: PrepareCourseware) {
    return client.post('create', param)
  },
  /** 更新备课 */
  update(param: PrepareCourseware) {
    return client.post('update', param)
  },
  /** 删除备课 */
  delete(param: { ids: number[] }) {
    return client.post('delete', param)
  },
  /** 移动备课课件 */
  move(param: { ids: number[]; node_id: number }) {
    return client.post('move', param)
  },
  /** 获取备课课件列表 */
  list(
    param: {
      /**
       * id查询
       */
      courseware_id?: number
      end_time?: number
      grade_id?: number
      /**
       * 节点查询，会将该节点下的子节点的课件全部查出
       */
      node_id?: number
      score_id?: number
      /**
       * 创建时间 范围
       */
      start_time?: number
      title_kw?: string
    } & PageParam
  ) {
    return client.get<PageResult<PrepareCourseware>>('list', param)
  },
  /** 获取备课课件信息 */
  info(param: { id: number }) {
    return client.get<PrepareCourseware>('info', param)
  },
  /** 获取备课课件修改记录 */
  record(param: { id?: number } & PageParam) {
    return client.get<PageResult<any>>('record', param)
  },
  /** 获取备课课件修改记录信息 */
  recordInfo(param: { id: number }) {
    return client.get<any>('record/info', param)
  },
  /** 分享课件 */
  shareUpdate(param: {
    /**
     * 分享哪些课件，课件id列表
     */
    courseware_ids: number[]
    share_list: {
      recv_id?: number
      share_type?: number
    }[]
  }) {
    return client.post('share/update', param)
  },
  /** 分享课件 */
  shareAdd(param: {
    courseware_id: number
    share_list: {
      recv_id?: number
      share_type?: number
    }[]
  }) {
    return client.post('share/add', param)
  },

  /** 取消课件分享 */
  shareUnshare(param: { id: number }) {
    return client.get<any>('share/unshare', param)
  },
  /** 分享给我的课件 */
  shareMyList(
    param: {
      stage_id?: number
      subject_id?: number
      end_time?: number
      /**
       * 分享人
       */
      share_by?: number
      /**
       * 分享时间
       */
      start_time?: number
      /**
       * 课件标题关键词
       */
      title_kw?: string
    } & PageParam
  ) {
    return client.get<PageResult<any>>('share/my_list', param)
  },
  /** 获取分享给我的课件信息 */
  shareMyInfo(
    param: {
      end_time?: number
      limit?: number
      page?: number
      /**
       * 分享人
       */
      share_by?: number
      /**
       * 分享时间
       */
      start_time?: number
      /**
       * 课件标题关键词
       */
      title_kw?: string
    } & PageParam
  ) {
    return client.get<PageResult<any>>('share/my_info', param)
  },
  /** 获取备课课件分享记录 */
  shareList(param: { id: number } & PageParam) {
    return client.get<PageResult<any>>('share/list', param)
  },
  /** 导出课件 */
  export(param: { id: number; paper_type: number }) {
    return client.post<{ file_url: string }>('export', param)
  },
  questionExport(param: { id: number; show_fields?: string[] }) {
    return client.post('question/export', param)
  }
}

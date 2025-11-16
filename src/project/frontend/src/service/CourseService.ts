import { PageParam, PageResult } from '@/model/dto/Page'
import RequestClient from './request/RequestClient'
import Course, { CatalogInfo, UpdateParams } from '@/model/Course'

const client = new RequestClient('admin/v1/course')

export default {
  /** 获取课程列表 */
  list(param: Record<string, any>) {
    return client.get<PageResult<Course>>('list', param)
  },
  /** 更新课程 */
  update(param: Partial<UpdateParams>) {
    return client.post('update', param)
  },
  /** 更新课程状态 */
  updateStatus(param: { id: number; status: number }) {
    return client.post('update_status', param)
  },
  /** 新建课程 */
  create(param: UpdateParams) {
    return client.post('create', param)
  },
  /** 课程详情 */
  info(param: { id: number }) {
    return client.get<Course>('info', param)
  },
  /** 课程章节信息 */
  catalogInfo(param: { course_id: number }) {
    return client.get<CatalogInfo>('catalog/info', param)
  },
  /** 添加课程目录章节 */
  catalogAdd(param: { course_id: number; name: string; level?: number; parent_id?: number }) {
    return client.post('catalog/add', param)
  },
  /** 更新课程目录章节 */
  catalogUpdate(param: { id: number; name: string }) {
    return client.post('catalog/update', param)
  },
  catalogLessonFree(param: {
    id: number
    /**-1：收费 1：免费试听 */
    is_free_trial: number
  }) {
    return client.post('catalog/lesson_free', param)
  },
  /** 删除课程目录章节 */
  catalogDelete(param: { id: number }) {
    return client.post('catalog/delete', param)
  },
  /** 课程下添加课时 */
  catalogAddLesson(param: { catalog_id: number; course_id: number; lesson_ids: number[] }) {
    return client.post('catalog/add_lesson', param)
  },
  /** 课程下删除课时 */
  catalogRemoveLesson(param: { ids: number[] }) {
    return client.post('catalog/remove_lesson', param)
  },
  /** 课程下更新课时排序 */
  catalogUpdateSort(param: { id: number; sort: number; parent_id: number; lessons: { id: number; sort: number }[] }[]) {
    return client.post('catalog/update_sort', param)
  },
  /** 课程章节更新章节课时信息 */
  catalogUpdateLesson(param: { id: number; listed_at: number }) {
    return client.post('catalog/update_lesson', param)
  },
  /** 课程学习概况 */
  learnDataProfile(param: { course_id: number }) {
    return client.get<{
      /**
       * 总收藏人数
       */
      total_collect: number
      /**
       * 总播放次数
       */
      total_play: number
      /**
       * 总人数
       */
      total_user: number
    }>('learn_data/profile', param)
  },
  /** 用户学习情况 */
  learnDataUserProfile(param: {
    course_id?: number
    limit?: number
    mobile?: string
    nick_name_kw?: string
    page?: number
  }) {
    return client.get('learn_data/user_profile', param)
  },
  /** 用户学习详情 */
  learnDataLessonUserDetail(param: { course_id: number; user_id: number }) {
    return client.get<{
      user_id?: number
      list: {
        data_list?: {
          id?: number
          /**
           * 学习时长
           */
          learn_duration?: number
          name?: string
          /**
           * 学习进度
           */
          progress?: number
          /**
           * 课时总时长
           */
          total_duration?: number
          /**
           * 学习次数
           */
          total_play?: number
        }[]
        id?: number
        name?: string
      }[]
    }>('learn_data/lesson/user_detail', param)
  },
  /** 课程下课时的问答（互动）详情 */
  answerDataLessonQuesProfile(param: { course_id: number; lesson_id: number }) {
    return client.get<
      {
        type: number
        /**
         * 自定义问题内容
         */
        content_json?: string
        list: {
          /**
           * 选项名
           */
          option_name?: string
          /**
           * 选项选择次数
           */
          total_choice?: number
          /**
           * 选项选择人数
           */
          total_user?: number
        }[]
        [property: string]: any
      }[]
    >('answer_data/lesson/ques_profile', param)
  },
  /** 课程下课时的用户问答记录列表 */
  answerDataLessonUserDetail(
    param: {
      /**
       * 问题选项name
       */
      answer?: string
      course_id?: number
      end_time?: number
      /**
       * 0 默认值，没选  1：回答了  2：回答了
       */
      is_answered?: number
      lesson_id?: number
      mobile?: string
      nick_name_kw?: string
      /**
       * 视频互动问题id， 非试题id
       */
      ques_id?: number
      start_time?: number
    } & PageParam
  ) {
    return client.get<
      PageResult<{
        /**
         * 回答时间
         */
        answer_time?: number
        /**
         * 选择的那个选项
         */
        choice?: string
        /**
         * true  回答了
         */
        is_answered?: boolean
        mobile?: string
        nick_name?: string
        user_id?: number
      }>
    >('answer_data/lesson/user_detail', param)
  },
  /** 用户回答情况 */
  answerDataLessonProfile(param: { course_id?: number; lesson_id?: number }) {
    return client.get('answer_data/lesson/profile', param)
  },
  /** 课程下课时的反馈记录列表 */
  feedbackLessonList(
    param: {
      course_id?: number
      end_time?: number
      lesson_id?: number
      mobile?: string
      nick_name_kw?: string
      /**
       * 1 懂了  2 没懂
       */
      result_type?: number
      start_time?: number
    } & PageParam
  ) {
    return client.get<
      PageResult<{
        /**
         * 没懂时的内容
         */
        content: string
        /**
         * 反馈时间
         */
        feedback_time?: number
        /**
         * 没懂时的图片
         */
        file_urls?: string[]
        mobile?: string
        nick_name?: string
        /**
         * 1 懂了  2 没懂
         */
        result_type?: number
        user_id?: number
      }>
    >('feedback/lesson/list', param)
  },
  /** 用户反馈情况 */
  feedbackLessonProfile(param: { course_id?: number; lesson_id?: number }) {
    return client.get('feedback/lesson/profile', param)
  },
  /** 用户反馈情况 */
  feedbackProfile(param: { course_id?: number }) {
    return client.get('feedback/profile', param)
  }
}

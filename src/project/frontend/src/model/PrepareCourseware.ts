import { CoursewarePageType, CoursewareTemplateCode } from '@/utils/constants/Prepare'
import Question from './Question'

export interface PrepareCourseware {
  /**
   * 课件内容对象，前端定义维护，后端原封不动结构化返回，万能对象
   */
  content?: PrepareCoursewareContent
  /**
   * 简介
   */
  desc?: string
  grade_id?: number
  /**
   * 目录节点id
   */
  node_id: number
  /**
   * 备课ID
   */
  prepare_id: number
  score_ids?: number[]
  /**
   * 标题
   */
  title: string
  /**
   * 模版code，前端定义维护
   */
  tmpl_code?: CoursewareTemplateCode

  create_at?: number
  create_by?: number
  create_name?: string
  grade_name?: string
  id?: number
  node_full_name?: string
  node_name?: string
  score_names?: string[]
  stage_id?: number
  stage_name?: string
  subject_id?: number
  subject_name?: string
  update_at?: number
  update_by?: number
  update_name?: string
  courseware_id?: number
}

export interface CoursewarePage {
  page_type: CoursewarePageType
  value?: string
  background_type?: number
  list?: any[]
  ques_list?: Question[]
  [property: string]: any
}

export interface PrepareCoursewareContent {
  pages: CoursewarePage[]
  [property: string]: any
}

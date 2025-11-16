export default interface Course {
  cover_key?: string
  cover_url?: string
  create_at?: number
  create_by?: number
  create_name?: string
  detail?: string
  enable_notify?: null
  id?: number
  intro?: string
  keywords?: Keyword[]
  lessons_count?: number
  name?: string
  stage_id?: number
  status?: number
  subject_id?: number
  total_duration?: number
  update_at?: number
  update_by?: number
  update_name?: string
  use_grades?: UseGrade[]
  [property: string]: any
}

export interface CatalogInfo {
  catalogs: Catalog[]
  total_duration: number
  total_lesson: number
  lesson_count: number
  [property: string]: any
}

export interface Catalog {
  course_id?: number
  id?: number
  lessons?: Lesson[]
  name?: string
  sort?: number
  total_duration?: number
  total_lesson?: number
  children?: Catalog[]
  [property: string]: any
}

export interface Lesson {
  cover_url?: string
  detail?: string
  duration?: number
  id?: number
  intro?: string
  keywords?: string[]
  lesson_id?: number
  name?: string
  stage_id?: number
  subject_id?: number
  type?: number
  video_url?: string
  [property: string]: any
}

export interface Keyword {
  id?: number
  name?: string
  [property: string]: any
}

export interface UseGrade {
  id?: number
  name?: string
  [property: string]: any
}

export interface UpdateParams {
  cover_key: string
  detail: string
  enable_notify?: boolean
  id?: number
  intro: string
  keywords: string[]
  name: string
  stage_id: number
  status: number
  subject_id: number
  use_grades: number[]
  [property: string]: any
}

export interface LearnDataUserDetail {
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
}

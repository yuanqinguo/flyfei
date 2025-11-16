import { ContentType } from './ContentType'

export interface KnowledgeCatalog {
  create_at?: number
  create_by?: number
  desc?: string
  full_name?: string
  id: number
  level: number
  name: string
  parent_id?: number
  sort: number
  stage_id?: number
  subject_id?: number
  update_at?: number
  update_by?: number
  [property: string]: any
}

export interface KnowledgeContent {
  analysis?: string
  audit_status?: number
  concept?: string
  create_at?: number
  create_by?: number
  create_name?: string
  grade_id?: number
  id?: number
  mind_map_img_id?: number
  mind_map_url?: string
  node_id?: number
  public_at?: number
  ques_ids?: number[]
  score_ids?: number[]
  stage_id?: number
  status?: number
  subject_id?: number
  title?: string
  type_id?: number
  type_info?: ContentType
  update_at?: number
  update_by?: number
  update_name?: string
  video_lesson_id?: number
  video_url?: string
  node_name?: string
  [property: string]: any
}

export interface KnowledgeContentAuditRequest {
  audit_contents: AuditContent[]
  audit_snap: AuditSnap
  content_id: number
  file_key: string[]
  remark: string
  [property: string]: any
}

export interface AuditContent {
  content: string
  id: string
  type: string
  [property: string]: any
}

export interface AuditSnap {
  analysis: string
  audit_name: string
  audit_status: number
  concept: string
  create_at: number
  create_by: number
  create_name: string
  grade_id: number
  id: number
  mind_map_img_id: number
  mind_map_url: string
  node_id: number
  public_at: number
  ques_ids: number[]
  score_id: number
  stage_id: number
  status: number
  subject_id: number
  title: string
  type_id: number
  update_at: number
  update_by: number
  update_name: string
  video_lesson_id: number
  video_url: string
  [property: string]: any
}

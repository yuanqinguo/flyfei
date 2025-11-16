export interface ImageBank {
  create_at?: number
  create_by?: number
  create_name?: string
  update_at?: number
  update_by?: number
  update_name?: string
  desc?: string
  id?: number
  keywords?: KeyWord[]
  name?: string
  stage_id?: number
  status?: number
  subject_id?: number
  file_list?: {
    file_key: string
    origin_name: string
  }[]
  category_full_path?: ImageBankCategory[]

  [property: string]: any
}

export interface KeyWord {
  id?: number
  name?: string
  [property: string]: any
}

export interface ImageBankCategory {
  create_at?: number
  create_by?: number
  desc?: string
  id?: number
  level?: number
  name?: string
  only_type?: number
  parent_id?: number
  stage_id?: number
  subject_id?: number
  update_at?: number
  update_by?: number
  [property: string]: any
}

export interface ImageAudit {
  id: number
  image_id: number
  new_file_name: string
  new_file_key: string
  new_file_url: string
  old_file_name: string
  old_file_key: string
  old_file_url: string
  category: string
  audit_status: number
  audit_at: string
  audit_by: number
  audit_content: string
  create_at: string
  create_by: number
}

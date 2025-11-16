import { FieldType } from '@/utils/constants/KnowledgeContent'

export interface ContentType {
  create_at?: number
  create_by?: number
  create_name?: string
  desc?: string
  fields?: ContentTypeField[]
  id?: number
  name?: string
  sort?: number
  status?: number
  type?: number
  update_at?: number
  update_by?: number
  update_name?: string
  [property: string]: any
}

export interface ContentTypeField {
  field_key: string
  field_title?: string
  field_type?: FieldType
  multi_choice?: boolean
  require?: boolean
  [property: string]: any
}

export interface ContentTypeUpdateParams {
  id: number
  name: string
  status: number
  fields: ContentTypeField[]
}

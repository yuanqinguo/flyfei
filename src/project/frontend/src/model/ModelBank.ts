export interface ModelBank {
  chapters?: number[]
  content?: string
  create_at?: number
  create_by?: number
  create_name?: string
  desc?: string
  id?: number
  key_words?: KeyWord[]
  knowledges?: KeyWord[]
  stage_id?: number
  status?: number
  subject_id?: number
  update_at?: number
  update_by?: number
  update_name?: string
  [property: string]: any
}

export interface KeyWord {
  id?: number
  name?: string
  [property: string]: any
}

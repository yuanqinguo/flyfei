export interface VideoBank {
  create_at?: number
  create_by?: number
  create_name?: string
  desc?: string
  id?: number
  key_words?: KeyWord[]
  name?: string
  stage_id?: number
  status?: number
  subject_id?: number
  update_at?: number
  update_by?: number
  update_name?: string
  video_key?: string
  video_url?: string
  [property: string]: any
}

export interface KeyWord {
  id?: number
  name?: string
  [property: string]: any
}

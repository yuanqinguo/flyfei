export interface QuestionCategory {
  id: number
  desc?: string
  level?: number
  name?: string
  parent_id?: number
  sort?: number
  stage_id?: number
  subject_id?: number
  [property: string]: any
}

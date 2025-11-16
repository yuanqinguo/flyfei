export default interface QuestionTypes {
  id: number
  name?: string
  status?: number
  audio_require?: number
  basic_ques_types: number[]
  is_group?: number
  stage_id?: number
  subject_id?: number
  sort: number
  [property: string]: any
}

export interface SubQuesTypes {
  id: number
  name?: string
  ques_type_id?: number
  sort: number
  status?: number
  [property: string]: any
}

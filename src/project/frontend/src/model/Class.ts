export interface ClassItem {
  associate_teachers: AssociateTeacher[]
  create_at: number
  create_name: string
  grade_id: number
  id: number
  main_teachers: MainTeacher[]
  name: string
  ncee_vintage: number
  stage_id: number
  subject_id: number
  update_at: number
  update_name: string
  [property: string]: any
}

export interface AssociateTeacher {
  id?: number
  name?: string
  [property: string]: any
}

export interface MainTeacher {
  id?: number
  name?: string
  [property: string]: any
}

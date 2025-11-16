export interface Prepare {
  create_at?: number
  create_by?: number
  create_name?: string
  desc?: string
  id?: number
  name?: string
  stage_id?: number
  subject_id?: number
  update_at?: number
  update_by?: number
  update_name?: string
}

export interface PrepareCatalog {
  id?: number
  name?: string
  stage_id?: number
  subject_id?: number
  update_at?: number
  update_by?: number
  update_name?: string
}

export interface PrepareCatalog {
  node_list: PrepareCatalogNode[]
  prepare: Prepare
  [property: string]: any
}

export interface PrepareCatalogNode {
  full_name?: string
  id: number
  level?: number
  name?: string
  parent_id?: number
  sort?: number
  [property: string]: any
}

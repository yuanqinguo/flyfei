import Question from './Question'

export interface Paper {
  audit_at?: number
  audit_by?: number
  audit_status?: number
  create_at?: number
  create_by?: number
  create_name?: string
  group_ques?: GroupQue[]
  name?: string
  paper_id?: number
  paper_type?: number
  stage_id?: number
  subject_id?: number
  tmpl_selected?: number[]
  tmpl_type?: number
  update_at?: number
  update_by?: number
  update_name?: string
  vintage?: number
  [property: string]: any
}

export default Paper

export interface GroupQue {
  id?: string
  name?: string
  ques_list?: QuesList[]
  [property: string]: any
}

export interface QuesList {
  add_at?: number
  add_by?: number
  create_name?: string
  ques_id?: number
  ques_type?: number
  score?: number
  sort?: number
  update_at?: number
  update_by?: number
  update_name?: string
  ques_info?: Question
  sub_score?: { id: number; score: number }[]
  optional?: number
  [property: string]: any
}

export interface PaperAuditContent {
  content: string
  id: string
  type: string
  [property: string]: any
}

export interface PaperAudit {
  audit_at?: number
  audit_by?: number
  audit_contents: PaperAuditContent[]
  /**
   * 审核人名字
   */
  audit_name?: string
  /**
   * 审批时的试卷快照，与试卷详情结构返回一致
   */
  audit_snap?: { [key: string]: any }
  /**
   * 试卷id
   */
  paper_id?: number
  [property: string]: any
}

export interface PaperAnalysis {
  ques_difficulty_stats: QuesDifficultyStat[]
  ques_knowledge_stats: QuesKnowledgeStat[]
  ques_type_stats: QuesTypeStat[]
  [property: string]: any
}

export interface QuesDifficultyStat {
  count?: number
  difficulty?: number
  score?: number
  [property: string]: any
}

export interface QuesKnowledgeStat {
  knowledge_details: string
  knowledge_id: number
  knowledge_name: string
  ques_num: string
  [property: string]: any
}

export interface QuesTypeStat {
  count?: number
  ques_type?: number
  score?: number
  [property: string]: any
}

export interface PaperExtend {
  file_type?: string
  file_url?: string
  id?: number
  name?: string
  origin_url?: string
  package_id?: number
  subject_id?: number
  update_at?: number
  [property: string]: any
}

export interface ExtendPackagePapers {
  papers: PaperExtend[]
  subject_id?: number
  [property: string]: any
}

export interface PaperExtendPackage {
  grade_id?: number
  grade_name?: string
  id?: number
  name?: string
  origin_type?: number
  province_id?: number
  [property: string]: any
}

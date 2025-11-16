import Stage from '@/model/Stage'
import Subject from '@/model/Subject'

export const BASE_DATA_UPDATE = 'BASE_DATA_UPDATE'

export interface BaseDataUpdateAction {
  type: string
  payload: Partial<BaseDataState>
}

export interface BaseDataState {
  /** 学科列表 */
  subjectList: Subject[]
  /** 学段列表 */
  stageList: Stage[]
}

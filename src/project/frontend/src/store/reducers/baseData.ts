import { BASE_DATA_UPDATE, BaseDataUpdateAction, BaseDataState } from '@/store/types'

const defaultState: BaseDataState = {
  stageList: [],
  subjectList: []
}

export const baseDataReducer = (state: BaseDataState = defaultState, action: BaseDataUpdateAction) => {
  if (action.type === BASE_DATA_UPDATE) {
    return { ...state, ...action.payload }
  }
  return state
}

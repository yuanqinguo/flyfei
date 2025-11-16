import {
  SESSION_INIT,
  SessionState,
  SYSTEM_INIT,
  SystemState,
  BASE_DATA_UPDATE,
  BaseDataState,
  CUSTOM_LATEX_UPDATE,
  CustomLatexState
} from '@/store/types'

export const systemInit = (systemState: Partial<SystemState>) => ({ type: SYSTEM_INIT, payload: systemState })
export const sessionInit = (sessionState: Partial<SessionState>) => ({ type: SESSION_INIT, payload: sessionState })
export const baseDataUpdate = (baseDataState: Partial<BaseDataState>) => ({
  type: BASE_DATA_UPDATE,
  payload: baseDataState
})
export const customLatexUpdate = (customLatexState: Partial<CustomLatexState>) => ({
  type: CUSTOM_LATEX_UPDATE,
  payload: customLatexState
})

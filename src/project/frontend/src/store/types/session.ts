export const SESSION_INIT = 'SESSION_INIT'

export interface SessionInitAction {
  type: string
  payload: Partial<SessionState>
}

export interface SessionState {
  isInit: boolean
  loginToken?: string
  initPromise?: Promise<void> | null
}

import { SessionState, SessionInitAction, SESSION_INIT } from '@/store/types'

const TOKEN_KEY = 'accesstoken'

const tokenStorage = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

const tokenGet = () => {
  const token = localStorage.getItem(TOKEN_KEY) || ''
  return token
}

const initSessionState = {
  isInit: false,
  loginToken: tokenGet()
}

export const sessionReducer = (state: SessionState = initSessionState, action: SessionInitAction) => {
  if (action.type === SESSION_INIT) {
    if (action.payload.loginToken !== undefined) {
      tokenStorage(action.payload.loginToken)
    }
    return { ...state, ...action.payload }
  }
  return state
}

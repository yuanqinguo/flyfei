import { SYSTEM_INIT, SystemInitAction, SystemState } from '@/store/types'

const initSystemState: SystemState = {
  userInfo: {},
  userPermission: [],
  allMenu: []
}

export const systemReducer = (state: SystemState = initSystemState, action: SystemInitAction) => {
  if (action.type === SYSTEM_INIT) {
    return { ...state, ...action.payload }
  }
  return state
}

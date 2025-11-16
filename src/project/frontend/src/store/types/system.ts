import User from '@/model/User'
import Perm from '@/model/Perm'

export const SYSTEM_INIT = 'SYSTEM_INIT'

export interface SystemInitAction {
  type: string
  payload: Partial<SystemState>
}
export interface SystemState {
  userInfo: Partial<User>
  userPermission: Perm[]
  allMenu: Perm[]
}

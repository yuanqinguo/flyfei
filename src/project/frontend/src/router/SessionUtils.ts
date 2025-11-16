import PermService from '@/service/PermService'
import UserService from '@/service/UserService'
import store from '@/store'
import { sessionInit, systemInit, } from '@/store/actions'

export default {
  getToken() {
    return store.getState().session.loginToken
  },
  tokenExpired() {
    this.logout()
  },
  logout() {
    store.dispatch(sessionInit({ loginToken: '', isInit: false, initPromise: null }))
    localStorage.clear()
  },
  loginSuccess(token: string) {
    store.dispatch(
      sessionInit({
        loginToken: token
      })
    )
  },
  async loginSystemInit() {
    const [userInfo, userPermission, { list: allMenu }] = await Promise.all([
      UserService.info(),
      PermService.myPerms(),
      PermService.list({ limit: 999 })
    ])
    store.dispatch(
      systemInit({
        userInfo,
        userPermission,
        allMenu
      })
    )
    store.dispatch(
      sessionInit({
        isInit: true
      }))
  },
  
}

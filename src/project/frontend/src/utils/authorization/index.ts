import store from '@/store'

export { default as Authorization } from './Authorization'

function getUserPermission() {
  return store.getState().system.userPermission.map(item => item.code)
}

function permissionMatch(needPermission: string, permission: string[]) {
  return permission.includes(needPermission)
}

/**
 * 只要有其中一个权限，返回 true， 否则返回 false
 * @param permissions 权限集合
 */
export function hasPermission(...permissions: string[]) {
  return getUserPermission().some(item => {
    if (item) {
      return permissionMatch(item, permissions)
    }
    return false
  })
}

/**
 * 需要有全部传入的权限返回 true， 否则返回 false
 * @param permissions
 */
export function hasAllPermission(...permissions: string[]) {
  return getUserPermission().every(item => {
    if (item) {
      return permissionMatch(item, permissions)
    }
    return true
  })
}

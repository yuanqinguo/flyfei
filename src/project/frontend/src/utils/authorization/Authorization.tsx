import React, { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import { hasAllPermission, hasPermission } from '.'

interface AuthorizationProps {
  /**
   * 是否有此权限
   */
  permission?: string[] | string
  /**
   * 权限判断是用 or 还是 and
   * @default false (使用or)
   */
  hasAll?: boolean
  /**
   * 约束条件，首先判断
   */
  condition?: boolean | (() => boolean)
  children: any
}

function check({ permission, hasAll, condition }: AuthorizationProps): boolean {
  let isAuthorization = true
  if (condition !== undefined) {
    if (typeof condition === 'function') {
      isAuthorization = condition()
    } else {
      isAuthorization = condition
    }
    if (!isAuthorization) {
      return !!condition
    }
  }
  if (permission) {
    const sign = Array.isArray(permission) ? permission : [permission]
    isAuthorization = hasAll ? hasAllPermission(...sign) : hasPermission(...sign)
  }
  return isAuthorization
}

/**
 * 权限组件
 */
const Authorization: React.FC<AuthorizationProps> = props => {
  const system = useAppSelector(state => state.system)
  const [isAuthorization, setAuthorization] = useState(false)
  useEffect(() => {
    props && setAuthorization(check(props))
  }, [system.userPermission, props])
  return <>{isAuthorization ? props.children : null}</>
}

export default Authorization

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { wildcardMatchString } from '@/utils'

export { useRouter } from './useRouter'
export { useModalForm } from './useModalForm'
/**
 * 该hook会返回一个数组 [loading, fn]
 * 调用 fn 时，会自动维护 loading 的状态
 * @param fn 需要封装loading的方法
 * @param defaultLoading loading的默认状态
 */
export function useLoading<T extends (...args: any[]) => any>(fn: T, defaultLoading = false): [boolean, T] {
  const [loading, setLoading] = useState(defaultLoading)
  const loadingFunction = async (...args: any) => {
    try {
      setLoading(true)
      const res = await fn(...args)
      setLoading(false)
      return res
    } finally {
      setLoading(false)
    }
  }
  return [loading, loadingFunction as T]
}

/**
 * 返回一个对象，对象的 current 属性标识当前组件是否 mounted 状态
 */
export function useMountedRef() {
  const isMountedRef = useRef(true)
  useEffect(
    () => () => {
      isMountedRef.current = false
    },
    []
  )
  return isMountedRef
}

/**
 * 过滤数组
 * @param array 数组
 * @param getValue 需要匹配过滤的值
 * @return [过滤后的数组, 设置关键词方法]
 */
export function useFilter<T>(array: T[], getValue: (data: T) => any | any[]): [T[], (searchKey?: string) => void] {
  const [searchKey, setSearchKey] = useState<string>()

  const filterList: T[] = useMemo(() => {
    return array.filter(data => {
      const needFilterValues = getValue(data)
      const filterValues = Array.isArray(needFilterValues) ? needFilterValues : [needFilterValues]
      return wildcardMatchString(searchKey, ...filterValues)
    })
  }, [searchKey, array])
  return [filterList, setSearchKey]
}

/**
 * 该hook用于直接加载异步数据并且维护到state
 * @param promiseFunction 异步加载数据的方法
 * @param deps 参数，需要监听的参数
 * @return [值（可能为undefined), loading状态, 包装后的方法]
 */
export function useFetch<T>(
  promiseFunction: (...args: any[]) => Promise<T> | T,
  deps: any[],
  defaultValue: T
): [T, boolean, typeof promiseFunction, (t: T) => void]
export function useFetch<T>(
  promiseFunction: (...args: any[]) => Promise<T> | T,
  deps?: any[]
): [T | undefined, boolean, typeof promiseFunction, (t: T) => void]
export function useFetch<T>(promiseFunction: (...args: any[]) => Promise<T> | T, deps: any[] = [], defaultValue?: T) {
  const [value, setValue] = useState<T | undefined>(defaultValue)
  const [loading, fetchFunction] = useLoading((...args: any[]) => {
    const result = promiseFunction(...args) as any
    if (result?.then) {
      return result.then((data: T) => {
        setValue(data)
        return data
      })
    }
    return result
  })
  useEffect(() => {
    fetchFunction()
  }, deps)
  return [value, loading, fetchFunction, setValue]
}

export function usePromiseData<T>(...value: (Promise<T> | T)[]) {
  const mountRef = useMountedRef()
  const [data, setData] = useState<T[]>([])
  const initData = useCallback(async () => {
    const data = value ? await Promise.all(value) : []
    if (mountRef.current) {
      setData(data)
    }
  }, [])
  useEffect(() => {
    initData()
  }, [])
  return data
}

/**
 *
 * @param fn 需要循环的方法
 * @param interval 频率
 * @param onError 异常处理，当返回false，终止定时任务
 */
export function useLoop(fn: () => void, interval?: number, onError?: (e: any) => boolean) {
  const loopRef = useRef(false)
  const fnRef = useRef(fn)

  useEffect(() => {
    fnRef.current = fn
  }, [fn])

  const stop = () => {
    loopRef.current = false
  }

  const doLoop = async () => {
    if (loopRef.current && interval) {
      try {
        await fnRef.current?.()
      } catch (error) {
        if (onError?.(error) === false) {
          return
        }
      }
      setTimeout(() => {
        doLoop()
      }, interval)
    }
  }

  const begin = () => {
    loopRef.current = true
    doLoop()
  }

  useEffect(() => {
    begin()
    return stop
  }, [interval])

  return { begin, stop, loopRef }
}

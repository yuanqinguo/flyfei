type Executor = () => Promise<any>

function validateCore(core: number) {
  if (core < 1) {
    throw new Error('parameter `core` must great than 0')
  }
}

export default class PromisePool {
  /**
   * 同时存在的promise数量
   */
  core: number

  /**
   * 当前的执行池
   */
  private executors: Executor[] = []

  /**
   * 是否正在执行
   */
  private isExecuting = false

  /**
   * 当前任务的Promise状态
   */
  private statusPromise: Promise<any> = Promise.resolve()

  /**
   * 是否暂停
   */
  private isPause = false

  constructor(core: number) {
    validateCore(core)
    this.core = core
  }

  /**
   * 获取当前执行状态Promise
   */
  public getStatusPromise() {
    return this.statusPromise
  }

  execute(feature: Executor | any) {
    this.executors.push(feature)
    return this.resume()
  }

  /**
   *  清空未开始的任务执行，已开始执行的任务无法清空领
   * @return 返回当前任务状态的 Promise对象，如果该对象状态为resolve，则清空完成
   */
  async clear() {
    await this.pause()
    this.executors.splice(0, this.executors.length)
    return this.statusPromise
  }

  /**
   * 暂停未开始的任务执行，已开始执行的任务无法暂停
   * @return 返回当前任务状态的 Promise对象，如果该对象状态为resolve，则暂停完成
   */
  pause() {
    this.isPause = true
    return this.statusPromise
  }

  /**
   * 开始, 恢复暂停任务执行
   * @return 返回任务执行状态的Promise
   */
  resume() {
    this.isPause = false
    return this.beginExecute()
  }

  /**
   * 设置并发数，此操作会暂停当前任务，并且在暂停完成后
   * 修改并发数，然后会开启当前任务
   * @param core 并发数量
   * @return 任务执行状态的Promise
   */
  async setCore(core: number) {
    validateCore(core)

    if (this.isExecuting) {
      await this.pause()
      this.core = core
      return this.resume()
    } else {
      this.core = core
    }
  }

  getIsExecuting() {
    return this.isExecuting
  }

  private beginExecute() {
    if (this.isExecuting) {
      return
    }
    this.isExecuting = true
    const promiseArray = []
    for (let i = 0; i < this.core; i++) {
      promiseArray.push(this.doExecute())
    }
    this.statusPromise = Promise.all(promiseArray).finally(() => {
      this.isExecuting = false
    })
    return this.statusPromise
  }

  private doExecute(): Promise<any> {
    return new Promise(resolve => {
      const executor = this.executors.shift()
      if (executor) {
        let executorPromise
        if (typeof executor === 'function') {
          executorPromise = Promise.resolve(executor())
        } else {
          executorPromise = Promise.resolve(executor)
        }
        executorPromise.finally(() => {
          // @ts-ignore
          resolve()
        })
      } else {
        // @ts-ignore
        resolve()
      }
    }).then(() => {
      if (this.isPause) {
        return
      }
      if (this.executors.length > 0) {
        return this.doExecute()
      }
    })
  }
}

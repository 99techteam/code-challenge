export type Fn<T = void> = () => T

export const sleep = (ms: number, callback?: Fn<any>) =>
  new Promise<void>(resolve =>
    setTimeout(async () => {
      await callback?.()
      resolve()
    }, ms)
  )

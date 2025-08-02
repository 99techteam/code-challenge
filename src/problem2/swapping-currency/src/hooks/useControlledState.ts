import { useCallback, useEffect, useMemo, useState } from 'react'

export interface UseControlledStateProps<T = unknown> {
  defaultValue?: T
  value?: T
  onChange?: (value: T) => void
  undefinedSync?: boolean
}

export type UseControlledStateReturn<T = unknown> = [T, (value: T) => void]

export function useControlledState<T = unknown>(props: UseControlledStateProps<T>): UseControlledStateReturn<T> {
  const { undefinedSync = true } = props
  const [value, setValue] = useState<T | undefined>(props?.defaultValue)

  const handleChangeProps = props?.onChange;

  // Effect to synchronize controlled value with internal state
  useEffect(() => {
    if (typeof props?.value !== 'undefined' || undefinedSync) {
      setValue(props?.value)
    }
  }, [props?.value, undefinedSync])

  const onChange = useCallback(
    (newValue: T) => {
      if (typeof handleChangeProps === 'function') {
        handleChangeProps?.(newValue)
      } else {
        setValue(newValue)
      }
    },
    [handleChangeProps],
  )

  const valueToUse = props?.value !== undefined ? props?.value : value

  return useMemo(() => {
    return [valueToUse, onChange]
  }, [valueToUse, onChange])
}

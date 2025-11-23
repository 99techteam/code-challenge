import React, { useEffect, useRef, useState } from 'react'

/**
 * useSyncState works like useState, but syncs to the latest initialValue if it changes.
 * Optionally accepts a custom equality function.
 *
 * Note: If you provide a custom isEqual function, memoize it with useCallback for best performance.
 */
export const useSyncState = <T>(
  initialValue: T,
  isEqual: (a: T, b: T) => boolean = (a, b) => a === b
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState(initialValue)
  const prevInitialRef = useRef(initialValue)

  useEffect(() => {
    if (!isEqual(prevInitialRef.current, initialValue)) {
      prevInitialRef.current = initialValue
      setState(initialValue)
    }
  }, [initialValue, isEqual])

  return [state, setState]
}

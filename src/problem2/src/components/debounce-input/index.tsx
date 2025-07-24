import { useEffect, useMemo, useState } from 'react'
import Input, { type Props as InputProps } from '../input'
import { isNil, debounce } from 'lodash-es'

const DEBOUNCE_TIME = 200

const DebounceInput = ({ defaultValue, value, onChange, ...props }: InputProps) => {
  const [displayValue, setDisplayValue] = useState(defaultValue ?? value ?? '')
  const debounceChange = useMemo(
    () => debounce((event) => onChange?.(event), DEBOUNCE_TIME),
    [onChange],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(event.target.value)
    debounceChange(event)
  }

  useEffect(() => {
    if (isNil(value)) {
      setDisplayValue('')
    } else {
      setDisplayValue(value)
    }
  }, [value])

  return <Input value={displayValue} onChange={handleChange} {...props} />
}

export default DebounceInput

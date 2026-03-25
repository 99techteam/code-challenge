import { useEffect, useState } from "react"

import { Input } from "@/components/ui/input"

type Props = {
  value: number
  onChange: (value: number) => void
}

export function NumberInput({ value, onChange }: Props) {
  const [input, setInput] = useState(value.toString())

  useEffect(() => {
    setInput(value.toString())
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    
    // Only allow numbers and decimal points
    if (!/^\d*\.?\d*$/.test(val)) return

    setInput(val)

    onChange(Number(val))
  }

  return (
    <Input
      type='number'
      inputMode='decimal'
      value={input}
      onChange={handleChange}
    />
  )
}

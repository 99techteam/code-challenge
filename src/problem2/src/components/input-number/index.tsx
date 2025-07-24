import { NumericFormat, type NumericFormatProps } from 'react-number-format'
import Input, { type Props as InputProps } from '../input'

type Props = NumericFormatProps & InputProps

const InputNumber = (props: Props) => {
  return (
    <NumericFormat allowLeadingZeros={false} allowNegative={false} customInput={Input} {...props} />
  )
}

export default InputNumber

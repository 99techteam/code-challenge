import { Input } from "@mui/material";
import { type FC } from "react";

interface TokenContainerProps {
  disable?: boolean;
  value?: string;
  onChangeValue?: (value: string) => void;
}

const TokenContainer: FC<TokenContainerProps> = (props) => {
  return (

    <Input
      disabled={props.disable}
      type="number"
      placeholder="0.00"
      value={props.value || ''}
      onChange={(e) => props.onChangeValue?.(e.target.value)}
      className="text-2xl mr-2 font-bold w-full outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />

  )
}
export default TokenContainer;
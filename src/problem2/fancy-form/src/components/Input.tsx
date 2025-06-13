import { Input } from "antd";
import { UseFormRegisterReturn } from "react-hook-form";

type CustomInputProps = {
  placeholder: string;
  register: UseFormRegisterReturn;
  error?: string;
};

const CustomInput: React.FC<CustomInputProps> = ({
  placeholder,
  register,
  error,
}) => (
  <Input
    type="number"
    placeholder={placeholder}
    {...register}
    status={error ? "error" : ""}
    style={{ width: "100%", marginBottom: error ? "4px" : "10px" }}
  />
);

export default CustomInput;

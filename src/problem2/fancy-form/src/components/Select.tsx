import { Select } from "antd";

type CustomSelectProps = {
  placeholder: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
};

const CustomSelect: React.FC<CustomSelectProps> = ({
  placeholder,
  options,
  onChange,
  error,
}) => (
  <Select
    placeholder={placeholder}
    style={{ width: "100%", marginBottom: error ? "4px" : "10px" }}
    onChange={onChange}
    status={error ? "error" : ""}
    showSearch
    optionFilterProp="children"
  >
    {options.map((option, index) => (
      <Select.Option key={`${option}-${index}`} value={option}>
        {option}
      </Select.Option>
    ))}
  </Select>
);

export default CustomSelect;

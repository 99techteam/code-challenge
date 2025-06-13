import { Button } from "antd";

type CustomButtonProps = {
  text: string;
  type: "primary" | "default" | "dashed" | "link" | "text" | "ghost";
  onClick?: () => void;
};

const CustomButton: React.FC<CustomButtonProps> = ({ text, type, onClick }) => (
  <Button
    type={type as "primary" | "default" | "dashed" | "link" | "text"}
    onClick={onClick}
    style={{ width: "100%" }}
  >
    {text}
  </Button>
);

export default CustomButton;

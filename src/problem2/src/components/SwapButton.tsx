import { Button } from "antd";
import { ArrowDownOutlined } from "@ant-design/icons";

interface SwapButtonProps {
  onClick: () => void;
}

export const SwapButton: React.FC<SwapButtonProps> = ({ onClick }) => {
  return (
    <div style={{ textAlign: "center", margin: "24px 0" }}>
      <Button
        shape="circle"
        size="large"
        icon={<ArrowDownOutlined />}
        onClick={onClick}
        className="swap-button"
      />
    </div>
  );
};

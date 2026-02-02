import { Spin } from "antd";

export const LoadingState: React.FC = () => {
  return (
    <div className="app-container">
      <Spin size="large" tip="Loading tokens..." />
    </div>
  );
};

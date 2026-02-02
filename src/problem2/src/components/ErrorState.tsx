import { Alert } from "antd";

interface ErrorStateProps {
  error: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="app-container">
      <Alert message="Error" description={error} type="error" showIcon />
    </div>
  );
};

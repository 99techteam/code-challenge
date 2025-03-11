type ErrorMessageProps = {
  error: string;
};

const ErrorMessage = ({ error }: ErrorMessageProps) => {
  return <div className="text-red-500 text-sm my-5">{error}</div>;
};

export default ErrorMessage;

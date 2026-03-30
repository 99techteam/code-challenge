import { MSG_SWAP_SUCCESS, MSG_EXCHANGE } from '../constants';
import type { ValidationError } from '../types';

interface ConfirmButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
  errors: ValidationError[];
  submitSuccess: boolean;
}

export default function ConfirmButton({
  onClick,
  disabled,
  isLoading,
  errors,
  submitSuccess,
}: ConfirmButtonProps) {
  const getButtonText = () => {
    if (isLoading) return null;
    if (submitSuccess) return MSG_SWAP_SUCCESS;
    if (errors.length > 0) return errors[0].message;
    return MSG_EXCHANGE;
  };

  const getButtonStyle = () => {
    if (submitSuccess) {
      return 'bg-emerald-500 hover:bg-emerald-500 text-white cursor-default';
    }
    if (isLoading) {
      return 'bg-blue-400 text-white cursor-wait';
    }
    if (disabled) {
      return 'bg-gray-200 text-gray-400 cursor-not-allowed';
    }
    return 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98]';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full rounded-xl py-3.5 text-[15px] font-semibold transition-all duration-200 ${getButtonStyle()}`}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </div>
      ) : submitSuccess ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{getButtonText()}</span>
        </div>
      ) : (
        getButtonText()
      )}
    </button>
  );
}

import type { ReactNode } from "react";
import toast from "react-hot-toast";
import type { Toast } from "react-hot-toast";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiInfo,
} from "react-icons/fi";

type ToastType = "success" | "error" | "warning" | "info";

interface CustomToastProps {
  message: ReactNode;
  type?: ToastType;
  duration?: number;
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <FiCheckCircle className="w-6 h-6 mr-2" />,
  error: <FiXCircle className="w-6 h-6 mr-2" />,
  warning: <FiAlertCircle className="w-6 h-6 mr-2" />,
  info: <FiInfo className="w-6 h-6 mr-2" />,
};

const COLORS: Record<ToastType, string> = {
  success: "bg-gradient-to-r from-green-600 to-green-400",
  error: "bg-gradient-to-r from-red-600 to-red-400",
  warning: "bg-gradient-to-r from-yellow-500 to-yellow-400",
  info: "bg-gradient-to-r from-blue-500 to-blue-400",
};

export const showToast = ({
  message,
  type = "success",
  duration = 5000,
}: CustomToastProps) => {
  toast.custom(
    (t: Toast) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-xs w-full text-white rounded-lg shadow-lg pointer-events-auto flex p-3 items-center`}
      >
        <div
          className={`${COLORS[type]} flex items-center p-2 rounded-md mr-2`}
        >
          {ICONS[type]}
        </div>
        <div className="flex-1 text-sm">{message}</div>
        <button
          className="ml-2 text-white/80 hover:text-white"
          onClick={() => toast.dismiss(t.id)}
        >
          <FiXCircle className="w-5 h-5" />
        </button>
      </div>
    ),
    { duration }
  );
};

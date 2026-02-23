import React from "react";
import { Modal as AntModal } from "antd";
import { cn } from "@/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  return (
    <AntModal
      open={isOpen}
      onCancel={onClose}
      title={title}
      footer={null}
      centered
      className={cn("max-w-md w-full", className)}
      rootClassName="dark-modal"
      styles={
        {
          body: { maxHeight: "90vh", overflowY: "auto" },
          mask: { backdropFilter: "blur(4px)" },
          content: { overflowX: "hidden" },
        } as any
      }
      classNames={
        {
          body: "p-0 overflow-x-hidden custom-scrollbar",
          content: "bg-background-secondary text-text-primary border border-gray-800 rounded-2xl",
          header: "bg-background-secondary border-b border-gray-800",
          title: "text-text-primary text-xl font-bold",
          footer: "bg-background-secondary border-t border-gray-800",
        } as any
      }>
      {children}
    </AntModal>
  );
};

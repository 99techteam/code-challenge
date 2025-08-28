import React from "react";

type FormButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

export default function FormButton({ children, ...props }: FormButtonProps) {
  return (
    <button {...props} className={`px-4 py-2 rounded ${props.className ?? ""}`}>
      {children}
    </button>
  );
}
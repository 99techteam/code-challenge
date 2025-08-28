import React from "react";

type SelectButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
};

export default function SelectButton({ icon, children, open, ...props }: SelectButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={`border rounded p-2 bg-white flex items-center gap-2 w-full ${props.className ?? ""}`}
    >
      {icon}
      {children}
      <span className={`ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
        &#9662;
      </span>
    </button>
  );
}
import React from "react";
import { LayoutDashboard, History, Shield, HelpCircle, X } from "lucide-react";
import { cn } from "@/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: false },
    { icon: History, label: "History", active: false },
    { icon: Shield, label: "Security", active: false },
    { icon: HelpCircle, label: "Support", active: false },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-64 transform bg-background-secondary border-r border-gray-800 transition-transform duration-200 ease-in-out lg:static lg:transform-none lg:h-[calc(100vh-64px)] lg:bg-transparent lg:border-r-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-xl font-bold text-primary">Menu</span>
          <button
            onClick={onClose}
            className="text-text-secondary">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                item.active
                  ? "bg-gray-800 text-primary"
                  : "text-text-secondary hover:bg-gray-800 hover:text-text-primary"
              )}>
              <item.icon size={20} />
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
};

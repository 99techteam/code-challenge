import React, { useState } from "react";
import { Header, Sidebar } from "@/components/layout";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 container">
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar
            isOpen={true}
            onClose={() => {}}
          />
        </div>
        <div className="lg:hidden">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 p-4 md:p-8 flex items-start justify-center">{children}</main>
      </div>
    </div>
  );
};

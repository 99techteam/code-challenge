import React from "react";
import { Menu, Globe, Bell, User, Wallet } from "lucide-react";
import { Button } from "@/components/ui";

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden text-text-secondary hover:text-text-primary"
            onClick={onMenuClick}>
            <Menu size={24} />
          </button>
          <a
            href="/"
            className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-background font-bold text-xl">B</span>
            </div>
            <span className="text-xl font-bold text-text-primary hidden md:inline-block">
              Coin Swap
            </span>
          </a>
          <nav className="hidden lg:flex items-center gap-6 ml-8">
            {["Markets", "Trade", "Derivatives", "Earn", "Finance"].map((item) => (
              <a
                key={item}
                href="#"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  item === "Trade" ? "text-primary" : "text-text-secondary"
                }`}>
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4 text-text-secondary">
            <button className="hover:text-text-primary">
              <Wallet size={20} />
            </button>
            <button className="hover:text-text-primary">
              <Globe size={20} />
            </button>
            <button className="hover:text-text-primary">
              <Bell size={20} />
            </button>
            <button className="hover:text-text-primary">
              <User size={20} />
            </button>
          </div>
          <Button
            size="sm"
            className="font-semibold">
            Deposit
          </Button>
        </div>
      </div>
    </header>
  );
};

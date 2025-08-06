import { useState } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const themes = [
  {
    name: "Deep Blue",
    className: "",
    colors: ["#4F46E5", "#06B6D4"],
    description: "Modern DeFi theme with deep blue gradients",
  },
  {
    name: "Emerald",
    className: "theme-emerald",
    colors: ["#10B981", "#34D399"],
    description: "Ethereum-inspired green theme",
  },
  {
    name: "Sunset",
    className: "theme-sunset",
    colors: ["#F97316", "#FBBF24"],
    description: "Warm orange sunset gradients",
  },
  {
    name: "Cosmic",
    className: "theme-cosmic",
    colors: ["#A855F7", "#D946EF"],
    description: "Purple cosmic space theme",
  },
  {
    name: "Cyber",
    className: "theme-cyber",
    colors: ["#00D9FF", "#00FFA3"],
    description: "Neon cyberpunk aesthetic",
  },
];

export const ThemeSelector = () => {
  const [open, setOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("");

  const currentThemeName =
    themes.find((t) => t.className === currentTheme)?.name || "Deep Blue";

  const handleThemeChange = (themeClassName: string) => {
    // Remove all theme classes
    themes.forEach((theme) => {
      if (theme.className) {
        document.documentElement.classList.remove(theme.className);
      }
    });

    // Add new theme class if not default
    if (themeClassName) {
      document.documentElement.classList.add(themeClassName);
    }

    setCurrentTheme(themeClassName);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="glass-card gap-2">
          <Palette className="h-4 w-4" />
          {currentThemeName}
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Choose Theme
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => handleThemeChange(theme.className)}
              className="group relative p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300 text-left"
            >
              {/* Color Preview */}
              <div className="flex gap-2 mb-3">
                {theme.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-8 h-8 rounded-full shadow-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Theme Info */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold">{theme.name}</h4>
                  {currentTheme === theme.className && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {theme.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-primary-glow/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

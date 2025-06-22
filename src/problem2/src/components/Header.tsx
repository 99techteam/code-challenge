import { FC } from "react";
import mainLogo from "/99Tech.png";
import { useTheme } from "@context/ThemeContext";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import WbSunnyIcon from "@mui/icons-material/WbSunny";

const Header: FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full bg-transparent px-6 py-3 backdrop-blur-md shadow-md" >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div className="flex w-fit items-center gap-2">
          <img
            src={mainLogo}
            alt="99Tech Logo"
            width={122}
            height={96}
            className="w-[122px] h-[96px]"
          />
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={toggleTheme}>
          {theme.mode === "light" ? (
            <WbSunnyIcon sx={{ color: "#0e0e2a", fontSize: 30 }} />
          ) : (
            <DarkModeIcon sx={{ color: "#ffffff", fontSize: 30 }} />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const firstLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "";

  useEffect(() => {
    function handleClickOutside(event: any) {
      // @ts-ignore
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="bg-crypto-card border-b border-crypto-cardHover">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-crypto-accent to-indigo-400 bg-clip-text text-transparent">
              CryptoSwap
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/"
                  className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Swap
                </Link>
                <Link
                  to="/balances"
                  className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Balances
                </Link>
                <Link
                  to="/transfer"
                  className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Transfer
                </Link>

                <div className="relative" ref={dropdownRef}>
                  {/* Avatar Button */}
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-crypto-darker text-white text-sm font-semibold border-2 border-crypto-accent cursor-pointer transition-shadow hover:shadow-lg hover:shadow-crypto-accent/30 focus:outline-none"
                    aria-expanded={isDropdownOpen}
                    aria-label="User menu"
                  >
                    {firstLetter}
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-crypto-darker z-10">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu"
                      >
                        {/* Username Display */}
                        <div className="block px-4 py-2 text-xs sm:text-sm text-gray-400 border-b border-crypto-cardHover truncate">
                          {user?.username}
                        </div>

                        {/* Profile Link */}
                        <Link
                          to="/profile"
                          onClick={() => setIsDropdownOpen(false)}
                          className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-gray-300 hover:bg-crypto-cardHover hover:text-white transition-colors"
                          role="menuitem"
                        >
                          Profile
                        </Link>

                        {/* Logout Button */}
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-xs sm:text-sm text-crypto-error hover:bg-crypto-cardHover hover:text-red-400 transition-colors"
                          role="menuitem"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // ... Login/Register Links
              <>
                <Link
                  to="/login"
                  className="text-xs sm:text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded bg-crypto-accent hover:bg-crypto-accentHover text-white transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

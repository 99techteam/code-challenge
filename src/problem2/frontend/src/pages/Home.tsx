import { Link } from "react-router-dom";
import { GreenRightTickIcon } from "../components/Icons";
import SwapForm from "../components/SwapForm";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-crypto-accent/10 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        {/* Swap Form or Login Prompt */}
        <div className="relative z-10 w-full">
          {isAuthenticated ? (
            <SwapForm />
          ) : (
            <div className="w-full max-w-lg mx-auto px-2 sm:px-0">
              <div className="bg-crypto-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-crypto-lg border border-crypto-cardHover text-center">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-crypto-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                  Login Required
                </h2>
                <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6">
                  Please login or create an account to start swapping tokens
                </p>
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    to="/login"
                    className="flex-1 bg-crypto-accent hover:bg-crypto-accentHover text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-300 text-center text-sm sm:text-base"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 bg-crypto-darker border border-crypto-cardHover hover:border-crypto-accent text-white font-semibold py-2.5 sm:py-3 rounded-xl transition-all duration-300 text-center text-sm sm:text-base"
                  >
                    Register
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative mt-3 sm:mt-4 text-center">
          <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <GreenRightTickIcon />
              Secure
            </span>
            <span className="flex items-center gap-1">
              <GreenRightTickIcon />
              Fast
            </span>
            <span className="flex items-center gap-1">
              <GreenRightTickIcon />
              Reliable
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

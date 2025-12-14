import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI, ProfileResponse } from "../services/api";
import Navbar from "../components/Navbar";
import { getTokenByCurrency } from "../data/tokens";

const Profile = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load profile");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyWalletAddress = async () => {
    if (profile?.walletAddress) {
      try {
        await navigator.clipboard.writeText(profile.walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-red-500 text-lg">Failed to load profile</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
            Profile
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-crypto-error/10 border border-crypto-error/30 rounded-lg">
              <p className="text-sm text-crypto-error">{error}</p>
            </div>
          )}

          {/* Profile Information Card */}
          <div className="bg-crypto-card rounded-lg border border-crypto-cardHover p-4 sm:p-6 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
              Account Information
            </h2>

            <div className="space-y-4 sm:space-y-5">
              {/* Username */}
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                  Username
                </label>
                <div className="text-sm sm:text-base text-white bg-crypto-darker px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  {profile.username}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                  Email
                </label>
                <div className="text-sm sm:text-base text-white bg-crypto-darker px-3 sm:px-4 py-2 sm:py-3 rounded-lg">
                  {profile.email}
                </div>
              </div>

              {/* Wallet Address */}
              <div>
                <label className="block text-xs sm:text-sm text-gray-400 mb-1 sm:mb-2">
                  Wallet Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 text-xs sm:text-sm text-white bg-crypto-darker px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-mono break-all">
                    {profile.walletAddress}
                  </div>
                  <button
                    onClick={copyWalletAddress}
                    className="px-4 py-2 sm:py-3 bg-crypto-accent hover:bg-crypto-accentHover text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Token Balances */}
          <div className="bg-crypto-card rounded-lg border border-crypto-cardHover overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-crypto-cardHover">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Token Balances
              </h2>
            </div>

            {profile.tokenBalances.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-crypto-cardHover">
                      <th className="text-left text-xs text-gray-400 font-normal p-3 sm:p-4">
                        Token
                      </th>
                      <th className="text-right text-xs text-gray-400 font-normal p-3 sm:p-4">
                        Balance
                      </th>
                      <th className="text-right text-xs text-gray-400 font-normal p-3 sm:p-4">
                        USD Value
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.tokenBalances.map((balance, index) => {
                      const tokenData = getTokenByCurrency(balance.symbol);
                      const usdValue = tokenData
                        ? balance.amount * tokenData.price
                        : 0;

                      return (
                        <tr
                          key={balance.symbol}
                          className={`${
                            index !== profile.tokenBalances.length - 1
                              ? "border-b border-crypto-cardHover"
                              : ""
                          } hover:bg-crypto-darker transition-colors`}
                        >
                          <td className="p-3 sm:p-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              {tokenData ? (
                                <img
                                  src={tokenData.logo}
                                  alt={tokenData.symbol}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                                  {balance.symbol[0]}
                                </div>
                              )}
                              <div>
                                <div className="text-white text-sm sm:text-base font-medium">
                                  {balance.symbol}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {tokenData?.name || "Token"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 sm:p-4 text-right">
                            <div className="text-white text-sm sm:text-base">
                              {balance.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                            </div>
                          </td>

                          <td className="p-3 sm:p-4 text-right">
                            <div className="text-white text-sm sm:text-base">
                              ${usdValue.toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8 text-center">
                <p className="text-gray-400 text-sm sm:text-base">
                  No token balances found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

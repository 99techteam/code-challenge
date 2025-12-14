import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authAPI, TokenBalance } from "../services/api";
import Navbar from "../components/Navbar";
import { getTokenByCurrency } from "../data/tokens";

const Balances = () => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchBalances();
  }, [isAuthenticated, navigate]);

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getBalances();
      setBalances(data.tokenBalances);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load balances");
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-3 p-2 bg-crypto-error/10 border border-crypto-error/30 rounded">
              <p className="text-sm text-crypto-error">{error}</p>
            </div>
          )}

          {balances.length > 0 ? (
            <div className="bg-crypto-card rounded-lg border border-crypto-cardHover overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-crypto-cardHover">
                    <th className="text-left text-xs text-gray-400 font-normal p-3">
                      Coin
                    </th>
                    <th className="text-right text-xs text-gray-400 font-normal p-3">
                      Amount
                    </th>
                    <th className="text-right text-xs text-gray-400 font-normal p-3">
                      Available
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((balance, index) => {
                    const tokenData = getTokenByCurrency(balance.symbol);
                    const usdValue = tokenData ? balance.amount * tokenData.price : 0;

                    return (
                      <tr
                        key={balance.symbol}
                        className={`${
                          index !== balances.length - 1
                            ? "border-b border-crypto-cardHover"
                            : ""
                        } hover:bg-crypto-darker transition-colors`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {tokenData ? (
                              <img
                                src={tokenData.logo}
                                alt={tokenData.symbol}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-sm font-bold">
                                {balance.symbol[0]}
                              </div>
                            )}
                            <div>
                              <div className="text-white text-sm font-medium">
                                {balance.symbol}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {tokenData?.name || "Token"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="text-white text-sm">
                            {balance.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}
                          </div>
                          <div className="text-gray-500 text-xs">
                            ${usdValue.toFixed(2)}
                          </div>
                        </td>

                        <td className="p-3 text-right">
                          <div className="text-white text-sm">
                            {balance.amount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-crypto-card rounded-lg border border-crypto-cardHover p-8 text-center">
              <p className="text-gray-400">No token balances found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Balances;

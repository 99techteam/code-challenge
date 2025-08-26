import Spinner from "../utils/Spinner";

// Import all SVG icons statically
import ampLUNA from "../assets/amplUNA.svg";
import ATOM from "../assets/ATOM.svg";
import axlUSDC from "../assets/axlUSDC.svg";
import BLUR from "../assets/BLUR.svg";
import bNEO from "../assets/bNEO.svg";
import BUSD from "../assets/BUSD.svg";
import ETH from "../assets/ETH.svg";
import EVMOS from "../assets/EVMOS.svg";
import GMX from "../assets/GMX.svg";
import IBCX from "../assets/IBCX.svg";
import IRIS from "../assets/IRIS.svg";
import KUJI from "../assets/KUJI.svg";
import LSI from "../assets/LSI.svg";
import LUNA from "../assets/LUNA.svg";
import OKB from "../assets/OKB.svg";
import OKT from "../assets/OKT.svg";
import OSMO from "../assets/OSMO.svg";
import RATOM from "../assets/RATOM.svg";
import react from "../assets/react.svg";
import rSWTH from "../assets/rSWTH.svg";
import STATOM from "../assets/STATOM.svg";
import STEVMOS from "../assets/STEVMOS.svg";
import STLUNA from "../assets/STLUNA.svg";
import STOSMO from "../assets/STOSMO.svg";
import STRD from "../assets/STRD.svg";
import SWTH from "../assets/SWTH.svg";
import USC from "../assets/USC.svg";
import USD from "../assets/USD.svg";
import USDC from "../assets/USDC.svg";
import WBTC from "../assets/WBTC.svg";
import wstETH from "../assets/wstETH.svg";
import yieldUSD from "../assets/yieldUSD.svg";
import ZIL from "../assets/ZIL.svg";

// Object mapping currency to SVG source
const currencyIcons = {
  ampLUNA,
  ATOM,
  axlUSDC,
  BLUR,
  bNEO,
  BUSD,
  ETH,
  EVMOS,
  GMX,
  IBCX,
  IRIS,
  KUJI,
  LSI,
  LUNA,
  OKB,
  OKT,
  OSMO,
  RATOM,
  react,
  rSWTH,
  STATOM,
  STEVMOS,
  STLUNA,
  STOSMO,
  STRD,
  SWTH,
  USC,
  USD,
  USDC,
  WBTC,
  wstETH,
  yieldUSD,
  ZIL,
};

const CurrencyForm = ({
  currencies,
  onSubmit,
  loading,
  from,
  to,
  amount,
  setFrom,
  setTo,
  setAmount,
  errors,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 p-6 bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-xl border border-gray-100"
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 tracking-wide">
          Source Currency
        </label>
        <div className="relative">
          <select
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              if (errors.from) errors.from = "";
            }}
            className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:text-gray-400 pl-10 pr-10"
            disabled={loading || !currencies.length}
          >
            <option value="">Select source currency</option>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          {from && currencyIcons[from] && (
            <img
              src={currencyIcons[from]}
              alt={`${from} icon`}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
            />
          )}
        </div>
        {errors.from && (
          <p className="mt-1 text-xs text-red-600">{errors.from}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 tracking-wide">
          Amount
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            if (errors.amount) errors.amount = "";
          }}
          placeholder="Enter amount"
          min="0"
          className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:text-gray-400"
          disabled={loading}
        />
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 tracking-wide">
          Target Currency
        </label>
        <div className="relative">
          <select
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              if (errors.to) errors.to = "";
            }}
            className="mt-2 block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 disabled:bg-gray-100 disabled:text-gray-400 pl-10 pr-10"
            disabled={loading || !currencies.length}
          >
            <option value="">Select target currency</option>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          {to && currencyIcons[to] && (
            <img
              src={currencyIcons[to]}
              alt={`${to} icon`}
              className="absolute top-1/2 left-3 transform -translate-y-1/2 w-5 h-5"
            />
          )}
        </div>
        {errors.to && <p className="mt-1 text-xs text-red-600">{errors.to}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition duration-300 transform hover:scale-[1.02]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            Converting...
            <Spinner
              size={24}
              colors={["from-teal-500", "via-yellow-500", "to-purple-600"]}
            />
          </span>
        ) : (
          "Convert"
        )}
      </button>
    </form>
  );
};

export default CurrencyForm;

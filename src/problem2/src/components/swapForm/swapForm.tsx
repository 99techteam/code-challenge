import { useEffect } from "react";
import type { RootState } from "../../store/store";
import { SwapActionTypes } from "../../store/swap/swapAction";
import { fetchTokens } from "../../store/token/tokenAction";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { TokenSelect } from "../tokenSelect/tokenSelect";
import "./swapForm.css";

const SwapForm = () => {
  const dispatch = useAppDispatch();
  const swap = useAppSelector((state: RootState) => state.swap);
  const tokenList = useAppSelector((state: RootState) => state.token.data);

  useEffect(() => {
    dispatch(fetchTokens());
  }, []);

  const handleSwap = () => {
    if (!swap.fromToken || !swap.toToken || !swap.amount) return;

    const exchangeRate = swap.fromToken.price / swap.toToken.price;
    const result = swap.amount * exchangeRate;
    dispatch({ type: SwapActionTypes.SET_RESULT, payload: result });
  };

  return (
    <>
      {tokenList && tokenList.length > 0 &&
        <div>
          <div className="form-section">
            <div className="mr-10">
              <TokenSelect
                value={swap.fromToken}
                onChange={(val) => dispatch({ type: SwapActionTypes.SET_FROM_TOKEN, payload: val })}
                tokens={tokenList}
              />
            </div>

            <div className="mr-10">
              <TokenSelect
                value={swap.toToken}
                onChange={(val) => dispatch({ type: SwapActionTypes.SET_TO_TOKEN, payload: val })}
                tokens={tokenList}
              />
            </div>
            <input
              type="number"
              className="form-control mr-10"
              value={swap.amount}
              onChange={(e) => dispatch({ type: SwapActionTypes.SET_AMOUNT, payload: Number(e.target.value) })}
            />
            <button className="swap-button" onClick={handleSwap}>Swap</button>
          </div>

          {swap.result && <p>Result: {swap.result.toFixed(2)} {swap.toToken.name}</p>}
        </div>
      }
    </>);
};

export default SwapForm;

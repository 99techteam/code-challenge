import { useState } from 'react';
import { Button } from '@/components/ui/button';
import './style.scss';
import { ConSelect } from '@/components/ConcurSelect/ConcurSelect';
import { useTokens } from '@/hooks/useFetchTokens';
import SplashScreen from '../SplashScreen/SplashScreen';

const ScreenSwapToken = () => {
  const { tokens, loading } = useTokens();
  const [tokenA, setTokenA] = useState('BUSD');
  const [tokenB, setTokenB] = useState('USDC');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  const recalculateAmountB = (input: string, tokenA: string, tokenB: string) => {
    const tokenAPrice = tokens.find(t => t.currency === tokenA)?.price;
    const tokenBPrice = tokens.find(t => t.currency === tokenB)?.price;

    if (!tokenAPrice || !tokenBPrice || isNaN(Number(input))) {
      return '';
    }

    const result = (parseFloat(input) * tokenAPrice) / tokenBPrice;
    return result.toFixed(8);
  };

  const onChangeFromField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setAmountA(input);
    const calculated = recalculateAmountB(input, tokenA, tokenB);
    setAmountB(calculated);
  };
  const handleSwap = () => {
    setTokenA(tokenB);
    setTokenB(tokenA);
    setAmountA('');
    setAmountB('');
  };

  const getImgToken = (token: string) => {
    return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`;
  }

  const handleConvert = () => {
    setAmountA('');
    setAmountB('');
  }

  if (loading) {
    return <SplashScreen />
  }

  return (
    <div className="swapContainer">
      <div className="swapCard">
        <div className="swapContent">
          <div className="swapField">
            <div className="swapFrom">
              <input className="tokenInput" type="number" placeholder='0,00' value={amountA} onChange={onChangeFromField} />
              <span className="balance">Balance: 100 {tokenA}</span>
            </div>
            <div className="swapFromButton">
              <ConSelect tokens={tokens} value={tokenA} onChange={setTokenA} />
            </div>
          </div>

          <div className="swapDivider">
            <button className="arrowBtn" onClick={handleSwap}>⇅</button>
          </div>

          <div className="swapField">
            <div className="swapTo">
              <input className="tokenInput" type="number" placeholder='0,00' value={amountB} readOnly />
              <span className="balance">Balance: 0 {tokenB}</span>
            </div>
            <div className="swapToButton">
              <ConSelect tokens={tokens} value={tokenB} onChange={setTokenB} />
            </div>
          </div>
        </div>

        <div className="exchangeRate">
          {`1 ${tokenA} ≈ ${(tokens.find(t => t.currency === tokenA)?.price! / tokens.find(t => t.currency === tokenB)?.price!).toFixed(4)} ${tokenB}`}
        </div>

        <div className="summary">
          <div className="row">
            <span>You will pay</span>
            <div className='summary-wrapper'>
              <img
                src={getImgToken(tokenA)}
                alt={tokenA}
                className="summary-wrapper"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              &nbsp; {amountA} {tokenA}
            </div>
          </div>
          <div className="row">
            <span>You will receive</span>
            <div className='summary-wrapper'>
              <img
                src={getImgToken(tokenB)}
                alt={tokenB}
                className="summary-wrapper"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
              &nbsp; {amountB} {tokenB}
            </div>
          </div>
          <div className="row">
            <span>
              Fees <span className="info">ⓘ</span>
            </span>
            <span>1.2%</span>
          </div>
        </div>

        <Button className="convertButton" onClick={handleConvert}>⇄ &nbsp; Convert</Button>
      </div>
    </div>
  );
};

export { ScreenSwapToken };

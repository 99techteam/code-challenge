import { useState, useEffect } from "react";

import styles from "./app.module.css";
import { Input, ListTokensModal, Spinner } from "./components";
import { TokenType } from "./components/list-tokens-modal";
import { roundNumber } from "./utils/formats";
import { sleep } from "./utils/async-timer";

export type ModalInfoType = { type: "pay" | "receive"; isOpen: boolean };

function App() {
  const [payValue, setPayValue] = useState<number>(0);
  const [receiveValue, setReceiveValue] = useState<number>(0);
  const [currencyOfPay, setCurrencyOfPay] = useState<TokenType>({
    currency: "ETH",
    price: 1645.9337373737374,
  });
  const [currencyOfReceive, setCurrencyOfReceive] = useState<TokenType>({
    currency: "",
    price: 0,
  });
  const [modalInfo, setModalInfo] = useState<ModalInfoType>({
    type: "pay",
    isOpen: false,
  });
  const [typeOfInputFocus, setTypeOfInputFocus] = useState<"pay" | "receive">(
    "pay"
  );
  const [loading, setLoading] = useState<boolean>(false);

  const handleChangePayValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currencyOfReceive.currency) {
      setReceiveValue(0);
    }

    setTypeOfInputFocus("pay");
    setPayValue(Number(e.target.value));
  };

  const handleChangeReceiveValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currencyOfReceive.currency) {
      setPayValue(0);
    }
    setTypeOfInputFocus("receive");
    setReceiveValue(Number(e.target.value));
  };

  const handleSwapToken = async () => {
    setLoading(true);
    await sleep(2000);
    setLoading(false);
    alert("You have already executed successfully");
  };

  useEffect(() => {
    if (!currencyOfReceive.currency) return;

    if (typeOfInputFocus === "pay") {
      const newReceiveValue =
        (payValue * currencyOfPay.price) / currencyOfReceive.price;
      const roundingNewReceiveValue = roundNumber(newReceiveValue);
      setReceiveValue(Number(roundingNewReceiveValue));
    } else {
      const newPayValue =
        (receiveValue * currencyOfReceive.price) / currencyOfPay.price;
      const roundingNewPayValue = roundNumber(newPayValue);
      setPayValue(Number(roundingNewPayValue));
    }
  }, [
    currencyOfPay.price,
    currencyOfReceive.currency,
    currencyOfReceive.price,
    payValue,
    receiveValue,
    typeOfInputFocus,
  ]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.blockSwapWrapper}>
          <h5 className={styles.title}>Swap</h5>
          <Input
            id="pay"
            label="You Pay"
            type="number"
            value={String(payValue)}
            tokenInfo={currencyOfPay}
            onChange={handleChangePayValue}
            onSelectCurrency={() => setModalInfo({ type: "pay", isOpen: true })}
          />
          <Input
            id="receive"
            label="You Receive"
            type="number"
            value={String(receiveValue)}
            tokenInfo={currencyOfReceive}
            onChange={handleChangeReceiveValue}
            onSelectCurrency={() =>
              setModalInfo({ type: "receive", isOpen: true })
            }
          />
          <button className={styles.buttonSwap} onClick={handleSwapToken}>
            {loading ? <Spinner /> : <>Swap</>}
          </button>
        </div>
      </div>
      {modalInfo.isOpen && (
        <ListTokensModal
          modalInfo={modalInfo}
          setModalInfo={setModalInfo}
          setCurrencyOfPay={setCurrencyOfPay}
          setCurrencyOfReceive={setCurrencyOfReceive}
        />
      )}
    </>
  );
}

export default App;

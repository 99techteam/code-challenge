import ReactModal from "react-modal";
import React, { useState, useEffect, useCallback } from "react";

import { customStyles } from "./constants";
import { tokens } from "src/assets";
import styles from "./list-tokens-modal.module.css";
import { useDebounce } from "src/hooks/use-debounce";
import { ModalInfoType } from "src/App";
import Spinner from "../spinner";

interface ListTokensModalProps {
  modalInfo: ModalInfoType;
  setModalInfo: React.Dispatch<React.SetStateAction<ModalInfoType>>;
  setCurrencyOfPay: React.Dispatch<React.SetStateAction<TokenType>>;
  setCurrencyOfReceive: React.Dispatch<React.SetStateAction<TokenType>>;
}

export type TokenType = {
  currency: string;
  price: number;
};

const ListTokensModal = ({
  modalInfo,
  setModalInfo,
  setCurrencyOfPay,
  setCurrencyOfReceive,
}: ListTokensModalProps) => {
  const [listOfTokens, setListOfTokens] = useState<TokenType[]>([]);
  const [searchedToken, setSearchedToken] = useState<string>("");

  const searchedTokenDebounce = useDebounce(searchedToken);

  const fetchTokens = async () => {
    try {
      const res = await fetch(
        "https://interview.switcheo.com/prices.json"
      ).then((res) => res.json());

      setTimeout(() => {
        setListOfTokens(res);
      }, 500);
    } catch (error) {
      setListOfTokens([]);
    }
  };

  const handleSelectToken = (tokenInfo: TokenType) => {
    if (modalInfo.type === "pay") {
      setCurrencyOfPay(tokenInfo);
      onRequestClose();
    } else if (modalInfo.type === "receive") {
      setCurrencyOfReceive(tokenInfo);
      onRequestClose();
    }
  };

  const onRequestClose = () => {
    setModalInfo((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const handleSearchToken = useCallback(async () => {
    if (!searchedTokenDebounce) {
      return await fetchTokens();
    }

    const newListOfTokens = listOfTokens.filter((token) =>
      token.currency.toLowerCase().includes(searchedTokenDebounce.toLowerCase())
    );
    console.log({ newListOfTokens });
    setListOfTokens(newListOfTokens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchedTokenDebounce]);

  useEffect(() => {
    handleSearchToken();
  }, [handleSearchToken]);

  return (
    <ReactModal
      isOpen={modalInfo.isOpen}
      style={customStyles}
      shouldCloseOnOverlayClick
      shouldCloseOnEsc
      onRequestClose={onRequestClose}
      onAfterOpen={fetchTokens}
      contentLabel="Select a token"
    >
      <div className={styles.header}>
        <p>Select a token</p>
        <input
          className={styles.input}
          placeholder="Search name or paste address"
          value={searchedToken}
          onChange={(e) => setSearchedToken(e.target.value)}
        />
      </div>
      <hr className={styles.line} />
      {!!listOfTokens.length ? (
        listOfTokens.map((token) => (
          <div
            className={styles.tokenItem}
            onClick={() => handleSelectToken(token)}
          >
            {React.createElement(tokens[token.currency].ReactComponent)}
            <div className={styles.currencyName}>
              {token.currency.toUpperCase()}
            </div>
          </div>
        ))
      ) : (
        <div className={styles.spinnerWrapper}>
          <Spinner />
        </div>
      )}
    </ReactModal>
  );
};

export default ListTokensModal;

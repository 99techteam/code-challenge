import axios from "axios";
import { useEffect, useRef, useState } from "react";

import { TokenPriceInfo } from "../../types";
import { EInputType, ESwapStatus } from "../../enums";
import {
    SwapPageContainer,
    SwapPageInner,
    Heading,
    SwapArrowIcon,
    SwapInputArrowButton,
} from "./SwapPage.styled";
import SwapSection from "../../components/SwapSection/SwapSection";
import { MOCK_TOKEN_PRICE_INFO_API } from "../../constants";
import SelectTokensModal from "../../components/SelectTokensModal/SelectTokensModal";
import ArrowDownIcon from "../../assets/img/icons/arrow-down.svg";
import Button from "../../components/Button/Button";
import { delay } from "../../utils/delay";
import ConfirmSwapModal from "../../components/ConfirmSwapModal/ConfirmSwapModal";

interface SelectedToken {
    youPay: TokenPriceInfo;
    youReceive: TokenPriceInfo;
}

interface AmountOutput {
    amountYouPay: string;
    amountYouReceive: string;
}

const SwapPage = () => {
    const [tokenPriceInfo, setTokenPriceInfo] = useState<TokenPriceInfo[]>([]);

    const tokenPriceInfoInitialState = useRef<TokenPriceInfo[]>([]);

    const [selectedToken, setSelectedToken] = useState<{
        youPay: TokenPriceInfo;
        youReceive: TokenPriceInfo;
    }>({
        youPay: {} as TokenPriceInfo,
        youReceive: {} as TokenPriceInfo,
    });

    const [amountOutput, setAmountOutput] = useState<AmountOutput>({
        amountYouPay: "",
        amountYouReceive: "",
    });

    const [searchTokenValue, setSearchTokenValue] = useState("");

    const [isConnectedWallet, setIsConnectedWallet] = useState(false);
    const [loadingButton, setLoadingButton] = useState(false);

    const [isShowConfirmSwapModal, setIsShowConfirmSwapModal] = useState(false);

    const [swapStatus, setSwapStatus] = useState<ESwapStatus>(ESwapStatus.IDLE);

    const getPrices = async () => {
        try {
            const response = await axios.get(MOCK_TOKEN_PRICE_INFO_API);
            if (response && response.data) {
                setTokenPriceInfo(response.data);
                tokenPriceInfoInitialState.current = response.data;
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleAmountInput = (type: EInputType, amountInput: string) => {
        switch (type) {
            case EInputType.PAY: {
                setAmountOutput({
                    ...amountOutput,
                    amountYouPay: amountInput,
                });
                break;
            }

            default: {
                return null;
            }
        }
    };

    const calculateAmountYouReceive = (selectedToken: SelectedToken) => {
        const amountYouPay = parseFloat(amountOutput.amountYouPay);
        const tokenPrice = tokenPriceInfo.find(
            (token) => token.currency === selectedToken.youReceive.currency
        );
        if (tokenPrice) {
            const amountYouReceive =
                (amountYouPay * selectedToken.youPay.price) / tokenPrice.price;
            setAmountOutput({
                ...amountOutput,
                amountYouReceive: amountYouReceive.toString(),
            });
        }
    };

    const [modalState, setModalState] = useState({
        status: false,
        modalType: "",
    });

    const handleToggleModal = (inputType: EInputType) => {
        setModalState({
            status: !modalState.status,
            modalType: inputType,
        });
    };

    const handleCloseModal = () => {
        setModalState({
            status: false,
            modalType: "",
        });
    };

    const handleSelectToken = (token: TokenPriceInfo) => {
        switch (modalState.modalType) {
            case EInputType.PAY: {
                setSelectedToken({
                    ...selectedToken,
                    youPay: token,
                });
                break;
            }

            case EInputType.RECEIVE: {
                setSelectedToken({
                    ...selectedToken,
                    youReceive: token,
                });
                break;
            }

            default: {
                return null;
            }
        }
        handleCloseModal();
    };

    const handleChangeSearchToken = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSearchTokenValue(e.target.value);
    };

    const handleSearchPriceInModal = (searchValue: string) => {
        if (!searchValue)
            return setTokenPriceInfo(tokenPriceInfoInitialState.current);
        const searchResult = tokenPriceInfo.filter((token) =>
            token.currency.toLowerCase().includes(searchValue.toLowerCase())
        );
        setTokenPriceInfo(searchResult);
    };

    useEffect(() => {
        handleSearchPriceInModal(searchTokenValue);
    }, [searchTokenValue]);

    useEffect(() => {
        getPrices();
    }, []);

    useEffect(() => {
        if (selectedToken.youReceive.currency)
            calculateAmountYouReceive(selectedToken);
    }, [selectedToken, amountOutput.amountYouPay]);

    const swapInputArrow = () => {
        setSelectedToken({
            youPay: selectedToken.youReceive,
            youReceive: selectedToken.youPay,
        });
        setAmountOutput({
            amountYouPay: amountOutput.amountYouReceive,
            amountYouReceive: amountOutput.amountYouPay,
        });
    };

    const connectWallet = async () => {
        try {
            setLoadingButton(true);
            //Call API or call method to connect wallet
            await delay(2000);
            //Set connected wallet status if success
            setIsConnectedWallet(true);
        } catch (error) {
            console.log(error);
            //Set connected wallet status if failed
            setIsConnectedWallet(false);
        } finally {
            setLoadingButton(false);
        }
    };

    const generateButton = () => {
        const isValidSwapToken =
            selectedToken.youPay.currency &&
            selectedToken.youReceive.currency &&
            amountOutput.amountYouPay &&
            amountOutput.amountYouReceive;

        if (isConnectedWallet && !isValidSwapToken) {
            return <Button variant="disabled" title="Select Token" />;
        }
        if (isConnectedWallet && isValidSwapToken) {
            return (
                <Button
                    variant="primary"
                    title="Swap"
                    onClick={handleSwapToken}
                />
            );
        }
        return (
            <Button
                variant="primary"
                title="Connect Wallet"
                onClick={connectWallet}
                loading={loadingButton}
            />
        );
    };

    const handleSwapToken = async () => {
        try {
            setIsShowConfirmSwapModal(true);
            //Call API or call method to swap token
            await delay(2000);
            //Set swap status if success
            setSwapStatus(ESwapStatus.SUCCESS);
        } catch (error) {
            console.log(error);
            //Set swap status if failed
            setSwapStatus(ESwapStatus.FAILED);
        }
    };

    const handleCloseConfirmSwapModal = () => {
        setIsShowConfirmSwapModal(false);
        if (swapStatus === ESwapStatus.SUCCESS) {
            setAmountOutput({
                amountYouPay: "",
                amountYouReceive: "",
            });
            setSelectedToken({
                youPay: {} as TokenPriceInfo,
                youReceive: {} as TokenPriceInfo,
            });
        }

        setSwapStatus(ESwapStatus.IDLE);
    };

    return (
        <SwapPageContainer>
            <Heading>Swap anytime, anywhere.</Heading>
            <SwapPageInner>
                <SwapSection
                    title="You Pay"
                    amountInput={amountOutput.amountYouPay}
                    selectedToken={selectedToken.youPay}
                    getAmountInput={(amountInput: string) =>
                        handleAmountInput(EInputType.PAY, amountInput)
                    }
                    onToggleModal={() => handleToggleModal(EInputType.PAY)}
                />

                <SwapInputArrowButton onClick={swapInputArrow}>
                    <SwapArrowIcon src={ArrowDownIcon} alt="swap-arrow" />
                </SwapInputArrowButton>

                <SwapSection
                    title="You Receive"
                    amountInput={amountOutput.amountYouReceive}
                    isDisabledInput
                    selectedToken={selectedToken.youReceive}
                    onToggleModal={() => handleToggleModal(EInputType.RECEIVE)}
                />

                {generateButton()}
            </SwapPageInner>
            {modalState.status && (
                <SelectTokensModal
                    tokenPriceInfo={tokenPriceInfo}
                    onCloseModal={handleCloseModal}
                    onSelectToken={handleSelectToken}
                    onChangeSearchToken={handleChangeSearchToken}
                    searchTokenValue={searchTokenValue}
                />
            )}
            {isShowConfirmSwapModal && (
                <ConfirmSwapModal
                    swapData={{
                        amountYouPay: amountOutput.amountYouPay,
                        amountYouReceive: Number(
                            amountOutput.amountYouReceive
                        ).toFixed(5),
                        tokenYouPay: selectedToken.youPay,
                        tokenYouReceive: selectedToken.youReceive,
                    }}
                    swapStatus={swapStatus}
                    onCloseModal={handleCloseConfirmSwapModal}
                />
            )}
        </SwapPageContainer>
    );
};

export default SwapPage;

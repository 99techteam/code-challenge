import { useMemo } from "react";

import ChevronDownWhiteIcon from "../../assets/img/icons/chevron-down-white.svg";
import { TokenPriceInfo } from "../../types";
import TokenImage from "../TokenImage/TokenImage";
import {
    InputContent,
    PriceInUSD,
    SelectTokenButton,
    SelectTokenButtonContent,
    SelectTokenButtonIcon,
    SelectTokenButtonImage,
    SelectTokenButtonTitle,
    SwapSectionContainer,
    TextInput,
    Title,
} from "./SwapSection.styled";
import { exceptThisSymbols } from "../../constants";

interface SwapSectionProps {
    title: string;
    amountInput: string;
    isDisabledInput?: boolean;
    selectedToken: TokenPriceInfo;
    getAmountInput?: (amount: string) => void;
    onToggleModal?: () => void;
}

const SwapSection = ({
    title,
    amountInput,
    getAmountInput,
    selectedToken,
    isDisabledInput = false,
    onToggleModal,
}: SwapSectionProps) => {
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        getAmountInput && getAmountInput(e.target.value);
    };

    const USDPriceConverted = useMemo(() => {
        if (!selectedToken || !amountInput) return null;
        return selectedToken.price * parseFloat(amountInput);
    }, [amountInput, selectedToken]);

    return (
        <>
            <SwapSectionContainer>
                <Title>{title}</Title>
                <InputContent>
                    <TextInput
                        type="number"
                        inputMode="decimal"
                        placeholder="0"
                        onChange={handleAmountChange}
                        value={amountInput}
                        disabled={isDisabledInput}
                        pattern="^[0-9]*[.,]?[0-9]*$"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        onKeyDown={(e) =>
                            exceptThisSymbols.includes(e.key) &&
                            e.preventDefault()
                        }
                    />
                    <SelectTokenButton onClick={onToggleModal}>
                        <SelectTokenButtonContent>
                            {selectedToken?.currency && (
                                <SelectTokenButtonImage>
                                    <TokenImage
                                        currency={selectedToken?.currency}
                                        width="20px"
                                        height="20px"
                                    />
                                </SelectTokenButtonImage>
                            )}

                            <SelectTokenButtonTitle>
                                {selectedToken?.currency || "Select Token"}
                            </SelectTokenButtonTitle>
                        </SelectTokenButtonContent>

                        <SelectTokenButtonIcon src={ChevronDownWhiteIcon} />
                    </SelectTokenButton>
                </InputContent>
                <PriceInUSD>${USDPriceConverted || " - "}</PriceInUSD>
            </SwapSectionContainer>
        </>
    );
};

export default SwapSection;

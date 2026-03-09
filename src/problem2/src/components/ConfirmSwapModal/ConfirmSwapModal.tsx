import { ESwapStatus } from "../../enums";
import { TokenPriceInfo } from "../../types";
import Loading from "../Loading/Loading";
import TokenImage from "../TokenImage/TokenImage";
import CloseIcon from "../../assets/img/icons/close.svg";
import {
    CloseModalIcon,
    ConfirmSwapModalContainer,
    ConfirmSwapModalContent,
    ConfirmSwapModalInner,
    Description,
    Title,
    TokenSwapInformation,
} from "./ConfirmSwapModal.styled";

interface ConfirmSwapModalProps {
    swapData: {
        amountYouPay: string;
        amountYouReceive: string;
        tokenYouPay: TokenPriceInfo;
        tokenYouReceive: TokenPriceInfo;
    };
    swapStatus: ESwapStatus;
    onCloseModal: () => void;
}

const ConfirmSwapModal = (props: ConfirmSwapModalProps) => {
    const { swapData, swapStatus, onCloseModal } = props;

    const { amountYouPay, amountYouReceive, tokenYouPay, tokenYouReceive } =
        swapData;

    const generateModalContent = () => {
        switch (swapStatus) {
            case ESwapStatus.SUCCESS:
                return (
                    <>
                        <Title>Swap Success</Title>
                        <Description>
                            You have successfully swapped {amountYouPay}{" "}
                            {tokenYouPay.currency} for {amountYouReceive}{" "}
                            {tokenYouReceive.currency}
                        </Description>
                    </>
                );
            case ESwapStatus.FAILED:
                return (
                    <>
                        <Title>Swap Failed</Title>
                        <Description>
                            Something went wrong. Please try again later.
                        </Description>
                    </>
                );
            case ESwapStatus.IDLE:
                return (
                    <>
                        <Loading />
                        <Description>Confirm Swap</Description>
                    </>
                );

            default:
                return null;
        }
    };
    return (
        <ConfirmSwapModalContainer>
            <ConfirmSwapModalInner>
                <CloseModalIcon
                    src={CloseIcon}
                    alt="close"
                    onClick={onCloseModal}
                />

                <ConfirmSwapModalContent>
                    {generateModalContent()}
                    <TokenSwapInformation>
                        <TokenImage currency={tokenYouPay.currency} />
                        <Description>
                            {amountYouPay} {swapData.tokenYouPay.currency}
                        </Description>
                        <Description>&rarr;</Description>
                        <TokenImage currency={tokenYouReceive.currency} />
                        <Description>
                            {amountYouReceive} {tokenYouReceive.currency}
                        </Description>
                    </TokenSwapInformation>
                </ConfirmSwapModalContent>
            </ConfirmSwapModalInner>
        </ConfirmSwapModalContainer>
    );
};

export default ConfirmSwapModal;

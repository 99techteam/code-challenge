import { TokenPriceInfo } from "../../types";
import TokenImage from "../TokenImage/TokenImage";
import CloseIcon from "../../assets/img/icons/close.svg";
import SearchIcon from "../../assets/img/icons/search.svg";
import {
    CloseModalIcon,
    Currency,
    SearchInputIcon,
    SelectTokenModalSearchInput,
    SelectTokenModalSearchInputBox,
    SelectTokensModalContainer,
    SelectTokensModalContent,
    SelectTokensModalHeader,
    SelectTokensModalInner,
    SubTitle,
    Title,
    TokenImageItem,
} from "./SelectTokenModal.styled";
import Flex from "../../styles/Flex.styled";

interface SelectTokensModalProps {
    tokenPriceInfo: TokenPriceInfo[];
    searchTokenValue: string;
    onCloseModal: () => void;
    onSelectToken: (token: TokenPriceInfo) => void;
    onChangeSearchToken: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SelectTokensModal = ({
    tokenPriceInfo,
    onCloseModal,
    onSelectToken,
    onChangeSearchToken,
    searchTokenValue,
}: SelectTokensModalProps) => {
    return (
        <SelectTokensModalContainer>
            <SelectTokensModalInner>
                <SelectTokensModalHeader>
                    <Flex justify="space-between" align="center">
                        <Title>Select Token</Title>
                        <CloseModalIcon
                            src={CloseIcon}
                            alt="close"
                            onClick={onCloseModal}
                        />
                    </Flex>
                    <SelectTokenModalSearchInputBox>
                        <SearchInputIcon src={SearchIcon} alt="search" />
                        <SelectTokenModalSearchInput
                            placeholder="Search token name"
                            onChange={onChangeSearchToken}
                        />
                    </SelectTokenModalSearchInputBox>
                </SelectTokensModalHeader>

                <SelectTokensModalContent>
                    {tokenPriceInfo.length ? (
                        <>
                            <SubTitle>
                                {searchTokenValue
                                    ? "Search Results"
                                    : "Popular Token"}
                            </SubTitle>
                            {tokenPriceInfo?.map(
                                (token: TokenPriceInfo, index: number) => (
                                    <TokenImageItem
                                        key={`${token.currency}${index}`}
                                        onClick={() => onSelectToken(token)}
                                    >
                                        <Currency>{token.currency}</Currency>
                                        <TokenImage currency={token.currency} />
                                    </TokenImageItem>
                                )
                            )}
                        </>
                    ) : (
                        <SubTitle>No result found.</SubTitle>
                    )}
                </SelectTokensModalContent>
            </SelectTokensModalInner>
        </SelectTokensModalContainer>
    );
};

export default SelectTokensModal;

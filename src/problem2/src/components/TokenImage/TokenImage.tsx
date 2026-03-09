import { memo } from "react";

import { images } from "../../assets/img";
import { TokenImageContainer } from "./TokenImage.styled";

interface TokenImageProps {
    currency: string;
    width?: string;
    height?: string;
}

const TokenImage = ({
    currency,
    width = "44px",
    height = "44px",
}: TokenImageProps) => {
    return (
        <TokenImageContainer
            width={width}
            height={height}
            src={images[currency]}
            alt={currency}
        />
    );
};

export default memo(TokenImage);

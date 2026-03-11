import { memo } from "react";

import { images } from "../../assets/img";
import { TokenImageContainer } from "./TokenImage.styled";

interface TokenImageProps {
    currency: string;
    width?: number;
    height?: number;
}

const TokenImage = ({
    currency,
    width = 44,
    height = 44,
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

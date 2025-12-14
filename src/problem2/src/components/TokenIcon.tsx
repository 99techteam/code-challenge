import { useState, type FC } from 'react';
import type { Token } from '../types';

interface TokenIconProps {
    token: Token;
    size?: number;
}

export const TokenIcon: FC<TokenIconProps> = ({ token, size = 24 }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError) {
        return (
            <div
                className="flex items-center justify-center rounded-full bg-slate-700 text-slate-400 font-semibold"
                style={{ width: size, height: size, fontSize: size * 0.4 }}
            >
                {token.symbol.substring(0, 2)}
            </div>
        );
    }

    return (
        <img
            src={token.iconUrl}
            alt={token.symbol}
            width={size}
            height={size}
            onError={() => setImageError(true)}
            className="rounded-full"
        />
    );
};

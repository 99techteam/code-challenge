import { getTokenIcon, TOKEN_ICON_FALLBACK } from "@common";
import { styled } from "@mui/material";
import React from "react";

interface TokenAvatarProps {
  token: string;
  size?: number;
}

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const target = e.currentTarget;
  if (target instanceof HTMLImageElement) {
    target.style.display = "none";
  }
};

export const TokenAvatar = React.memo(
  ({ token, size = 24 }: TokenAvatarProps) => {
    if (!token) return null;
    return (
      <TokenAvatarStyled size={size}>
        <img
          key={token}
          src={getTokenIcon(token)}
          alt={`${token} token icon`}
          loading="lazy"
          onError={handleImageError}
        />
      </TokenAvatarStyled>
    );
  },
);

TokenAvatar.displayName = "TokenAvatar";

const TokenAvatarStyled = styled("div")<{ size: number }>(({ size }) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundImage: `url(${TOKEN_ICON_FALLBACK})`,
  position: "relative",
  "& img": {
    borderRadius: "50%",
    objectFit: "cover",
    display: "block",
    width: size,
    height: size,
  },
}));

interface TokenOptionProps extends React.HTMLAttributes<HTMLLIElement> {
  option: string;
}

const TokenOptionStyled = styled("li")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
}));

export const TokenOption = React.memo(
  ({ option, ...props }: TokenOptionProps) => (
    <TokenOptionStyled {...props}>
      <TokenAvatar token={option} size={24} />
      {option}
    </TokenOptionStyled>
  ),
);

TokenOption.displayName = "TokenOption";

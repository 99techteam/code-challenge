import { type FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TOKEN_ICON_MAIN_URL =
  "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens";
interface TokenLogoProps {
  tokenName: string;
}
const TokenLogo: FC<TokenLogoProps> = ({ tokenName }) => {
  return (
    <Avatar>
      <AvatarImage src={`${TOKEN_ICON_MAIN_URL}/${tokenName}.svg`} />
      <AvatarFallback></AvatarFallback>
    </Avatar>
  );
};

export default TokenLogo;

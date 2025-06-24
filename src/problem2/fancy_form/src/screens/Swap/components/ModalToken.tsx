import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSwap } from "@/contexts/SwapContext";
import { SortOption } from "@/enums";
import { useFilteredTokens } from "@/hooks/useFilterToken";
import { useGetTokenPrices } from "@/hooks/useGetTokenPrices";
import { formatTime } from "@/lib/formatTime";
import type { Token } from "@/types";
import { ArrowRightIcon, CaretDownIcon } from "@phosphor-icons/react";
import { useState } from "react";
import TokenLogo from "./TokenLogo";
interface ModalTokenProps {
  title: "From" | "To";
}

const ModalToken: React.FC<ModalTokenProps> = ({ title }) => {
  //STATES
  const [open, setOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Default);
  const { tokenFrom, tokenTo, selectTokenFrom, selectTokenTo } = useSwap();

  const { data: listToken, isLoading } = useGetTokenPrices();
  // Memoize the filtered and sorted tokens
  const filteredTokens = useFilteredTokens({
    listToken: listToken || [],
    searchQuery,
    sortOption,
  });

  const selectToken = (token: Token) => () => {
    if (title === "From") {
      selectTokenFrom(token);
    } else {
      selectTokenTo(token);
    }
    setOpen(false);
  };
  if (isLoading || !listToken) {
    return <div>Loading...</div>;
  }
  const renderSelectedToken = () => {
    const selectedToken = title === "From" ? tokenFrom : tokenTo;
    if (!selectedToken) {
      return (
        <div className="cursor-pointer">
          <div className="flex items-center text-text justify-end gap-x-1">
            <p className="font-semibold">Select Token</p>
            <CaretDownIcon size={12} weight="bold" />
          </div>
        </div>
      );
    }

    return (
      <div className="cursor-pointer flex gap-x-1">
        <TokenLogo tokenName={selectedToken.currency} />
        <div className="flex items-center text-text justify-end gap-x-1">
          <p className="font-semibold">{selectedToken.currency}</p>
          <CaretDownIcon size={12} weight="bold" />
        </div>
      </div>
    );
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>{renderSelectedToken()}</DialogTrigger>
      <DialogContent className="max-w-sm md:max-w-screen-xl md:w-[400px] max-h-[calc(100vh-48px)] flex flex-col">
        <DialogHeader>
          <DialogTitle className="mb-4">{title}</DialogTitle>
          <Input
            placeholder="Search by token name"
            className="w-full h-10 px-4 !text-sm placeholder:text-xs bg-input rounded-3xl"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="flex justify-between">
            <p className="text-textSubtle font-medium text-xs mt-2">
              Popular tokens
            </p>
            <Select
              value={sortOption}
              onValueChange={(value) => setSortOption(value as SortOption)}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SortOption.Default}>Default</SelectItem>
                <SelectItem value={SortOption.AZ}>A-Z</SelectItem>
                <SelectItem value={SortOption.ZA}>Z-A</SelectItem>
                <SelectItem value={SortOption.Newest}>Newest</SelectItem>
                <SelectItem value={SortOption.Oldest}>Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        <div className="overflow-y-auto">
          <div className="flex-1 flex flex-col gap-2 ">
            {filteredTokens.map((token: Token, index: number) => (
              <div
                key={index}
                className="rounded-md hover:bg-gray-200 px-2 py-3 cursor-pointer flex justify-between items-center"
                onClick={selectToken(token)}
              >
                <div className="flex gap-x-2 items-center">
                  <TokenLogo tokenName={token.currency} />
                  <div>
                    <p className="text-text font-semibold">{token.currency}</p>
                    <p className="text-xs text-textSubtle">
                      {formatTime(token.date)}
                    </p>
                  </div>
                </div>
                {token.currency === tokenFrom?.currency ||
                token.currency === tokenTo?.currency ? (
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex size-2.5 rounded-full bg-sky-500"></span>
                  </span>
                ) : (
                  <ArrowRightIcon size={16} />
                )}
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalToken;

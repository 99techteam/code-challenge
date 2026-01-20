import { History } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SwapForm } from "@/features/Swap/Form"
import { useQuoteQuery } from "@/services/price/price.query"
import type { TTrade } from "@/services/price/price.type"
import { Card, CardFooter, CardHeader } from "./Card"
import { Detail } from "./Detail"


export const Swap = () => {
  const [trade, setTrade] = useState<TTrade>()

  const { data: quote, isLoading } = useQuoteQuery({
    amount: trade?.fromAmount,
    sellToken: trade?.fromToken,
    buyToken: trade?.toToken
  })

  const handleSwitcher = () => {
    setTrade((prev) => {
      if (!prev) return prev

      return {
        ...prev,
        fromToken: prev.toToken,
        toToken: prev.fromToken
      }
    })
  }

  return (
    <Card>
      <CardHeader
        title="Swap"
        extra={
          <Popover>
            <PopoverTrigger className="shrink-0 flex items-center gap-2" asChild>
              <Button size="icon-lg" variant="ghost">
                <History />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-fit" side="left">
              Transaction History
            </PopoverContent>
          </Popover>
        }
      />

      <SwapForm quote={quote} isLoading={isLoading} trade={trade} onTrade={setTrade} onSwitcher={handleSwitcher} />

      <CardFooter>
        <Detail
          price={quote?.price}
          gas={quote?.gas}
          gasPrice={quote?.gasPrice}
          sellToken={trade?.fromToken}
          buyToken={trade?.toToken}
        />
      </CardFooter>
    </Card>
  )
}

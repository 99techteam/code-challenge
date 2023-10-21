import { useEffect, useState } from "react";

export default function usePrices() {
  const [prices, setPrices] = useState<Array<{ [key: string]: number }>>([]);

  useEffect(() => {}, []);

  return prices;
}

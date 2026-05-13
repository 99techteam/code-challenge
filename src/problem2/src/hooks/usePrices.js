import { useState, useEffect } from 'react';

const PRICE_URL = "https://interview.switcheo.com/prices.json";

export const usePrices = () => {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    fetch(PRICE_URL)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const uniqueData = data.filter((item, index, self) =>
            index === self.findIndex((t) => t.currency === item.currency)
          );
          setPrices(uniqueData);
        }
      })
      .catch(err => {
        console.error("Failed to fetch prices", err);
        setPrices([]);
      });
  }, []);

  return prices;
};
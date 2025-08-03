export const getTokenIcon = (currency: string): string => {
  const overideIconList: { [key: string]: string } = {
    RATOM: "ATOM",
    STATOM: "ATOM",
    STEVMOS: "EVMOS",
    STLUNA: "LUNA",
    STOSMO: "OSMO",
  };
  const iconCurrency = overideIconList[currency] || currency;
  return `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${iconCurrency}.svg`;
};

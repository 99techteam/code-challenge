const tokenIcons = import.meta.glob('@/assets/tokens/*.svg', {
  eager: true,
  as: 'url',
});

export const getTokenIcon = (symbol: string) => {
  return tokenIcons[`/src/assets/tokens/${symbol}.svg`] || '/src/assets/tokens/USDC.svg' as string | undefined;
};

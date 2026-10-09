const tokenIcons = import.meta.glob('../assets/tokens/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})

const currencies = Object.entries(tokenIcons)
  .map(([path, icon]) => {
    const symbol = path.split('/').pop().replace(/\.svg$/i, '')

    return {
      symbol,
      name: symbol,
      price: 1,
      icon,
    }
  })
  .sort((first, second) => first.symbol.localeCompare(second.symbol))

export default currencies

import './style.css'

type Asset = { symbol: string; name: string; icon: string; usd: number; decimals: number }

// Demo quotes only; use a market data provider before using this for a real trade.
const assets: Asset[] = [
  { symbol: 'ETH', name: 'Ethereum', icon: '◆', usd: 3200, decimals: 5 },
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿', usd: 64000, decimals: 6 },
  { symbol: 'SOL', name: 'Solana', icon: '◎', usd: 145, decimals: 4 },
  { symbol: 'USDC', name: 'USD Coin', icon: '◉', usd: 1, decimals: 2 },
  { symbol: 'USD', name: 'US Dollar', icon: '$', usd: 1, decimals: 2 },
]
const balances: Record<string, number> = { ETH: 2.4, BTC: 0.08, SOL: 18, USDC: 2500, USD: 2500 }

const app = document.querySelector<HTMLDivElement>('#app')!
app.innerHTML = `
  <main class="shell">
    <header class="topbar"><a class="brand" href="#"><span class="brand-mark">↗</span> orbit<span class="brand-muted">.exchange</span></a><span class="network"><i></i> Ethereum network</span></header>
    <section class="hero"><div class="eyebrow">THE EASY WAY TO EXCHANGE</div><h1>Make your money<br /><span>move.</span></h1><p>Swap between your favorite assets in seconds.</p></section>
    <section class="swap-card" aria-label="Currency swap">
      <div class="card-heading"><div><span class="card-kicker">EXCHANGE</span><h2>Swap tokens</h2></div><button class="icon-button" id="settings" aria-label="Swap settings">⚙</button></div>
      <div class="field-label"><label for="from-amount">You pay</label><span id="balance">Demo balance: 2.40 ETH</span></div>
      <div class="asset-field"><input id="from-amount" type="number" min="0" step="any" value="0.5" inputmode="decimal" aria-label="Amount to swap"/><select id="from-asset" aria-label="Asset to swap from"></select></div>
      <div class="swap-divider"><span id="rate">1 ETH ≈ 22.0690 SOL</span><button class="flip-button" id="flip" aria-label="Switch swap direction">↓↑</button></div>
      <div class="field-label"><label for="to-amount">You receive</label><span>Estimated amount</span></div>
      <div class="asset-field result-field"><output id="to-amount">11.0345</output><select id="to-asset" aria-label="Asset to swap to"></select></div>
      <div class="quote-row"><span>Exchange rate</span><strong id="quote">1 ETH = 22.0690 SOL</strong></div>
      <div class="quote-row"><span>Network fee</span><strong>~ $2.40</strong></div>
      <p class="notice" id="notice">Indicative demo rates. No transaction will be submitted.</p>
      <p class="error" id="error" role="alert"></p>
      <button class="submit" id="submit">Connect wallet <span>↗</span></button>
      <p class="fine-print">By continuing, you agree to our <a href="#terms">Terms of Service</a>.</p>
    </section>
    <footer><span>Designed for your next move.</span><span>Rates shown are illustrative</span></footer>
  </main>
`

const fromInput = document.querySelector<HTMLInputElement>('#from-amount')!
const fromSelect = document.querySelector<HTMLSelectElement>('#from-asset')!
const toSelect = document.querySelector<HTMLSelectElement>('#to-asset')!
const toOutput = document.querySelector<HTMLOutputElement>('#to-amount')!
const selectOptions = assets.map(({ symbol, name, icon }) => `<option value="${symbol}">${icon}　${symbol} · ${name}</option>`).join('')
fromSelect.innerHTML = selectOptions
toSelect.innerHTML = selectOptions
fromSelect.value = 'ETH'
toSelect.value = 'SOL'

function selected(select: HTMLSelectElement): Asset {
  return assets.find(({ symbol }) => symbol === select.value)!
}

function updateQuote() {
  const from = selected(fromSelect)
  const to = selected(toSelect)
  const amount = Number(fromInput.value)
  const rate = from.usd / to.usd
  const output = amount * rate
  const available = balances[from.symbol] ?? 0
  const valid = Number.isFinite(amount) && amount > 0 && amount <= available && from.symbol !== to.symbol
  document.querySelector('#balance')!.textContent = `Demo balance: ${available} ${from.symbol}`
  toOutput.value = valid ? output.toLocaleString(undefined, { maximumFractionDigits: to.decimals }) : '—'
  document.querySelector('#rate')!.textContent = `1 ${from.symbol} ≈ ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to.symbol}`
  document.querySelector('#quote')!.textContent = `1 ${from.symbol} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${to.symbol}`
  document.querySelector('#error')!.textContent = from.symbol === to.symbol
    ? 'Choose two different assets.'
    : !Number.isFinite(amount) || amount <= 0
      ? 'Enter an amount greater than zero.'
      : amount > available
        ? 'Amount exceeds your demo balance.'
      : ''
  document.querySelector<HTMLButtonElement>('#submit')!.disabled = !valid
}

fromInput.addEventListener('input', updateQuote)
fromSelect.addEventListener('change', updateQuote)
toSelect.addEventListener('change', updateQuote)
document.querySelector('#flip')!.addEventListener('click', () => {
  const oldFrom = fromSelect.value
  fromSelect.value = toSelect.value
  toSelect.value = oldFrom
  updateQuote()
})
document.querySelector('#submit')!.addEventListener('click', () => {
  document.querySelector('#notice')!.textContent = 'Wallet connection is a demo in this challenge. No assets are transferred.'
})
document.querySelector('#settings')!.addEventListener('click', () => {
  document.querySelector('#notice')!.textContent = 'Demo settings: 0.5% indicative slippage. No transaction will be submitted.'
})
updateQuote()

import './style.css'
import priceList from './prices.json'

type Price = {
  currency: string
  date: string
  price: number
}

const prices: Price[] = priceList

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="input-container">
    <div class="currency-picker-container">
      <input placeholder="0" type="number" class="start-input" />
      <select value='' class="start-currency">
        <option value=''>
          Select a currency
        </option>
        ${prices.map(price => (
  `<option value=${price.currency}>${price.currency}</option>`
))}
      </select>
      <div class="image-container-start">
        
      </div>
    </div>
    <button class="swap-button">Swap</button>
    <div class="currency-picker-container">
      <input placeholder="0" type="number" class="end-input" />
      <select value='' class="end-currency">
        <option value=''>
          Select a currency
        </option>
        ${prices.map(price => (
  `<option value=${price.currency}>${price.currency}</option>`
))}
      </select>
      <div class="image-container-end">
        
      </div>
    </div>
    <button class="submit-button">
      Convert Rate
    </button>
  </div>
`

const rates: Record<string, number> = {}
Object.entries(prices).forEach(([_, item]) => {
  rates[item.currency] = item.price;
});

console.log(rates)
const startInput: HTMLInputElement | null = document.querySelector('.start-input')
const endInput: HTMLInputElement | null = document.querySelector('.end-input')
const swapButton: HTMLButtonElement | null = document.querySelector('.swap-button')
const submitButton: HTMLButtonElement | null = document.querySelector('.submit-button')
const startCurrencySelect: HTMLSelectElement | null = document.querySelector('.start-currency')
const endCurrencySelect: HTMLSelectElement | null = document.querySelector('.end-currency')
const imageContainerStart: HTMLDivElement | null = document.querySelector('.image-container-start')
const imageContainerEnd: HTMLDivElement | null = document.querySelector('.image-container-end')

if (swapButton && submitButton && startInput && endInput && startCurrencySelect && endCurrencySelect && imageContainerStart && imageContainerEnd) {
  swapButton.addEventListener('click', () => {
    const startCurrency = startCurrencySelect.value
    const endCurrency = endCurrencySelect.value
    startCurrencySelect.value = endCurrency
    endCurrencySelect.value = startCurrency
    imageContainerStart.innerHTML = `<img src='/assets/${startCurrencySelect.value}.svg' />`
    imageContainerEnd.innerHTML = `<img src='/assets/${endCurrencySelect.value}.svg' />`
    if (startCurrencySelect.value && endCurrencySelect.value) {
      const value = parseFloat(startInput.value) || 0;
      endInput.value = String(value * conversionRate());
    }
  })

  // Compute conversion rate: fromAmount * (fromRate / toRate)
  // If same currency, rate = 1
  const conversionRate = () => {
    const fromRate = rates[startCurrencySelect.value] || 1
    const toRate = rates[endCurrencySelect.value] || 1
    return fromRate / toRate
  }

  startInput.addEventListener('keyup', () => {
    if (startCurrencySelect.value !== '' && endCurrencySelect.value !== '') {
      const value = parseFloat(startInput.value) || 0;
      endInput.value = String(value * conversionRate());
    }
  })

  startCurrencySelect.addEventListener('change', () => {
    if (startCurrencySelect.value !== '' && endCurrencySelect.value !== '') {
      const value = parseFloat(startInput.value) || 0;
      endInput.value = String(value * conversionRate());
    }
    if (startCurrencySelect.value !== '')
      imageContainerStart.innerHTML = `<img src='/assets/${startCurrencySelect.value}.svg' />`
    else
      imageContainerStart.innerHTML = ''
  })

  endCurrencySelect.addEventListener('change', () => {
    if (startCurrencySelect.value !== '' && endCurrencySelect.value !== '') {
      const value = parseFloat(startInput.value) || 0;
      endInput.value = String(value * conversionRate());
    }
    if (endCurrencySelect.value !== '')
      imageContainerEnd.innerHTML = `<img src='/assets/${endCurrencySelect.value}.svg' />`
    else
      imageContainerEnd.innerHTML = ''
  })
}
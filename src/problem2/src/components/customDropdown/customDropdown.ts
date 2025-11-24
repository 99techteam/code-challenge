import { CurrencyPrice } from '../../types'

export class CustomDropdown {
  private element: HTMLElement
  private onSelectionChange: (currency: string) => void
  private selectedValue = ''
  private currencies: CurrencyPrice[] = []

  constructor(
    element: HTMLElement,
    onSelectionChange: (currency: string) => void
  ) {
    this.element = element
    this.onSelectionChange = onSelectionChange
    this.initializeEventListeners()
  }

  public loadCurrencies(currencies: CurrencyPrice[]): void {
    this.currencies = currencies
    this.populate(currencies)
  }

  public showLoading(): void {
    const optionsContainer = this.element.querySelector(
      '.select-options'
    ) as HTMLElement
    optionsContainer.innerHTML =
      '<div class="loading-option">Loading currencies...</div>'
  }

  private initializeEventListeners(): void {
    const trigger = this.element.querySelector('.select-trigger') as HTMLElement

    // Add click handler to trigger
    trigger.addEventListener('click', e => {
      e.stopPropagation()
      this.toggleDropdown()
    })

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      this.closeDropdown()
    })
  }

  private populate(currencies: CurrencyPrice[]): void {
    const optionsContainer = this.element.querySelector(
      '.select-options'
    ) as HTMLElement

    // Clear existing options
    optionsContainer.innerHTML = ''

    currencies.forEach(currency => {
      const option = document.createElement('div')
      option.className = 'select-option'
      option.dataset.value = currency.currency

      // Check if icon exists
      const iconPath = `/icons/${currency.currency}.svg`

      // Show wallet balance if available, otherwise show market price
      const priceDisplay =
        (currency as any).walletAmount !== undefined
          ? `${(currency as any).walletAmount.toFixed(6)} ($${(currency as any).walletValue.toFixed(2)})`
          : `$${currency.price.toFixed(4)}`

      option.innerHTML = `
        <img src="${iconPath}" alt="${currency.currency}" class="currency-icon" 
             onerror="this.style.display='none'" />
        <div class="option-text">
          <span class="currency-name">${currency.currency}</span>
          <span class="currency-price">${priceDisplay}</span>
        </div>
      `

      option.addEventListener('click', () => {
        this.selectCurrency(currency)
      })

      optionsContainer.appendChild(option)
    })
  }

  public getCurrencies(): CurrencyPrice[] {
    return this.currencies
  }

  private selectCurrency(currency: CurrencyPrice): void {
    const placeholder = this.element.querySelector(
      '.select-placeholder'
    ) as HTMLElement
    const options = this.element.querySelectorAll('.select-option')

    // Update selected currency
    this.selectedValue = currency.currency

    // Update placeholder with selected currency
    const iconPath = `/icons/${currency.currency}.svg`
    placeholder.innerHTML = `
      <img src="${iconPath}" alt="${currency.currency}" class="currency-icon" 
           onerror="this.style.display='none'" />
      <span>${currency.currency}</span>
    `
    placeholder.classList.add('has-selection')

    // Update option states
    options.forEach(opt => opt.classList.remove('selected'))
    const selectedOption = this.element.querySelector(
      `[data-value="${currency.currency}"]`
    )
    selectedOption?.classList.add('selected')

    // Close dropdown
    this.closeDropdown()

    // Notify parent component
    this.onSelectionChange(currency.currency)
  }

  private toggleDropdown(): void {
    const trigger = this.element.querySelector('.select-trigger') as HTMLElement
    const options = this.element.querySelector('.select-options') as HTMLElement

    const isOpen = options.classList.contains('open')

    // Close all other dropdowns
    document.querySelectorAll('.select-options.open').forEach(el => {
      el.classList.remove('open')
    })
    document.querySelectorAll('.select-trigger.open').forEach(el => {
      el.classList.remove('open')
    })

    if (!isOpen) {
      trigger.classList.add('open')
      options.classList.add('open')
    }
  }

  private closeDropdown(): void {
    const trigger = this.element.querySelector('.select-trigger') as HTMLElement
    const options = this.element.querySelector('.select-options') as HTMLElement

    trigger.classList.remove('open')
    options.classList.remove('open')
  }

  public reset(): void {
    const placeholder = this.element.querySelector(
      '.select-placeholder'
    ) as HTMLElement
    const options = this.element.querySelectorAll('.select-option')

    placeholder.innerHTML = 'Select currency...'
    placeholder.classList.remove('has-selection')

    options.forEach(opt => opt.classList.remove('selected'))
    this.closeDropdown()
    this.selectedValue = ''
  }

  public getSelectedValue(): string {
    return this.selectedValue
  }

  public setDisabled(disabled: boolean): void {
    const trigger = this.element.querySelector('.select-trigger') as HTMLElement
    if (trigger) {
      trigger.style.pointerEvents = disabled ? 'none' : 'auto'
      if (disabled) {
        this.element.classList.add('disabled')
      } else {
        this.element.classList.remove('disabled')
      }
    }
  }

  public getCurrencyByName(currencyName: string): CurrencyPrice | undefined {
    return this.currencies.find(c => c.currency === currencyName)
  }
}

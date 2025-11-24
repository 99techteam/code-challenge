import { CustomDropdown } from './components/customDropdown/customDropdown.js'
import { InputNumber } from './components/inputNumber/inputNumber.js'
import { Dashboard } from './components/dashboard/dashboard.js'
import { fetchCurrencyPrices, fetchWalletData } from './apis/index.js'
import { CurrencyPrice, SwapFormData } from './types'

class SwapForm {
  private form: HTMLFormElement
  private confirmButton: HTMLButtonElement
  private cancelButton: HTMLButtonElement
  private inputCurrencyDropdown!: CustomDropdown
  private outputCurrencyDropdown!: CustomDropdown
  private inputAmountField!: InputNumber
  private outputAmountField!: InputNumber
  private allCurrencies: CurrencyPrice[] = []
  private walletCurrencies: CurrencyPrice[] = []
  private static currenciesCache: CurrencyPrice[] | null = null
  private static loadingPromise: Promise<CurrencyPrice[]> | null = null

  constructor() {
    this.form = document.getElementById('fancy-form') as HTMLFormElement
    this.confirmButton = document.getElementById(
      'confirm-swap'
    ) as HTMLButtonElement
    this.cancelButton = document.getElementById(
      'cancel-swap'
    ) as HTMLButtonElement

    this.initializeInputNumbers()
    this.initializeDropdowns()
    this.initializeEventListeners()
    this.loadCurrencyData()

    // Initial state: disable fields until From Currency is selected
    this.inputAmountField.setDisabled(true)
    this.outputCurrencyDropdown.setDisabled(true)
    this.confirmButton.disabled = true
  }

  private initializeInputNumbers(): void {
    this.inputAmountField = new InputNumber(
      'input-amount',
      {
        label: 'Amount to send',
        placeholder: 'Enter amount',
        required: true,
        min: 0.000001,
        showMaxButton: true,
      },
      () => {
        this.calculateOutputAmount()
        this.validateInputs()
      },
      () => {
        this.setMaxAmount()
      }
    )

    this.outputAmountField = new InputNumber('output-amount', {
      label: 'Amount to receive',
      readonly: true,
    })
  }

  private initializeDropdowns(): void {
    const inputCurrencyField = document.getElementById(
      'input-currency'
    ) as HTMLElement
    const outputCurrencyField = document.getElementById(
      'output-currency'
    ) as HTMLElement

    this.inputCurrencyDropdown = new CustomDropdown(
      inputCurrencyField,
      currency => this.onCurrencyChange('input', currency)
    )

    this.outputCurrencyDropdown = new CustomDropdown(
      outputCurrencyField,
      currency => this.onCurrencyChange('output', currency)
    )

    // Show loading state
    this.inputCurrencyDropdown.showLoading()
    this.outputCurrencyDropdown.showLoading()
  }

  private async loadCurrencyData(): Promise<void> {
    try {
      // Load all currencies and wallet currencies in parallel
      const [allCurrencies, walletCurrencies] = await Promise.all([
        this.getAllCurrencies(),
        this.getWalletCurrencies(),
      ])

      this.allCurrencies = allCurrencies
      this.walletCurrencies = walletCurrencies

      // Load currencies into dropdowns
      this.inputCurrencyDropdown.loadCurrencies(walletCurrencies)
      this.outputCurrencyDropdown.loadCurrencies(allCurrencies)
    } catch (error) {
      console.error('Failed to load currency data:', error)
    }
  }

  private async getAllCurrencies(): Promise<CurrencyPrice[]> {
    // Return cached data if available
    if (SwapForm.currenciesCache) {
      return SwapForm.currenciesCache
    }

    // Return existing promise if already loading
    if (SwapForm.loadingPromise) {
      return SwapForm.loadingPromise
    }

    // Create new loading promise
    SwapForm.loadingPromise = (async () => {
      const data = await fetchCurrencyPrices()

      // Get unique currencies with latest prices
      const currencyMap = new Map<string, CurrencyPrice>()
      data.forEach(item => {
        const existing = currencyMap.get(item.currency)
        if (!existing || new Date(item.date) > new Date(existing.date)) {
          currencyMap.set(item.currency, item)
        }
      })

      return Array.from(currencyMap.values()).sort((a, b) =>
        a.currency.localeCompare(b.currency)
      )
    })()

    try {
      const currencies = await SwapForm.loadingPromise
      SwapForm.currenciesCache = currencies
      return currencies
    } finally {
      SwapForm.loadingPromise = null
    }
  }

  private async getWalletCurrencies(): Promise<CurrencyPrice[]> {
    try {
      // Load wallet data and currency prices in parallel
      const [walletData, allCurrencies] = await Promise.all([
        fetchWalletData(),
        this.getAllCurrencies(),
      ])

      if (!walletData.holdings) {
        throw new Error('Invalid wallet data')
      }

      // Get currencies that user has in wallet
      const walletCurrencies = walletData.holdings.map(
        (holding: any) => holding.currency
      )

      // Filter all currencies to only include wallet currencies
      const availableCurrencies = allCurrencies.filter(currency =>
        walletCurrencies.includes(currency.currency)
      )

      // Add holdings amount information to currency data
      return availableCurrencies.map(currency => {
        const holding = walletData.holdings.find(
          (h: any) => h.currency === currency.currency
        )
        return {
          ...currency,
          walletAmount: holding ? holding.amount : 0,
          walletValue: holding ? holding.usdValue : 0,
        }
      })
    } catch (error) {
      console.error('Failed to load wallet currencies:', error)
      throw error
    }
  }

  private setMaxAmount(): void {
    const selectedCurrency = this.inputCurrencyDropdown.getSelectedValue()
    if (!selectedCurrency) {
      return
    }

    // Find the currency in wallet currencies to get the balance
    const walletCurrency = this.walletCurrencies.find(
      c => c.currency === selectedCurrency
    )

    if (walletCurrency && (walletCurrency as any).walletAmount !== undefined) {
      const maxAmount = (walletCurrency as any).walletAmount
      this.inputAmountField.setValue(maxAmount)
      this.calculateOutputAmount()
      this.validateInputs()
    }
  }

  private onCurrencyChange(type: 'input' | 'output', currency: string): void {
    // Update MAX button state when input currency changes
    if (type === 'input') {
      const hasWalletBalance =
        currency &&
        this.walletCurrencies.some(
          c => c.currency === currency && (c as any).walletAmount > 0
        )
      this.inputAmountField.setMaxButtonDisabled(!hasWalletBalance)

      // Enable/disable other fields based on selection
      const hasSelection = !!currency
      this.inputAmountField.setDisabled(!hasSelection)
      this.outputCurrencyDropdown.setDisabled(!hasSelection)
    }

    this.calculateOutputAmount()
    this.validateInputs()
  }

  private initializeEventListeners(): void {
    // Handle form submission
    this.form.addEventListener('submit', e => this.handleFormSubmit(e))

    // Handle confirm button click
    this.confirmButton.addEventListener('click', e => this.handleConfirmSwap(e))

    // Handle cancel button click
    this.cancelButton.addEventListener('click', () => this.handleCancel())

    // Input changes and currency changes are now handled in their respective components
  }

  private handleFormSubmit(event: Event): void {
    event.preventDefault()
    console.log('Form submission prevented - handling via custom logic')
  }

  private handleConfirmSwap(event: Event): void {
    event.preventDefault()

    const formData = this.getFormData()

    if (this.validateFormData(formData)) {
      this.processSwap(formData)
    } else {
      this.showValidationError()
    }
  }

  private handleCancel(): void {
    this.resetForm()
  }

  private calculateOutputAmount(): void {
    const inputAmount = this.inputAmountField.getValue()
    const inputCurrency = this.inputCurrencyDropdown.getSelectedValue()
    const outputCurrency = this.outputCurrencyDropdown.getSelectedValue()

    if (inputAmount > 0 && inputCurrency && outputCurrency) {
      // Get currency prices from stored data
      const inputCurrencyData = this.walletCurrencies.find(
        c => c.currency === inputCurrency
      )
      const outputCurrencyData = this.allCurrencies.find(
        c => c.currency === outputCurrency
      )

      const inputPrice = inputCurrencyData?.price || 0
      const outputPrice = outputCurrencyData?.price || 0

      if (inputPrice > 0 && outputPrice > 0) {
        const outputAmount = (inputAmount * inputPrice) / outputPrice
        this.outputAmountField.setValue(parseFloat(outputAmount.toFixed(6)))
      }
    } else {
      this.outputAmountField.setValue('')
    }
  }

  private getFormData(): SwapFormData {
    return {
      inputAmount: this.inputAmountField.getValue(),
      outputAmount: this.outputAmountField.getValue(),
      inputCurrency: this.inputCurrencyDropdown.getSelectedValue(),
      outputCurrency: this.outputCurrencyDropdown.getSelectedValue(),
    }
  }

  private validateFormData(data: SwapFormData): boolean {
    return (
      data.inputAmount > 0 &&
      data.outputAmount > 0 &&
      data.inputCurrency !== '' &&
      data.outputCurrency !== '' &&
      data.inputCurrency !== data.outputCurrency
    )
  }

  private validateInputs(): void {
    const formData = this.getFormData()
    const isValid = this.validateFormData(formData)

    // Update button state based on validation
    this.confirmButton.disabled = !isValid

    // Update dirty state
    this.updateDirtyState()

    // Validate currencies are selected and different
    const currenciesValid =
      formData.inputCurrency !== '' &&
      formData.outputCurrency !== '' &&
      formData.inputCurrency !== formData.outputCurrency

    if (
      !currenciesValid &&
      formData.inputCurrency !== '' &&
      formData.outputCurrency !== ''
    ) {
      if (formData.inputCurrency === formData.outputCurrency) {
        this.showTempMessage('Cannot swap to the same currency')
      }
    }
  }

  private processSwap(data: SwapFormData): void {
    console.log('Processing swap:', data)

    // Show loading state
    this.setLoadingState(true)

    // Simulate API call
    setTimeout(() => {
      this.setLoadingState(false)
      this.showSuccessMessage(data)
    }, 1500)
  }

  private setLoadingState(loading: boolean): void {
    this.confirmButton.disabled = loading
    this.confirmButton.textContent = loading ? 'PROCESSING...' : 'CONFIRM SWAP'

    // Disable form inputs during processing
    this.inputAmountField.setDisabled(loading)
    this.outputAmountField.setDisabled(loading)

    // Disable custom dropdowns
    this.inputCurrencyDropdown.setDisabled(loading)
    this.outputCurrencyDropdown.setDisabled(loading)
  }

  private showSuccessMessage(data: SwapFormData): void {
    alert(
      `Swap successful! Sent ${data.inputAmount} ${data.inputCurrency} and received ${data.outputAmount} ${data.outputCurrency}`
    )
    this.resetForm()
  }

  private showValidationError(): void {
    alert('Please select different currencies and enter a valid amount.')
  }

  private showTempMessage(message: string): void {
    const tempDiv = document.createElement('div')
    tempDiv.textContent = message
    tempDiv.className = 'validation-message'
    tempDiv.style.textAlign = 'center'
    tempDiv.style.marginTop = '10px'

    this.form.appendChild(tempDiv)

    setTimeout(() => {
      tempDiv.remove()
    }, 3000)
  }

  private resetForm(): void {
    this.confirmButton.disabled = true

    // Reset input components
    this.inputAmountField.reset()
    this.outputAmountField.reset()

    // Reset custom dropdowns
    this.inputCurrencyDropdown.reset()
    this.outputCurrencyDropdown.reset()

    // Reset to initial state
    this.inputAmountField.setDisabled(true)
    this.outputCurrencyDropdown.setDisabled(true)
    this.inputAmountField.setMaxButtonDisabled(true)

    this.updateDirtyState()
  }

  private updateDirtyState(): void {
    const formData = this.getFormData()
    const isDirty =
      formData.inputAmount > 0 ||
      formData.inputCurrency !== '' ||
      formData.outputCurrency !== ''

    this.cancelButton.disabled = !isDirty
  }
}

function main(): void {
  console.log('Application started')

  // Initialize the swap form when DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new Dashboard()
      new SwapForm()
    })
  } else {
    new Dashboard()
    new SwapForm()
  }
}

main()

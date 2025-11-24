import { InputNumberOptions } from '../../types'

export class InputNumber {
  private container: HTMLElement
  private inputElement!: HTMLInputElement
  private labelElement!: HTMLLabelElement
  private errorElement!: HTMLElement
  private maxButton!: HTMLButtonElement
  private onValueChange: (value: number) => void
  private onMaxClick: (() => void) | null = null
  private options: InputNumberOptions
  private rawValue: string = ''
  private isFocused: boolean = false

  constructor(
    containerId: string,
    options: InputNumberOptions,
    onValueChange: (value: number) => void = () => {},
    onMaxClick: (() => void) | null = null
  ) {
    this.container = document.getElementById(containerId) as HTMLElement
    this.options = options
    this.onValueChange = onValueChange
    this.onMaxClick = onMaxClick

    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`)
    }

    this.createElements()
    this.initializeEventListeners()
  }

  private createElements(): void {
    // Create label
    this.labelElement = document.createElement('label')
    this.labelElement.className = 'input-number-label'
    this.labelElement.textContent = this.options.label

    // Create input wrapper
    const inputWrapper = document.createElement('div')
    inputWrapper.className = 'input-number-wrapper'

    // Create input container for input + max button
    const inputContainer = document.createElement('div')
    inputContainer.className = 'input-container'

    // Create input
    this.inputElement = document.createElement('input')
    this.inputElement.type = 'text'
    this.inputElement.inputMode = 'decimal'
    this.inputElement.className = 'input-number-field'
    this.inputElement.placeholder = this.options.placeholder || ''

    // Set autocomplete for better UX
    this.inputElement.autocomplete = 'off'
    if (this.options.readonly) {
      this.inputElement.readOnly = true
    }
    if (this.options.required) {
      this.inputElement.required = true
    }

    // Create MAX button if enabled
    if (this.options.showMaxButton && this.onMaxClick) {
      this.maxButton = document.createElement('button')
      this.maxButton.type = 'button'
      this.maxButton.className = 'max-button'
      this.maxButton.textContent = 'MAX'
      this.maxButton.addEventListener('click', e => {
        e.preventDefault()
        this.onMaxClick?.()
      })
    }

    // Create error message element
    this.errorElement = document.createElement('div')
    this.errorElement.className = 'input-number-error'
    this.errorElement.style.display = 'none'

    // Assemble the input container
    inputContainer.appendChild(this.inputElement)
    if (this.options.showMaxButton && this.maxButton) {
      inputContainer.appendChild(this.maxButton)
    }

    // Assemble the component
    inputWrapper.appendChild(inputContainer)
    inputWrapper.appendChild(this.errorElement)

    this.container.className = 'input-number-container'
    this.container.appendChild(this.labelElement)
    this.container.appendChild(inputWrapper)
  }

  private initializeEventListeners(): void {
    this.inputElement.addEventListener('input', e => {
      this.handleInput(e)
    })

    this.inputElement.addEventListener('focus', () => {
      this.isFocused = true
      // Show raw value on focus for easier editing
      if (this.rawValue) {
        this.inputElement.value = this.rawValue
      }
    })

    this.inputElement.addEventListener('blur', () => {
      this.isFocused = false
      this.formatAndValidate()
    })

    // Prevent non-numeric input except decimal point
    this.inputElement.addEventListener('keypress', e => {
      this.handleKeyPress(e)
    })
  }

  private handleInput(e: Event): void {
    const input = e.target as HTMLInputElement
    let value = input.value

    // Remove any non-digit characters except decimal point
    value = value.replace(/[^0-9.]/g, '')

    // Ensure only one decimal point
    const parts = value.split('.')
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('')
    }

    // Update raw value and input
    this.rawValue = value
    input.value = value

    // Trigger value change callback
    const numericValue = this.parseValue(value)
    this.onValueChange(numericValue)
  }

  private handleKeyPress(e: KeyboardEvent): void {
    const char = e.key
    const currentValue = this.inputElement.value

    // Allow digits, decimal point, backspace, delete, arrow keys, etc.
    if (/[0-9]/.test(char)) {
      return // Allow digits
    }

    if (char === '.' && !currentValue.includes('.')) {
      return // Allow single decimal point
    }

    if (e.ctrlKey || e.metaKey) {
      return
    }

    // Prevent all other characters
    e.preventDefault()
  }

  private formatAndValidate(): void {
    if (!this.rawValue) {
      this.inputElement.value = ''
      this.validateInput()
      return
    }

    const numericValue = this.parseValue(this.rawValue)

    // Format with thousand separators when not focused
    if (!this.isFocused) {
      this.inputElement.value = this.formatNumber(numericValue)
    }

    this.validateInput()
  }

  private parseValue(value: string): number {
    if (!value) return 0
    const cleaned = value.replace(/,/g, '') // Remove commas
    return parseFloat(cleaned) || 0
  }

  private formatNumber(value: number): string {
    if (value === 0 || isNaN(value)) return ''

    // Format with thousand separators while preserving decimals
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8, // Support up to 8 decimal places
    })
  }

  private validateInput(): void {
    const value = this.parseValue(this.rawValue)
    const hasValue = this.rawValue !== ''
    let isValid = true
    let errorMessage = ''

    if (this.options.required && !hasValue) {
      isValid = false
      errorMessage = 'This field is required'
    } else if (hasValue) {
      if (isNaN(value)) {
        isValid = false
        errorMessage = 'Please enter a valid number'
      } else if (this.options.min !== undefined && value < this.options.min) {
        isValid = false
        errorMessage = `Value must be at least ${this.options.min}`
      } else if (this.options.max !== undefined && value > this.options.max) {
        isValid = false
        errorMessage = `Value must be at most ${this.options.max}`
      } else if (value <= 0 && this.options.min === undefined) {
        isValid = false
        errorMessage = 'Please enter a valid amount greater than 0'
      }
    }

    this.updateValidationState(isValid, errorMessage, hasValue)
  }

  private updateValidationState(
    isValid: boolean,
    errorMessage: string,
    hasValue: boolean
  ): void {
    const showError = !isValid && hasValue

    this.inputElement.classList.toggle('invalid', showError)
    this.inputElement.classList.toggle('valid', isValid && hasValue)

    if (showError) {
      this.errorElement.textContent = errorMessage
      this.errorElement.style.display = 'block'
    } else {
      this.errorElement.style.display = 'none'
    }
  }

  public getValue(): number {
    return this.parseValue(this.rawValue)
  }

  public setValue(value: number | string): void {
    const stringValue = value.toString()
    this.rawValue = stringValue

    if (this.isFocused) {
      this.inputElement.value = stringValue
    } else {
      const numericValue = this.parseValue(stringValue)
      this.inputElement.value = this.formatNumber(numericValue)
    }

    this.validateInput()
  }

  public isValid(): boolean {
    const value = this.parseValue(this.rawValue)
    const hasValue = this.rawValue !== ''

    if (this.options.required && !hasValue) {
      return false
    }
    if (hasValue && isNaN(value)) {
      return false
    }
    if (this.options.min !== undefined && value < this.options.min) {
      return false
    }
    if (this.options.max !== undefined && value > this.options.max) {
      return false
    }
    if (hasValue && value <= 0 && this.options.min === undefined) {
      return false
    }

    return true
  }

  public reset(): void {
    this.rawValue = ''
    this.inputElement.value = ''
    this.inputElement.classList.remove('valid', 'invalid')
    this.errorElement.style.display = 'none'
  }

  public setDisabled(disabled: boolean): void {
    this.inputElement.disabled = disabled
  }

  public setReadonly(readonly: boolean): void {
    this.inputElement.readOnly = readonly
  }

  public focus(): void {
    this.inputElement.focus()
  }

  public getElement(): HTMLInputElement {
    return this.inputElement
  }

  public setMaxButtonDisabled(disabled: boolean): void {
    if (this.maxButton) {
      this.maxButton.disabled = disabled
    }
  }
}

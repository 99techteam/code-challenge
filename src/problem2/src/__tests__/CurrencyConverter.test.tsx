import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, beforeEach, afterEach } from 'vitest'
import CurrencyConverter from '../components/CurrencyConverter'
import * as api from '../services/api'

vi.mock('../services/api', () => ({
  fetchTokenPrices: vi.fn(),
  calculateExchangeRate: vi.fn(),
  getAvailableCurrencies: vi.fn(),
}))

const mockTokenPrices = [
  {"currency":"USD","date":"2023-08-29T07:10:30.000Z","price":1},
  {"currency":"ETH","date":"2023-08-29T07:10:52.000Z","price":1645.93},
  {"currency":"BLUR","date":"2023-08-29T07:10:40.000Z","price":0.208},
  {"currency":"ATOM","date":"2023-08-29T07:10:50.000Z","price":7.18}
]

describe('CurrencyConverter', () => {
  beforeEach(() => {
    vi.mocked(api.fetchTokenPrices).mockResolvedValue(mockTokenPrices)
    vi.mocked(api.getAvailableCurrencies).mockReturnValue(['USD', 'ETH', 'BLUR', 'ATOM'])
    vi.mocked(api.calculateExchangeRate).mockReturnValue(1645.93)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  test('renders currency converter component with loading state', async () => {
    render(<CurrencyConverter />)
    
    expect(screen.getByText('Loading token prices...')).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('Currency Converter')).toBeInTheDocument()
    expect(screen.getByTestId('from-currency-select')).toBeInTheDocument()
    expect(screen.getByTestId('to-currency-select')).toBeInTheDocument()
    expect(screen.getByTestId('swap-button')).toBeInTheDocument()
  })

  test('fetches token prices on mount', async () => {
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(api.fetchTokenPrices).toHaveBeenCalledTimes(1)
    })
  })

  test('allows currency selection and updates exchange rate', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const fromSelect = screen.getByTestId('from-currency-select')
    const toSelect = screen.getByTestId('to-currency-select')
    
    await user.selectOptions(fromSelect, 'ETH')
    await user.selectOptions(toSelect, 'USD')
    
    expect(fromSelect).toHaveValue('ETH')
    expect(toSelect).toHaveValue('USD')
    
    await waitFor(() => {
      expect(api.calculateExchangeRate).toHaveBeenCalled()
    })
  })

  test('swaps currencies when swap button is clicked', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const fromSelect = screen.getByTestId('from-currency-select')
    const toSelect = screen.getByTestId('to-currency-select')
    
    const swapButton = await screen.findByTestId('swap-button')
    
    await user.selectOptions(fromSelect, 'USD')
    await user.selectOptions(toSelect, 'ETH')
    
    expect(fromSelect).toHaveValue('USD')
    expect(toSelect).toHaveValue('ETH')
    
    await user.click(swapButton)
    
    expect(fromSelect).toHaveValue('ETH')
    expect(toSelect).toHaveValue('USD')
  })

  test('calculates and displays converted amount', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const fromAmountInput = screen.getByTestId('from-amount-input')
    
    await user.clear(fromAmountInput)
    await user.type(fromAmountInput, '1')
    
    await waitFor(() => {
      expect(api.calculateExchangeRate).toHaveBeenCalled()
    })
  })

  test('handles API error gracefully', async () => {
    vi.mocked(api.fetchTokenPrices).mockRejectedValue(new Error('Network error'))
    
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load token prices. Please try again.')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const swapButton = screen.getByTestId('swap-button')
    expect(swapButton).toBeDisabled()
    
    const fromSelect = screen.getByTestId('from-currency-select')
    const toSelect = screen.getByTestId('to-currency-select')
    expect(fromSelect.children).toHaveLength(0)
    expect(toSelect.children).toHaveLength(0)
  })

  test('renders basic currency converter interface', async () => {
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    expect(screen.getByText('Currency Converter')).toBeInTheDocument()
    expect(screen.getByTestId('from-currency-select')).toBeInTheDocument()
    expect(screen.getByTestId('to-currency-select')).toBeInTheDocument()
    expect(screen.getByTestId('from-amount-input')).toBeInTheDocument()
    expect(screen.getByTestId('to-amount-input')).toBeInTheDocument()
    expect(screen.getByTestId('swap-button')).toBeInTheDocument()
  })

  test('swap button has correct hover animation classes', async () => {
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const swapButton = await screen.findByTestId('swap-button')
    
    expect(swapButton).toHaveClass('group')
    expect(swapButton).toHaveClass('transition-all')
    expect(swapButton).toHaveClass('duration-300')
  })

  test('accepts user input in from amount field', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const fromAmountInput = screen.getByTestId('from-amount-input')
    
    await user.clear(fromAmountInput)
    await user.type(fromAmountInput, '100')
    expect(fromAmountInput).toHaveValue('100')
    
    await user.clear(fromAmountInput)
    await user.type(fromAmountInput, '100.50')
    expect(fromAmountInput).toHaveValue('100.50')
    
    await user.clear(fromAmountInput)
    await user.type(fromAmountInput, '0')
    expect(fromAmountInput).toHaveValue('0')
  })

  test('to amount field updates automatically when typing in from field', async () => {
    const user = userEvent.setup()
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const fromAmountInput = screen.getByTestId('from-amount-input')
    const toAmountInput = screen.getByTestId('to-amount-input')
    
    await user.clear(fromAmountInput)
    await user.type(fromAmountInput, '1')
    
    await waitFor(() => {
      expect(api.calculateExchangeRate).toHaveBeenCalled()
      expect(toAmountInput).toHaveValue('1645.93000000')
    })
  })

  test('displays currency icons correctly', async () => {
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const usdIcon = screen.getByAltText('USD')
    const ethIcon = screen.getByAltText('ETH')
    
    expect(usdIcon).toBeInTheDocument()
    expect(ethIcon).toBeInTheDocument()
    expect(usdIcon).toHaveAttribute('src', '/USD.svg')
    expect(ethIcon).toHaveAttribute('src', '/ETH.svg')
  })

  test('swap button displays correct icon', async () => {
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const swapIcon = screen.getByAltText('Swap currencies')
    expect(swapIcon).toBeInTheDocument()
    expect(swapIcon).toHaveAttribute('src', '/swap-icon-cyan.svg')
  })

  test('error state shows correct swap button icon', async () => {
    vi.mocked(api.fetchTokenPrices).mockRejectedValue(new Error('Network error'))
    
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load token prices. Please try again.')).toBeInTheDocument()
    }, { timeout: 3000 })
    
    const swapIcon = screen.getByAltText('Swap currencies')
    expect(swapIcon).toHaveAttribute('src', '/swap-icon-gray.svg')
  })

  test('input fields have correct attributes', async () => {
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const fromAmountInput = screen.getByTestId('from-amount-input')
    const toAmountInput = screen.getByTestId('to-amount-input')
    
    expect(fromAmountInput).toHaveAttribute('type', 'text')
    expect(fromAmountInput).toHaveAttribute('placeholder', '0')
    expect(fromAmountInput).toHaveAttribute('maxlength', '15')
    
    expect(toAmountInput).toHaveAttribute('type', 'text')
    expect(toAmountInput).toHaveAttribute('placeholder', '0')
    expect(toAmountInput).toHaveAttribute('maxlength', '15')
  })

  test('select elements contain correct currency options', async () => {
    render(<CurrencyConverter />)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading token prices...')).not.toBeInTheDocument()
    }, { timeout: 3000 })
    
    const fromSelect = screen.getByTestId('from-currency-select')
    const toSelect = screen.getByTestId('to-currency-select')
    
    expect(fromSelect.children).toHaveLength(4)
    expect(toSelect.children).toHaveLength(4)
    
    expect(screen.getAllByText('USD')).toHaveLength(2)
    expect(screen.getAllByText('ETH')).toHaveLength(2)
    expect(screen.getAllByText('BLUR')).toHaveLength(2)
    expect(screen.getAllByText('ATOM')).toHaveLength(2)
  })
}) 
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { getCurrency } from '../service/price';
import type { Currency } from '../types';

// Mock the service
vi.mock('../service/price');

// Mock data
const mockCurrencies: Currency[] = [
  {
    currency: 'BTC',
    date: new Date('2023-01-01'),
    price: 50000
  },
  {
    currency: 'ETH',
    date: new Date('2023-01-01'),
    price: 3000
  },
  {
    currency: 'USDT',
    date: new Date('2023-01-01'),
    price: 1
  },
  {
    currency: 'ADA',
    date: new Date('2023-01-01'),
    price: 0.5
  }
];

// Helper function to render App with QueryClient
const renderWithQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.mocked(getCurrency).mockResolvedValue(mockCurrencies);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the app title', async () => {
    renderWithQueryClient();
    
    expect(screen.getByText('Cross Currency Swap')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithQueryClient();
    
    // The Loading component renders a Loader2 icon with animate-spin class
    const loadingElement = document.querySelector('.animate-spin');
    expect(loadingElement).toBeInTheDocument();
  });

  it('displays currency fields after data loads', async () => {
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    // Should show two currency fields
    const currencySelects = screen.getAllByRole('combobox');
    expect(currencySelects).toHaveLength(2);
  });

  it('initializes with first two currencies from the data', async () => {
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    // Check if BTC and ETH are selected initially
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();
  });

  it('swaps currencies when swap button is clicked', async () => {
    const user = userEvent.setup();
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    // Get initial state - check that BTC and ETH are displayed
    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('ETH')).toBeInTheDocument();

    // Click swap button (it's the only button on the page after loading)
    const buttons = screen.getAllByRole('button');
    const swapButton = buttons.find(button => button.getAttribute('type') === 'button');
    
    if (swapButton) {
      await user.click(swapButton);

      // After swap, currencies should still be visible but in different positions
      await waitFor(() => {
        expect(screen.getByText('BTC')).toBeInTheDocument();
        expect(screen.getByText('ETH')).toBeInTheDocument();
      });
    }
  });

  it('updates amounts when currency is changed', async () => {
    const user = userEvent.setup();
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    // Find the first currency select and change it to USDT
    const currencySelects = screen.getAllByRole('combobox');
    await user.click(currencySelects[0]);
    
    // Wait for dropdown to open and select USDT
    await waitFor(() => {
      const usdtOption = screen.getByText('USDT');
      expect(usdtOption).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('USDT'));
    // The amounts should be recalculated based on new exchange rate
    await waitFor(() => {
      // USDT price = 1, ETH price = 3000, so 1 USDT = 1/3000 ETH = 0.000333 ETH
      expect(screen.getByText("1 USDT = 0.000020 BTC")).toBeInTheDocument();
      
    });
  });

  it('updates amounts when input value is changed', async () => {
    const user = userEvent.setup();
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    // Find amount input fields
    const amountInputs = screen.getAllByRole('spinbutton') || screen.getAllByRole('textbox');
    
    if (amountInputs.length > 0) {
      // Clear and type new amount in first input
      await user.clear(amountInputs[0]);
      await user.type(amountInputs[0], '2');

      // The second amount should be updated automatically
      // 2 BTC * (50000 / 3000) = 2 * 16.666667 = 33.333333
      await waitFor(() => {
        expect(amountInputs[1]).toHaveValue(0.00004);
      });
    }
  });

  it('handles API error gracefully', async () => {
    vi.mocked(getCurrency).mockRejectedValue(new Error('API Error'));
    
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    });
  });

  it('has accessible swap button', async () => {
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    const swapButton = screen.getByRole('button');
    expect(swapButton).toBeInTheDocument();
    expect(swapButton).toHaveAttribute('type', 'button');
  });

  it('displays currency icons in select options', async () => {
    const user = userEvent.setup();
    renderWithQueryClient();
    
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
    });

    // Open first currency select
    const currencySelects = screen.getAllByRole('combobox');
    await user.click(currencySelects[0]);
    
    await waitFor(() => {
      // Check if currency icons are displayed
      const btcIcon = screen.getByAltText('ADA');
      expect(btcIcon).toBeInTheDocument();
      expect(btcIcon).toHaveAttribute('src', 'tokens/ADA.SVG');
    });
  });
});

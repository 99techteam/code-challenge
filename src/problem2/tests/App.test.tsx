import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const prices = [
  { currency: 'ETH', price: 2000, date: '2023-08-29' },
  { currency: 'USDC', price: 1, date: '2023-08-29' },
  { currency: 'ATOM', price: 10, date: '2023-08-29' },
  { currency: 'ZERO', price: 0, date: '2023-08-29' },
  { currency: 'MISSING', date: '2023-08-29' },
];

beforeEach(() =>
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => prices }),
  ),
);

async function setup() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole('button', { name: 'You pay: ETH. Select token' });
  return user;
}

describe('swap interactions', () => {
  it('keeps a fallback token unchanged when the user selects the same token', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => prices.filter((token) => token.currency !== 'USDC'),
    } as Response);
    const user = await setup();
    await user.click(
      screen.getByRole('button', { name: 'You pay: ETH. Select token' }),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Select ATOM, Cosmos',
      }),
    );
    expect(
      screen.getByRole('button', { name: 'You receive: ATOM. Select token' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Choose two different tokens to swap.'),
    ).toBeInTheDocument();
  });

  it('preserves the exact input string and calculates the receive amount', async () => {
    const user = await setup();
    const input = screen.getByLabelText('You pay');
    await user.type(input, '0.00');
    expect(input).toHaveValue('0.00');
    await user.clear(input);
    await user.type(input, '1.2300');
    expect(input).toHaveValue('1.2300');
    expect(screen.getByLabelText('You receive')).toHaveTextContent('2,460');
    expect(screen.getByRole('button', { name: 'Review swap' })).toBeEnabled();
  });

  it('filters unpriced tokens out of the picker and selects a search result', async () => {
    const user = await setup();
    await user.click(
      screen.getByRole('button', { name: 'You receive: USDC. Select token' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'Select a token' });
    expect(within(dialog).queryByText('ZERO')).not.toBeInTheDocument();
    expect(within(dialog).queryByText('MISSING')).not.toBeInTheDocument();
    await user.type(within(dialog).getByRole('searchbox'), 'cosmos');
    await user.click(within(dialog).getByRole('button', { name: /ATOM/ }));
    expect(
      screen.getByRole('button', { name: 'You receive: ATOM. Select token' }),
    ).toBeInTheDocument();
  });

  it('shows same-token validation without changing the other token', async () => {
    const user = await setup();
    await user.type(screen.getByLabelText('You pay'), '1');
    await user.click(
      screen.getByRole('button', { name: 'You receive: USDC. Select token' }),
    );
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Select ETH, Ethereum',
      }),
    );
    expect(
      screen.getByRole('button', { name: 'You pay: ETH. Select token' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Choose two different tokens to swap.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Choose different tokens' }),
    ).toBeDisabled();
  });

  it('reverses the pair while preserving the input string', async () => {
    const user = await setup();
    await user.type(screen.getByLabelText('You pay'), '2.00');
    await user.click(
      screen.getByRole('button', { name: 'Reverse swap direction' }),
    );
    expect(
      screen.getByRole('button', { name: 'You pay: USDC. Select token' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'You receive: ETH. Select token' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('You pay')).toHaveValue('2.00');
    expect(screen.getByLabelText('You receive')).toHaveTextContent('0.001');
  });

  it('reviews and confirms a demo swap', async () => {
    const user = await setup();
    await user.type(screen.getByLabelText('You pay'), '1');
    await user.click(screen.getByRole('button', { name: 'Review swap' }));
    expect(
      screen.getByRole('dialog', { name: 'Review swap' }),
    ).toHaveTextContent('2,000');
    await user.click(screen.getByRole('button', { name: 'Confirm demo swap' }));
    expect(
      screen.getByRole('heading', { name: 'Demo swap complete' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('offers explicit retry after a fetch failure', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('offline'));
    const user = userEvent.setup();
    render(<App />);
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    expect(
      await screen.findByRole('button', { name: 'You pay: ETH. Select token' }),
    ).toBeEnabled();
  });
});

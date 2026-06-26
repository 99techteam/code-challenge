import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SwapForm } from './SwapForm';
import type { Token } from '../types';

// Deterministic tokens so the rate is predictable: rate = 10 / 2 = 5.
// Neither symbol is in INITIAL_BALANCES, so both start at DEFAULT_BALANCE (1,000).
const tokens: Token[] = [
  { symbol: 'AAA', price: 10, icon: 'about:blank' },
  { symbol: 'BBB', price: 2, icon: 'about:blank' },
];

const payInput = () => screen.getByLabelText('You pay') as HTMLInputElement;
const receiveInput = () =>
  screen.getByLabelText('You receive') as HTMLInputElement;

describe('SwapForm', () => {
  it('renders with the submit button disabled until an amount is entered', () => {
    render(<SwapForm tokens={tokens} />);
    const submit = screen.getByRole('button', { name: /enter an amount/i });
    expect(submit).toBeDisabled();
  });

  it('computes the received amount from the exchange rate', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), '3');

    expect(receiveInput().value).toBe('15'); // 3 * (10 / 2)
    expect(
      screen.getByRole('button', { name: /confirm swap/i }),
    ).toBeEnabled();
  });

  it('shows an insufficient-balance error and blocks submit', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), '999999'); // well above the 1,000 AAA balance

    expect(screen.getByText(/insufficient aaa balance/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirm swap/i }),
    ).toBeDisabled();
  });

  it('rejects non-numeric input entirely', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), 'abc');

    expect(payInput().value).toBe(''); // input guard strips it
  });

  it('caps the number of decimal places at 8', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), '1.123456789'); // 9 decimals attempted
    expect(payInput().value).toBe('1.12345678'); // 9th decimal rejected
  });

  it('caps the total input length at 20 characters', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), '1'.repeat(30));
    expect(payInput().value).toHaveLength(20);
  });

  it('flips the tokens while keeping the typed amount (Binance-style)', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), '3'); // paying 3 AAA -> receive 15 BBB
    await user.click(screen.getByRole('button', { name: /switch direction/i }));

    // Tokens swap, but the typed amount stays as the source of truth...
    expect(payInput().value).toBe('3');
    expect(
      screen.getByRole('button', { name: 'Pay token: BBB' }),
    ).toBeInTheDocument();
    // ...and the receive side recomputes: 3 BBB * (2 / 10) = 0.6 AAA.
    expect(receiveInput().value).toBe('0.6');
  });

  it('runs the simulated swap: loading then success', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), '3');
    await user.click(screen.getByRole('button', { name: /confirm swap/i }));

    // Immediately enters the loading state...
    expect(screen.getByRole('button', { name: /swapping/i })).toBeDisabled();

    // ...then resolves to success after the simulated ~1.6s round-trip.
    expect(
      await screen.findByRole(
        'button',
        { name: /swap complete/i },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();

    // A success toast appears with a receipt of the trade (3 AAA -> 15 BBB).
    const toast = await screen.findByRole('status');
    expect(toast).toHaveTextContent('Swap complete');
    expect(toast).toHaveTextContent('3 AAA');
    expect(toast).toHaveTextContent('15 BBB');
  });

  it('dismisses the success toast when its close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.type(payInput(), '3');
    await user.click(screen.getByRole('button', { name: /confirm swap/i }));

    // The toast (and its dismiss button) appears after the ~1.6s swap delay.
    const dismiss = await screen.findByRole(
      'button',
      { name: /dismiss/i },
      { timeout: 3000 },
    );
    await user.click(dismiss);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('debits and credits the wallet after a successful swap', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    // AAA and BBB aren't in INITIAL_BALANCES, so both start at DEFAULT_BALANCE (1,000).
    expect(screen.getByText(/Balance: 1,000 AAA/)).toBeInTheDocument();

    await user.type(payInput(), '3'); // pay 3 AAA -> receive 15 BBB
    await user.click(screen.getByRole('button', { name: /confirm swap/i }));

    // After settling, AAA is debited 3 -> 997.
    expect(
      await screen.findByText(/Balance: 997 AAA/, undefined, { timeout: 3000 }),
    ).toBeInTheDocument();

    // Flip to view BBB, which was credited 15 -> 1,015.
    await user.click(screen.getByRole('button', { name: /switch direction/i }));
    expect(screen.getByText(/Balance: 1,015 BBB/)).toBeInTheDocument();
  });

  it('fills the input with the full balance via the Max button', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    await user.click(screen.getByRole('button', { name: /^max$/i }));

    // AAA starts at DEFAULT_BALANCE (1,000), so the input is filled with it.
    expect(payInput().value).toBe('1000');
  });

  it('shows Clear only when there is input and resets the field', async () => {
    const user = userEvent.setup();
    render(<SwapForm tokens={tokens} />);

    // Hidden while the field is empty.
    expect(
      screen.queryByRole('button', { name: /clear/i }),
    ).not.toBeInTheDocument();

    await user.type(payInput(), '3');
    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(payInput().value).toBe('');
    // ...and it disappears again once cleared.
    expect(
      screen.queryByRole('button', { name: /clear/i }),
    ).not.toBeInTheDocument();
  });
});

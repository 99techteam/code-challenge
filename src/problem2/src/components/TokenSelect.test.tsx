import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TokenSelect } from '@/components/TokenSelect';
import type { Token } from '@/types';

const token = (code: string, name: string): Token => ({
  code,
  name,
  price: 1,
  decimals: 2,
  iconUrl: 'about:blank',
});

const TOKENS = [
  token('ETH', 'Ethereum'),
  token('USDC', 'USD Coin'),
  token('WBTC', 'Wrapped Bitcoin'),
];

const field = () => screen.getByPlaceholderText('Search asset or ticker');
const options = () => screen.getAllByRole('option');

/** Render the picker and open its menu. */
async function openMenu() {
  const user = userEvent.setup();
  render(<TokenSelect side="from" value={TOKENS[0]!} tokens={TOKENS} onSelect={vi.fn()} />);

  await user.click(screen.getByRole('button', { name: 'Convert from — ETH' }));
  await screen.findByPlaceholderText('Search asset or ticker');

  return user;
}

/**
 * Type without yielding to the event loop, so the assertions that follow are
 * guaranteed to run before the debounce timer can fire. `userEvent` awaits
 * between keystrokes, which would let it.
 */
function typeInstantly(value: string) {
  fireEvent.change(field(), { target: { value } });
}

describe('TokenSelect search', () => {
  it('shows what was typed at once, and filters a beat later', async () => {
    await openMenu();

    typeInstantly('bit');

    // The field is never held back — only the list it drives is.
    expect(field()).toHaveValue('bit');
    expect(options()).toHaveLength(3);

    await waitFor(() => expect(options()).toHaveLength(1));
    expect(screen.getByRole('option')).toHaveTextContent('WBTC');
  });

  it('does not re-filter for a keystroke that is still being followed by others', async () => {
    await openMenu();

    // Three keystrokes in a row, each one resetting the wait. The list is the
    // full one throughout: it settles once, on what was typed last.
    for (const prefix of ['b', 'bi', 'bit']) {
      typeInstantly(prefix);
      expect(options()).toHaveLength(3);
    }

    await waitFor(() => expect(options()).toHaveLength(1));
  });

  it('snaps back to the full list the moment the field is cleared', async () => {
    await openMenu();

    typeInstantly('bit');
    await waitFor(() => expect(options()).toHaveLength(1));

    // Clearing is the one change that does not wait: the whole list is already
    // in hand, so there is nothing to spare the user by holding it back.
    typeInstantly('');
    expect(options()).toHaveLength(3);
  });

  it('says so when nothing matches', async () => {
    await openMenu();

    typeInstantly('dogecoin');

    expect(await screen.findByText('No asset matches that search.')).toBeInTheDocument();
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  it('reopens on the whole list, not on the last search', async () => {
    const user = await openMenu();

    typeInstantly('bit');
    await waitFor(() => expect(options()).toHaveLength(1));

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Convert from — ETH' }));

    expect(field()).toHaveValue('');
    expect(options()).toHaveLength(3);
  });
});

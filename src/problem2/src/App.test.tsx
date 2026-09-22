import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '@/App';
import { http } from '@/lib/http';

// The seam is the app's own client, so a test says what the server answered and
// everything above it — the axios error mapping, normalising, the query cache,
// the card — is the real thing.
vi.mock('@/lib/http', () => ({ http: { get: vi.fn() } }));

const getMock = vi.mocked(http.get);

const FEED = [
  { currency: 'ETH', date: '2023-08-29T07:10:52.000Z', price: 1600 },
  { currency: 'USDC', date: '2023-08-29T07:10:40.000Z', price: 1 },
  { currency: 'WBTC', date: '2023-08-29T07:10:52.000Z', price: 26_000 },
];

/** Answer the next requests with `payload`, the way a 200 does. */
function respondWith(payload: unknown) {
  getMock.mockResolvedValue({ data: payload });
}

/** How axios reports a response the server refused to make a feed out of. */
function responseError(status: number) {
  const error = new AxiosError('Request failed', AxiosError.ERR_BAD_RESPONSE);
  error.response = { status } as AxiosResponse;

  return error;
}

/** How axios reports never having reached the server at all. */
function networkError() {
  return new AxiosError('Network Error', AxiosError.ERR_NETWORK);
}

/** Render and wait for the first quote to land. */
async function renderApp() {
  render(<App />);
  expect(await screen.findByDisplayValue('2,000.00')).toBeInTheDocument();
}

beforeEach(() => {
  getMock.mockReset();
  respondWith(FEED);
});

describe('Facet converter', () => {
  it('quotes the opening pair once prices load', async () => {
    await renderApp();

    expect(screen.getByLabelText('From amount')).toHaveValue('1.25');
    expect(screen.getByRole('button', { name: 'Convert from — ETH' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to — USDC' })).toBeInTheDocument();
    expect(screen.getByText('1 ETH = 1,600.00 USDC')).toBeInTheDocument();
  });

  it('converts as the user types into either field', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.clear(screen.getByLabelText('From amount'));
    await user.type(screen.getByLabelText('From amount'), '3');
    expect(screen.getByLabelText('To amount')).toHaveValue('4,800.00');

    await user.clear(screen.getByLabelText('To amount'));
    await user.type(screen.getByLabelText('To amount'), '160');
    expect(screen.getByLabelText('From amount')).toHaveValue('0.10000');
  });

  it('swaps the two sides', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole('button', { name: 'Swap currencies' }));

    expect(screen.getByRole('button', { name: 'Convert from — USDC' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert to — ETH' })).toBeInTheDocument();
    expect(screen.getByLabelText('From amount')).toHaveValue('2,000.00');
    expect(screen.getByLabelText('To amount')).toHaveValue('1.25');
  });

  it('reports an amount that cannot be converted', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.clear(screen.getByLabelText('From amount'));
    await user.type(screen.getByLabelText('From amount'), '0');

    // Validation settles a tick after the keystroke, so wait for the message.
    expect(await screen.findByRole('alert')).toHaveTextContent('Amount must be more than zero');
    expect(screen.getByLabelText('From amount')).toHaveAttribute('aria-invalid', 'true');
  });

  it('flags the field the bad amount was typed into', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.clear(screen.getByLabelText('To amount'));
    await user.type(screen.getByLabelText('To amount'), '0');

    expect(await screen.findByRole('alert')).toHaveTextContent('Amount must be more than zero');
    expect(screen.getByLabelText('To amount')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('From amount')).not.toHaveAttribute('aria-invalid');
  });

  it('picks a different asset from the searchable menu', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole('button', { name: 'Convert from — ETH' }));
    await user.type(await screen.findByPlaceholderText('Search asset or ticker'), 'wrapped');

    // The list follows the field a beat behind, once typing stops.
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    await user.click(screen.getByRole('option'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Convert from — WBTC' })).toBeInTheDocument();
    });
    expect(screen.getByText('1 WBTC = 26,000.00 USDC')).toBeInTheDocument();
  });

  it('says so when the price feed is unreachable, and offers a retry', async () => {
    getMock.mockRejectedValue(responseError(503));
    render(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Price feed responded 503');

    respondWith(FEED);
    await userEvent.setup().click(within(alert).getByRole('button', { name: 'Retry' }));

    expect(await screen.findByDisplayValue('2,000.00')).toBeInTheDocument();
  });

  it('rides out a transient failure without bothering the user', async () => {
    // The query retries once before giving up, so a dropped connection costs a
    // few hundred milliseconds rather than an error the user has to act on.
    getMock.mockRejectedValueOnce(networkError());

    await renderApp();

    expect(getMock).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  describe('refresh', () => {
    it('asks the price feed again, uncached', async () => {
      const user = userEvent.setup();
      await renderApp();

      expect(getMock).toHaveBeenCalledTimes(1);

      await user.click(screen.getByRole('button', { name: 'Refresh rates' }));

      await waitFor(() => {
        expect(getMock).toHaveBeenCalledTimes(2);
      });
      // The cache-buster is what keeps the browser from answering this itself.
      expect(getMock).toHaveBeenLastCalledWith(
        'https://interview.switcheo.com/prices.json',
        expect.objectContaining({ params: { t: expect.any(Number) as number } }),
      );
    });

    it('reports when the app last reached the feed', async () => {
      await renderApp();

      const updated = screen.getByText('Updated').parentElement;
      expect(updated).toHaveTextContent('just now');
    });

    it('picks up prices that have moved since the first load', async () => {
      const user = userEvent.setup();
      await renderApp();

      respondWith([
        { currency: 'ETH', date: '2023-08-30T07:10:52.000Z', price: 2000 },
        { currency: 'USDC', date: '2023-08-30T07:10:40.000Z', price: 1 },
      ]);
      await user.click(screen.getByRole('button', { name: 'Refresh rates' }));

      expect(await screen.findByDisplayValue('2,500.00')).toBeInTheDocument();
      expect(screen.getByText('1 ETH = 2,000.00 USDC')).toBeInTheDocument();
    });

    it('keeps the last good prices when a refresh fails', async () => {
      const user = userEvent.setup();
      await renderApp();

      getMock.mockRejectedValue(networkError());
      await user.click(screen.getByRole('button', { name: 'Refresh rates' }));

      const alert = await screen.findByRole('alert');
      expect(alert).toHaveTextContent('Could not refresh — The price feed could not be reached');

      // The converter is still usable on the prices it already has.
      expect(screen.getByLabelText('To amount')).toHaveValue('2,000.00');
      expect(screen.getByRole('button', { name: 'Swap currencies' })).toBeEnabled();
    });
  });
});

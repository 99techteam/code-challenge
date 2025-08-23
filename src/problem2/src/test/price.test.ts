import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCurrency } from '../service/price';
import type { Currency } from '../types';

// Mock ky
vi.mock('ky', () => ({
  default: vi.fn()
}));

import ky from 'ky';

describe('Price Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches and returns currency data successfully', async () => {
    const mockResponse: Currency[] = [
      {
        currency: 'BTC',
        date: new Date('2023-01-01'),
        price: 50000
      },
      {
        currency: 'ETH',
        date: new Date('2023-01-01'),
        price: 3000
      }
    ];

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as unknown as ReturnType<typeof ky>);

    const result = await getCurrency();

    expect(ky).toHaveBeenCalledWith('https://interview.switcheo.com/prices.json');
    expect(result).toEqual(mockResponse);
  });

  it('filters out currencies with no price', async () => {
    const mockResponse: Currency[] = [
      {
        currency: 'BTC',
        date: new Date('2023-01-01'),
        price: 50000
      },
      {
        currency: 'ETH',
        date: new Date('2023-01-01'),
        price: 0 // Should be filtered out
      },
      {
        currency: 'USDT',
        date: new Date('2023-01-01'),
        price: 1
      },
      {
        currency: '',
        date: new Date('2023-01-01'),
        price: null as unknown as number // Should be filtered out
      }
    ];

    const expectedResult: Currency[] = [
      {
        currency: 'BTC',
        date: new Date('2023-01-01'),
        price: 50000
      },
      {
        currency: 'USDT',
        date: new Date('2023-01-01'),
        price: 1
      }
    ];

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as unknown as ReturnType<typeof ky>);

    const result = await getCurrency();

    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(2);
  });

  it('removes duplicate currencies', async () => {
    const mockResponse: Currency[] = [
      {
        currency: 'BTC',
        date: new Date('2023-01-02'),
        price: 51000
      },
      {
        currency: 'BTC',
        date: new Date('2023-01-01'),
        price: 51000
      },
      {
        currency: 'ETH',
        date: new Date('2023-01-01'),
        price: 3000
      },
    ];

    const expectedResult: Currency[] = [
      {
        currency: 'BTC',
        date: new Date('2023-01-01'),
        price: 51000
      },
      {
        currency: 'ETH',
        date: new Date('2023-01-01'),
        price: 3000
      },
    ];

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as unknown as ReturnType<typeof ky>);

    const result = await getCurrency();

    expect(result).toEqual(expectedResult);
    expect(result).toHaveLength(2);
    
    // Verify BTC has the latest price
    const btcEntry = result.find(c => c.currency === 'BTC');
    expect(btcEntry?.price).toBe(51000);
  });

  it('handles empty response array', async () => {
    const mockResponse: Currency[] = [];

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as unknown as ReturnType<typeof ky>);

    const result = await getCurrency();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });


  it('handles network errors', async () => {
    const networkError = new Error('Network error');

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockRejectedValue(networkError)
    } as unknown as ReturnType<typeof ky>);

    await expect(getCurrency()).rejects.toThrow('Network error');
  });

  it('handles JSON parsing errors', async () => {
    const jsonError = new Error('Invalid JSON');

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockRejectedValue(jsonError)
    } as unknown as ReturnType<typeof ky>);

    await expect(getCurrency()).rejects.toThrow('Invalid JSON');
  });

  it('preserves currency data structure', async () => {
    const mockResponse: Currency[] = [
      {
        currency: 'BTC',
        date: new Date('2023-01-01T10:00:00Z'),
        price: 50000.123456
      }
    ];

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as unknown as ReturnType<typeof ky>);

    const result = await getCurrency();

    expect(result[0]).toEqual({
      currency: 'BTC',
      date: new Date('2023-01-01T10:00:00Z'),
      price: 50000.123456
    });
    
    // Verify data types
    expect(typeof result[0].currency).toBe('string');
    expect(result[0].date).toBeInstanceOf(Date);
    expect(typeof result[0].price).toBe('number');
  });


  it('calls the correct API endpoint', async () => {
    const mockResponse: Currency[] = [];

    vi.mocked(ky).mockReturnValue({
      json: vi.fn().mockResolvedValue(mockResponse)
    } as unknown as ReturnType<typeof ky>);

    await getCurrency();

    expect(ky).toHaveBeenCalledTimes(1);
    expect(ky).toHaveBeenCalledWith('https://interview.switcheo.com/prices.json');
  });

});

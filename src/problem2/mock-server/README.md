# Mock Server

A mock API server using json-server for development and testing.

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The server will run on `http://localhost:5005`

## Example Endpoints

- **GET** `/coin`: Returns a list of cryptocurrency price data.
  
  Example: `http://localhost:5005/coin`

### Search and Filter Examples

- **GET** `/coin?q=keyword`: Full-text search across all fields.

  Example: `http://localhost:5005/coin?q=ETH`  
  (Returns records that contain "ETH" in any field.)

- **GET** `/coin?currency_like=USD`: Search specific fields using `_like` for partial matches.

  Example: `http://localhost:5005/coin?currency_like=USD`  
  (Returns records where the `currency` contains "USD".)

- **GET** `/coin?price_gte=1000`: Filter by price greater than or equal to value.

  Example: `http://localhost:5005/coin?price_gte=1000`  
  (Returns records with price >= 1000.)

- **GET** `/coin?price_lte=1`: Filter by price less than or equal to value.

  Example: `http://localhost:5005/coin?price_lte=1`  
  (Returns records with price <= 1.)

- **GET** `/coin?currency=ETH`: Exact match filter.

  Example: `http://localhost:5005/coin?currency=ETH`  
  (Returns only ETH records.)

### Sorting Examples

- **GET** `/coin?_sort=price&_order=asc`: Sort by price in ascending order.

  Example: `http://localhost:5005/coin?_sort=price&_order=asc`  
  (Returns records sorted by `price` in ascending order.)

- **GET** `/coin?_sort=price&_order=desc`: Sort by price in descending order.

  Example: `http://localhost:5005/coin?_sort=price&_order=desc`  
  (Returns records sorted by `price` in descending order.)

- **GET** `/coin?_sort=date&_order=desc`: Sort by date in descending order.

  Example: `http://localhost:5005/coin?_sort=date&_order=desc`  
  (Returns records sorted by `date` in descending order.)

- **GET** `/coin?_sort=currency&_order=asc`: Sort by currency name alphabetically.

  Example: `http://localhost:5005/coin?_sort=currency&_order=asc`  
  (Returns records sorted by `currency` alphabetically.)

### Pagination Examples

- **GET** `/coin?_limit=10`: Limit results to 10 records.

  Example: `http://localhost:5005/coin?_limit=10`  
  (Returns only the first 10 records.)

- **GET** `/coin?_start=10&_end=20`: Get records from position 10 to 20.

  Example: `http://localhost:5005/coin?_start=10&_end=20`  
  (Returns records 11-20.)

### Combined Examples

- **GET** `/coin?currency_like=USD&_sort=price&_order=desc&_limit=5`: Complex query.

  Example: `http://localhost:5005/coin?currency_like=USD&_sort=price&_order=desc&_limit=5`  
  (Returns top 5 USD-related records sorted by price descending.)

- **GET** `/coin?price_gte=100&price_lte=1000&_sort=date&_order=desc`: Price range with date sorting.

  Example: `http://localhost:5005/coin?price_gte=100&price_lte=1000&_sort=date&_order=desc`  
  (Returns records with price between 100-1000, sorted by date descending.)

## Data Structure

Each record contains:
- `currency`: Cryptocurrency symbol (e.g., "ETH", "BTC", "USDC")
- `date`: Timestamp of the price data
- `price`: Current price value

## Example Usage with Axios

```typescript
import axios from 'axios';

// Get all cryptocurrency data
const getAllData = async () => {
  const response = await axios.get('http://localhost:5005/coin');
  return response.data;
};

// Search for specific currency
const searchCurrency = async (query) => {
  const response = await axios.get(`http://localhost:5005/coin?q=${query}`);
  return response.data;
};

// Get top 10 highest priced currencies
const getTopPriced = async () => {
  const response = await axios.get('http://localhost:5005/coin?_sort=price&_order=desc&_limit=10');
  return response.data;
};

// Get all USD-related currencies
const getUSDCurrencies = async () => {
  const response = await axios.get('http://localhost:5005/coin?currency_like=USD');
  return response.data;
};
``` 
# CryptoSwap

A full-stack cryptocurrency token swap application built with NestJS and React. This application allows users to register, manage multiple token balances, swap between different cryptocurrencies, and transfer tokens to other users.

## Tech Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database management
- **SQLite** - Lightweight database
- **JWT** - Authentication using JSON Web Tokens
- **Passport** - Authentication middleware
- **bcrypt** - Password hashing
- **ethers.js** - Ethereum wallet utilities

### Frontend

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

## Prerequisites

- **Node.js**: v22.12.0
- **npm**: >=9.0.0

## Ports

- **Backend**: Runs on port `3001`
- **Frontend**: Runs on port `5173` (default Vite port)

## Features

### Authentication

- User registration with email and password
- Secure login with JWT token authentication
- Password hashing with bcrypt
- Automatic wallet address generation for each user

### Token Management

- View token balances across multiple cryptocurrencies
- Initial balance of 100 USD upon registration
- Real-time balance updates

### Token Swapping

- Swap between different cryptocurrency tokens
- Live exchange rate calculations
- Support for all major cryptocurrencies (BTC, ETH, USDC, etc.)
- Automatic balance adjustment after swaps

### Token Transfers

- Transfer tokens to other users using wallet addresses
- Validation to prevent self-transfers
- Insufficient balance checking
- Transaction confirmation

### User Profile

- View user profile information
- Display wallet address
- Track token holdings

## Pages

The frontend consists of **6 pages**:

1. **Login** - User authentication page
2. **Register** - New user registration
3. **Home** - Main token swap interface
4. **Balances** - View all token balances
5. **Profile** - User profile and wallet information
6. **Transfer** - Transfer tokens to other users

## Installation

### Install All Dependencies

From the root directory, run:

```bash
npm run install:all
```

This will install dependencies for the root project, backend, and frontend.

Alternatively, install individually:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Running the Application

### Development Mode (Recommended)

Run both backend and frontend concurrently from the root directory:

```bash
npm run dev
```

This command starts:

- Backend on `http://localhost:3001`
- Frontend on `http://localhost:5173`

### Run Backend and Frontend Separately

**Backend:**

```bash
npm run dev:backend
# or
cd backend
npm run start:dev
```

**Frontend:**

```bash
npm run dev:frontend
# or
cd frontend
npm run dev
```

## Building for Production

### Build Both Projects

```bash
npm run build
```

### Build Individually

**Backend:**

```bash
npm run build:backend
# or
cd backend
npm run build
```

**Frontend:**

```bash
npm run build:frontend
# or
cd frontend
npm run build
```

## Project Structure

```
cryptoswap/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── dto/            # Data transfer objects
│   │   ├── entities/       # Database entities
│   │   ├── constants/      # Token data and exchange rates
│   │   ├── utils/          # Utility functions
│   │   ├── app.module.ts   # Main app module
│   │   └── main.ts         # Entry point
│   ├── cryptoswap.db       # SQLite database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── data/           # Token data
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── main.tsx        # Entry point
│   ├── public/
│   │   └── tokens/         # Token icons (400+ SVG files)
│   └── package.json
└── package.json            # Root package file
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### User

- `GET /auth/profile` - Get user profile (protected)
- `GET /auth/balances` - Get user token balances (protected)

### Transactions

- `POST /auth/swap` - Swap tokens (protected)
- `POST /auth/transfer` - Transfer tokens to another user (protected)

## Environment Variables

The backend uses the following default configurations:

- Database: `cryptoswap.db` (SQLite)
- Port: `3001`
- JWT Secret: Configured in auth module

## Database

The application uses SQLite for data persistence. The database file (`cryptoswap.db`) is automatically created in the backend directory when you first run the application.

### User Entity

- Email (unique)
- Username
- Password (hashed)
- Wallet Address (auto-generated)
- Token Balances (JSON array)

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- JWT token-based authentication
- Protected routes requiring valid tokens
- CORS enabled for frontend ports (5173, 5174)
- Input validation using class-validator
- Unique wallet address generation per user

## Development Scripts

### Backend

```bash
cd backend
npm run start:dev    # Development mode with watch
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

### Frontend

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Lint code
```

## Author

ThuYainSoe

import { Typography } from '@mui/material'
import './App.css'
import TokenSwap from './pages/SwapForm'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          textAlign: 'center',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #FF37C7, #FF6B9D)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem',
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          fontFamily: 'fantasy'
        }}
      >
        SWAP ANYTIME, ANYWHERE.
      </Typography>
      <TokenSwap />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}

export default App

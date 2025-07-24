import { useContext } from 'react'
import { ThemeContext } from '@/context/theme'

const useTheme = () => {
  const value = useContext(ThemeContext)
  if (typeof value === 'undefined') {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return value
}

export default useTheme

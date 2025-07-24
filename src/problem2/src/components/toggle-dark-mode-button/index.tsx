import Sun from '@/assets/sun.svg?react'
import Moon from '@/assets/moon.svg?react'
import useTheme from '@/hooks/theme'

import './styles.css'

const Icon = () => {
  const { isDarkMode, toggleDarkMode } = useTheme()

  return (
    <div>
      <input
        checked={isDarkMode}
        type="checkbox"
        className="checkbox"
        id="checkbox"
        onChange={toggleDarkMode}
      />
      <label htmlFor="checkbox" className="checkbox-label">
        <Sun className="sun" />
        <Moon className="moon" />
        <span className="ball"></span>
      </label>
    </div>
  )
}

export default Icon

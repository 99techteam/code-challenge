import { useState } from 'react'
import { getTokenIconUrl } from '../utils/tokenIcon'
import { TokenImageProps } from '../models/component'

const TokenImage = ({ symbol }: TokenImageProps) => {
  const [imageError, setImageError] = useState<boolean>(false)
  const imageUrl = getTokenIconUrl(symbol)

  if (imageError) {
    return (
      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-xs">
        {symbol.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={symbol}
      className="w-6 h-6 rounded-full object-cover"
      onError={() => setImageError(true)}
    />
  )
}

export default TokenImage


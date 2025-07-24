import BlurIcon from '@/assets/tokens/blur.svg?react'
import BneoIcon from '@/assets/tokens/bneo.svg?react'
import BusdIcon from '@/assets/tokens/busd.svg?react'
import UsdIcon from '@/assets/tokens/usd.svg?react'
import EthIcon from '@/assets/tokens/eth.svg?react'
import GmxIcon from '@/assets/tokens/gmx.svg?react'
import StevmosIcon from '@/assets/tokens/stevmos.svg?react'
import LunaIcon from '@/assets/tokens/luna.svg?react'
import RatomIcon from '@/assets/tokens/ratom.svg?react'
import StrdIcon from '@/assets/tokens/strd.svg?react'
import EvmosIcon from '@/assets/tokens/evmos.svg?react'
import IbcxIcon from '@/assets/tokens/ibcx.svg?react'
import IrisIcon from '@/assets/tokens/iris.svg?react'
import AmplunaIcon from '@/assets/tokens/ampluna.svg?react'
import KujiIcon from '@/assets/tokens/kuji.svg?react'
import StosmoIcon from '@/assets/tokens/stosmo.svg?react'
import UsdcIcon from '@/assets/tokens/usdc.svg?react'
import AxlusdcIcon from '@/assets/tokens/axlusdc.svg?react'
import AtomIcon from '@/assets/tokens/atom.svg?react'
import Default from '@/assets/tokens/coin.svg?react'

export const DECIMAL = 10

export const LOWEST_PRIORITY = -99

export const Token = {
  blur: 'blur',
  bneo: 'bneo',
  busd: 'busd',
  usd: 'usd',
  eth: 'eth',
  gmx: 'gmx',
  stevmos: 'stevmos',
  luna: 'luna',
  ratom: 'ratom',
  strd: 'strd',
  evmos: 'evmos',
  ibcx: 'ibcx',
  iris: 'iris',
  ampluna: 'ampluna',
  kuji: 'kuji',
  stosmo: 'stosmo',
  usdc: 'usdc',
  axlusdc: 'axlusdc',
  atom: 'atom',
} as const

export const DefaultIcon = <Default />

// eslint-disable-next-line react-refresh/only-export-components
export const TokenMap: Record<string, { icon: React.ReactNode; priority: number }> = {
  [Token.usd]: { icon: <UsdIcon />, priority: 1 },
  [Token.eth]: { icon: <EthIcon />, priority: 2 },
  [Token.usdc]: { icon: <UsdcIcon />, priority: 3 },
  [Token.axlusdc]: { icon: <AxlusdcIcon />, priority: 4 },
  [Token.atom]: { icon: <AtomIcon />, priority: 5 },
  [Token.blur]: { icon: <BlurIcon />, priority: 6 },
  [Token.bneo]: { icon: <BneoIcon />, priority: 7 },
  [Token.busd]: { icon: <BusdIcon />, priority: 8 },
  [Token.gmx]: { icon: <GmxIcon />, priority: 9 },
  [Token.stevmos]: { icon: <StevmosIcon />, priority: 10 },
  [Token.luna]: { icon: <LunaIcon />, priority: 11 },
  [Token.ratom]: { icon: <RatomIcon />, priority: 12 },
  [Token.strd]: { icon: <StrdIcon />, priority: 13 },
  [Token.evmos]: { icon: <EvmosIcon />, priority: 14 },
  [Token.ibcx]: { icon: <IbcxIcon />, priority: 15 },
  [Token.iris]: { icon: <IrisIcon />, priority: 16 },
  [Token.ampluna]: { icon: <AmplunaIcon />, priority: 17 },
  [Token.kuji]: { icon: <KujiIcon />, priority: 18 },
  [Token.stosmo]: { icon: <StosmoIcon />, priority: 19 },
}

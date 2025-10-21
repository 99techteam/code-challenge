import classnames from 'classnames';

import AmplunaIcon from './svgs/ampluna.svg';
import AtomIcon from './svgs/atom.svg';
import AxlusdcIcon from './svgs/axlusdc.svg';
import BlurIcon from './svgs/blur.svg';
import BneoIcon from './svgs/bneo.svg';
import BusdIcon from './svgs/busd.svg';
import EthIcon from './svgs/eth.svg';
import EvmosIcon from './svgs/evmos.svg';
import GmxIcon from './svgs/gmx.svg';
import IncxIcon from './svgs/incx.svg';
import IrisIcon from './svgs/iris.svg';
import KujiIcon from './svgs/kuji.svg';
import LsiIcon from './svgs/lsi.svg';
import LunaIcon from './svgs/luna.svg';
import OkbIcon from './svgs/okb.svg';
import OktIcon from './svgs/okt.svg';
import OsmoIcon from './svgs/osmo.svg';
import RatomIcon from './svgs/ratom.svg';
import RswthIcon from './svgs/rswth.svg';
import StatomIcon from './svgs/statom.svg';
import StevmosIcon from './svgs/stevmos.svg';
import StlunaIcon from './svgs/stluna.svg';
import StosmoIcon from './svgs/stosmo.svg';
import StrdIcon from './svgs/strd.svg';
import SwthIcon from './svgs/swth.svg';
import UscIcon from './svgs/usc.svg';
import UsdIcon from './svgs/usd.svg';
import UsdcIcon from './svgs/usdc.svg';
import WbtcIcon from './svgs/wbtc.svg';
import WstethIcon from './svgs/wsteth.svg';
import YieldusdIcon from './svgs/yieldusd.svg';
import ZilIcon from './svgs/zil.svg';

import styles from './style.module.css';

export const ICONS = {
  AMPLUNA: AmplunaIcon,
  ATOM: AtomIcon,
  AXLUSDC: AxlusdcIcon,
  BLUR: BlurIcon,
  BNEO: BneoIcon,
  BUSD: BusdIcon,
  ETH: EthIcon,
  EVMOS: EvmosIcon,
  GMX: GmxIcon,
  IBCX: IncxIcon,
  IRIS: IrisIcon,
  KUJI: KujiIcon,
  LSI: LsiIcon,
  LUNA: LunaIcon,
  OKB: OkbIcon,
  OKT: OktIcon,
  OSMO: OsmoIcon,
  RATOM: RatomIcon,
  RSWTH: RswthIcon,
  STATOM: StatomIcon,
  STEVMOS: StevmosIcon,
  STLUNA: StlunaIcon,
  STOSMO: StosmoIcon,
  STRD: StrdIcon,
  SWTH: SwthIcon,
  USC: UscIcon,
  USD: UsdIcon,
  USDC: UsdcIcon,
  WBTC: WbtcIcon,
  WSTETH: WstethIcon,
  YIELDUSD: YieldusdIcon,
  ZIL: ZilIcon,
};

export enum ICON_NAME {
  AMPLUNA = 'AMPLUNA',
  ATOM = 'ATOM',
  AXLUSDC = 'AXLUSDC',
  BLUR = 'BLUR',
  BNEO = 'BNEO',
  BUSD = 'BUSD',
  ETH = 'ETH',
  EVMOS = 'EVMOS',
  GMX = 'GMX',
  IBCX = 'IBCX',
  IRIS = 'IRIS',
  KUJI = 'KUJI',
  LSI = 'LSI',
  LUNA = 'LUNA',
  OKB = 'OKB',
  OKT = 'OKT',
  OSMO = 'OSMO',
  RATOM = 'RATOM',
  RSWTH = 'RSWTH',
  STATOM = 'STATOM',
  STEVMOS = 'STEVMOS',
  STLUNA = 'STLUNA',
  STOSMO = 'STOSMO',
  STRD = 'STRD',
  SWTH = 'SWTH',
  USC = 'USC',
  USD = 'USD',
  USDC = 'USDC',
  WBTC = 'WBTC',
  WSTETH = 'WSTETH',
  YIELDUSD = 'YIELDUSD',
  ZIL = 'ZIL',
}

interface BaseIconProps {
  name: ICON_NAME;
  size?: 16 | 24 | 32 | 48 | 64 | 128;
}

export const BaseIcon = ({ name, size = 16 }: BaseIconProps) => {
  const iconName = (name || '').toUpperCase() as keyof typeof ICONS;

  return (
    <div className={classnames(styles.container, styles[`size-${size}`])}>
      <img src={ICONS[iconName]} alt={name} />
    </div>
  );
};

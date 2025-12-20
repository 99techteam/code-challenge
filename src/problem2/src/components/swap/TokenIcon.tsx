import AmpLunaIcon from '../../assets/ampLUNA.svg';
import AtomIcon from '../../assets/ATOM.svg';
import AxlUsdcIcon from '../../assets/axlUSDC.svg';
import BlurIcon from '../../assets/BLUR.svg';
import BneoIcon from '../../assets/bNEO.svg';
import BusdIcon from '../../assets/BUSD.svg';
import EthIcon from '../../assets/ETH.svg';
import EvmosIcon from '../../assets/EVMOS.svg';
import GmxIcon from '../../assets/GMX.svg';
import IbcxIcon from '../../assets/IBCX.svg';
import IrisIcon from '../../assets/IRIS.svg';
import KujiIcon from '../../assets/KUJI.svg';
import LsiIcon from '../../assets/LSI.svg';
import LunaIcon from '../../assets/LUNA.svg';
import OkbIcon from '../../assets/OKB.svg';
import OsmoIcon from '../../assets/OSMO.svg';
import OktIcon from '../../assets/OKT.svg';
import RAtomIcon from '../../assets/rATOM.svg';
import RswthIcon from '../../assets/rSWTH.svg';
import StEvmosIcon from '../../assets/stEVMOS.svg';
import StLunaIcon from '../../assets/stLUNA.svg';
import StOsmoIcon from '../../assets/stOSMO.svg';
import StatomIcon from '../../assets/stATOM.svg';
import StRdIcon from '../../assets/STRD.svg';
import SwthIcon from '../../assets/SWTH.svg';
import UscIcon from '../../assets/USC.svg';
import UsdcIcon from '../../assets/USDC.svg';
import UsdIcon from '../../assets/USD.svg';
import WbtcIcon from '../../assets/WBTC.svg';
import WstethIcon from '../../assets/wstETH.svg';
import YieldusdIcon from '../../assets/YieldUSD.svg';
import ZilIcon from '../../assets/ZIL.svg';
import React, { memo } from 'react';

interface TokenIconProps {
	currency: string;
}

const icons: Record<string, string> = {
	AMPLUNA: AmpLunaIcon,
	ATOM: AtomIcon,
	AXLUSDC: AxlUsdcIcon,
	BLUR: BlurIcon,
	BNEO: BneoIcon,
	BUSD: BusdIcon,
	ETH: EthIcon,
	EVMOS: EvmosIcon,
	GMX: GmxIcon,
	IBCX: IbcxIcon,
	IRIS: IrisIcon,
	KUJI: KujiIcon,
	LSI: LsiIcon,
	LUNA: LunaIcon,
	OKB: OkbIcon,
	OKT: OktIcon,
	OSMO: OsmoIcon,
	RATOM: RAtomIcon,
	RSWTH: RswthIcon,
	STATOM: StatomIcon,
	STEVMOS: StEvmosIcon,
	STLUNA: StLunaIcon,
	STOSMO: StOsmoIcon,
	STRD: StRdIcon,
	SWTH: SwthIcon,
	USC: UscIcon,
	USD: UsdIcon,
	USDC: UsdcIcon,
	WBTC: WbtcIcon,
	WSTETH: WstethIcon,
	YIELDUSD: YieldusdIcon,
	ZIL: ZilIcon,
};

export const TokenIcon = React.memo(({ currency }: TokenIconProps) => {
	const key = currency.toUpperCase();
	const iconSrc = icons[key];
	return iconSrc ? (
		<img src={iconSrc} alt={currency} className="w-6 h-6" />
	) : (
		<div className="w-6 h-6 bg-gray-400 rounded" />
	);
});

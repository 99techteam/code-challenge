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
	className?: string;
}

const icons: Record<string, string> = {
	ampLUNA: AmpLunaIcon,
	ATOM: AtomIcon,
	axlUSDC: AxlUsdcIcon,
	BLUR: BlurIcon,
	bNEO: BneoIcon,
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
	STRD: StRdIcon,
	SWTH: SwthIcon,
	USC: UscIcon,
	USD: UsdIcon,
	USDC: UsdcIcon,
	WBTC: WbtcIcon,
	YieldUSD: YieldusdIcon,
	ZIL: ZilIcon,

	RATOM: RAtomIcon, 
	rATOM: RAtomIcon, 

	RSWTH: RswthIcon, 
	rSWTH: RswthIcon,

	STATOM: StatomIcon, 
	stATOM: StatomIcon,

	STEVMOS: StEvmosIcon,
	stEVMOS: StEvmosIcon,

	STLUNA: StLunaIcon, 
	stLUNA: StLunaIcon,

	STOSMO: StOsmoIcon, 
	stOSMO: StOsmoIcon,

	WSTETH: WstethIcon, 
	wstETH: WstethIcon,

	AXLUSDC: AxlUsdcIcon, 
	BNEO: BneoIcon,
	AMPLUNA: AmpLunaIcon, 
};

export const TokenIcon = React.memo(
	({ currency, className = 'w-6 h-6' }: TokenIconProps) => {
		const iconSrc = icons[currency] || icons[currency.toUpperCase()];

		if (iconSrc) {
			return (
				<img
					src={iconSrc}
					alt={currency}
					className={`${className} rounded-full object-cover shadow-sm`}
				/>
			);
		}

		return (
			<div
				className={`
          ${className} 
          rounded-full 
          bg-gradient-to-br from-gray-700 to-gray-600 border border-gray-500/50
          flex items-center justify-center 
          text-xs font-bold text-white shadow-sm
        `}
			>
				{currency[0]?.toUpperCase()}
			</div>
		);
	}
);

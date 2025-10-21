import { BaseIcon, ICON_NAME } from '../base-icon';
import styles from './style.module.scss';

interface BaseBackgroundProps {
  children: React.ReactNode;
}

const ICONS: Array<{ name: ICON_NAME; size: 16 | 24 | 32 | 48 | 64 | 128 }> = [
  {
    name: ICON_NAME.AMPLUNA,
    size: 64,
  },
  {
    name: ICON_NAME.ATOM,
    size: 32,
  },
  {
    name: ICON_NAME.AXLUSDC,
    size: 128,
  },
  {
    name: ICON_NAME.BLUR,
    size: 32,
  },
  {
    name: ICON_NAME.BNEO,
    size: 32,
  },
  {
    name: ICON_NAME.BUSD,
    size: 64,
  },
  {
    name: ICON_NAME.ETH,
    size: 128,
  },
  {
    name: ICON_NAME.EVMOS,
    size: 32,
  },
  {
    name: ICON_NAME.GMX,
    size: 32,
  },
  {
    name: ICON_NAME.IBCX,
    size: 48,
  },
  {
    name: ICON_NAME.IRIS,
    size: 128,
  },
  {
    name: ICON_NAME.KUJI,
    size: 32,
  },
  {
    name: ICON_NAME.LSI,
    size: 48,
  },
  {
    name: ICON_NAME.LUNA,
    size: 32,
  },
  {
    name: ICON_NAME.OKB,
    size: 64,
  },
  {
    name: ICON_NAME.OKT,
    size: 128,
  },
  {
    name: ICON_NAME.OSMO,
    size: 48,
  },
  {
    name: ICON_NAME.RATOM,
    size: 32,
  },
  {
    name: ICON_NAME.RSWTH,
    size: 32,
  },
  {
    name: ICON_NAME.STATOM,
    size: 64,
  },
  {
    name: ICON_NAME.STEVMOS,
    size: 32,
  },
  {
    name: ICON_NAME.STLUNA,
    size: 32,
  },
  {
    name: ICON_NAME.STOSMO,
    size: 64,
  },
  {
    name: ICON_NAME.STRD,
    size: 128,
  },
  {
    name: ICON_NAME.EVMOS,
    size: 32,
  },
  {
    name: ICON_NAME.GMX,
    size: 32,
  },
  {
    name: ICON_NAME.IBCX,
    size: 48,
  },
  {
    name: ICON_NAME.IRIS,
    size: 128,
  },
  {
    name: ICON_NAME.KUJI,
    size: 32,
  },
  {
    name: ICON_NAME.LSI,
    size: 48,
  },
  {
    name: ICON_NAME.LUNA,
    size: 32,
  },
  {
    name: ICON_NAME.OKB,
    size: 64,
  },
  {
    name: ICON_NAME.OKT,
    size: 128,
  },
];

export const BaseBackground = () => {
  return (
    <div className={styles.container}>
      <div className={styles.background}>
        {ICONS.map((icon, index) => (
          <div
            className={styles.icon}
            key={`${icon.name}-${index}`}
            style={{
              opacity: 0.3 + Math.random() * 0.4,
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              filter: `blur(${Math.random() * 5}px)`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          >
            <BaseIcon name={icon.name} size={icon.size} />
          </div>
        ))}
      </div>
    </div>
  );
};

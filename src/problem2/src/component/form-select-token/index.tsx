import { useState, useEffect } from 'react';
import classnames from 'classnames';

import { IPriceData } from '../../mock-data/price';
import { BaseLoading } from '../base-loading';
import { BaseIcon, ICON_NAME } from '../base-icon';
import { BaseTypography } from '../base-typography';
import { BaseIconArrow } from '../base-icon-arrow';
import styles from './style.module.scss';

interface FormSelectTokenProps {
  priceData: IPriceData[];
  isLoading: boolean;
  onChange?: (token: IPriceData) => void;
}

export const FormSelectToken = ({
  priceData,
  isLoading,
  onChange,
}: FormSelectTokenProps) => {
  const [selectedToken, setSelectedToken] = useState<IPriceData | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    if (priceData.length > 0) {
      setSelectedToken(priceData[0]);
      onChange?.(priceData[0]);
    }
  }, [priceData]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <BaseLoading />
      </div>
    );
  }

  return (
    <div
      className={classnames(styles.container, {
        [styles.dropdownOpen]: isDropdownOpen,
      })}
    >
      <div className={styles.panel} onClick={() => setIsDropdownOpen(true)}>
        <BaseIcon size={24} name={selectedToken?.currency as ICON_NAME} />
        <div className={styles.info}>
          <BaseTypography type="text">{selectedToken?.currency}</BaseTypography>
          <BaseTypography type="subTitle">
            {selectedToken?.price}
          </BaseTypography>
        </div>
        <BaseIconArrow direction={isDropdownOpen ? 'up' : 'down'} />
      </div>
      <div
        className={styles.dropdownOverlay}
        onClick={() => setIsDropdownOpen(false)}
      ></div>
      <div className={styles.dropdown}>
        <div className={styles.list}>
          {priceData.map(item => (
            <div
              onClick={() => {
                setSelectedToken(item);
                onChange?.(item);
                setIsDropdownOpen(false);
              }}
              className={classnames(styles.item, {
                [styles.selected]: item.currency === selectedToken?.currency,
              })}
              key={item.currency}
            >
              <BaseIcon size={24} name={item.currency as ICON_NAME} />
              <div className={styles.info}>
                <BaseTypography type="text">{item.currency}</BaseTypography>
                <BaseTypography type="subTitle">{item.price}</BaseTypography>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

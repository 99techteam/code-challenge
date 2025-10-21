import classnames from 'classnames';
import styles from './style.module.scss';

interface BaseIconArrowProps {
  direction?: 'up' | 'down';
}

export const BaseIconArrow = ({ direction = 'down' }: BaseIconArrowProps) => {
  return (
    <div
      className={classnames(styles.container, styles[`direction-${direction}`])}
    ></div>
  );
};

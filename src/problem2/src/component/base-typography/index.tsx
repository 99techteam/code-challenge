import classnames from 'classnames';
import styles from './style.module.scss';

interface BaseTypographyProps {
  children: React.ReactNode;
  type?: 'heading' | 'text' | 'subTitle';
}

export const BaseTypography = ({
  children,
  type = 'text',
}: BaseTypographyProps) => {
  return (
    <div className={classnames(styles.container, styles[`type-${type}`])}>
      {children}
    </div>
  );
};

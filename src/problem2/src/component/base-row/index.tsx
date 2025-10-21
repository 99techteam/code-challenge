import styles from './style.module.scss';

interface BaseRowProps {
  children: React.ReactNode;
}

export const BaseRow = ({ children }: BaseRowProps) => {
  return <div className={styles.container}>{children}</div>;
};

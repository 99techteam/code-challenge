import styles from './style.module.scss';

interface FormPanelProps {
  children: React.ReactNode;
}

export const FormPanel = ({ children }: FormPanelProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.panel}>{children}</div>
    </div>
  );
};

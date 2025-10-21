import styles from './style.module.scss';

interface FormTokenWrapProps {
  input: React.ReactNode;
  tokenSelect: React.ReactNode;
}

export const FormTokenWrap = ({ input, tokenSelect }: FormTokenWrapProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.input}>{input}</div>
      <div className={styles.tokenSelect}>{tokenSelect}</div>
    </div>
  );
};

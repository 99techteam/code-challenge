import styles from './style.module.scss';

export const BaseLoading = () => {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <div className={styles.icon}></div>
      </div>
    </div>
  );
};

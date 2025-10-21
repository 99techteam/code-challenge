import { BaseLoading } from '../base-loading';
import styles from './style.module.scss';

interface FormInputProps {
  value: string;
  readonly?: boolean;
  isLoading?: boolean;
  onChange?: (value: string) => void;
}

export const FormInput = ({
  value,
  readonly = false,
  isLoading = false,
  onChange,
}: FormInputProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    onChange?.(event.target.value);

  return (
    <div className={styles.container}>
      <input
        type="number"
        value={value}
        disabled={readonly}
        onChange={handleChange}
      />

      {isLoading && (
        <div className={styles.loadingContainer}>
          <BaseLoading />
        </div>
      )}
    </div>
  );
};

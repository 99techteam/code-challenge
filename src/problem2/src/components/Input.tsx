import { Input as ShadcnInput } from '@/components/ui/input';

const Input = (props: {
  onchange?: (value: string) => void;
  className?: string;
  placeholder?: string;
  type: string;
  value: string;
  readOnly?: boolean;
}) => {
  return (
    <ShadcnInput
      min={0}
      type={props.type}
      value={props.value}
      onChange={
        props.onchange ? (e) => props?.onchange!(e.target.value) : undefined
      }
      className={props.className}
      readOnly={props.readOnly}
      placeholder={props.placeholder}
    />
  );
};

export default Input;

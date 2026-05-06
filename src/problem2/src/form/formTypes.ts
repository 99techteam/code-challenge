export type FormErrors<T extends object> = Partial<Record<keyof T, string>>;

export type ValidateForm<T extends object> = (values: T) => FormErrors<T>;

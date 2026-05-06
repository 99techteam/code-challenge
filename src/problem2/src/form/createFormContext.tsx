import {
  createContext,
  FormEvent,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { FormErrors, ValidateForm } from "./formTypes";

/**
 * Formik-style state (values, errors, touched) with a small API.
 * Instantiate once per form shape: `const { FormProvider, useForm, useFormField } = createFormContext<MyValues>()`.
 */
export function createFormContext<T extends Record<string, unknown>>() {
  type FieldKey = keyof T;

  type FormContextApi = {
    values: T;
    errors: FormErrors<T>;
    touched: Partial<Record<FieldKey, boolean>>;
    dirty: boolean;
    isValid: boolean;
    setFieldValue: <K extends FieldKey>(
      field: K,
      value: T[K],
      options?: { notify?: boolean },
    ) => void;
    setFieldTouched: (field: FieldKey, touched?: boolean) => void;
    setValues: (patch: Partial<T>) => void;
    resetForm: (nextInitial?: Partial<T>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
    lastSubmittedValues: T | null;
  };

  const FormContextReact = createContext<FormContextApi | null>(null);

  type FormProviderProps = {
    initialValues: T;
    validate?: ValidateForm<T>;
    onSubmit: (values: T) => Promise<{ success: boolean }>;
    /** Called after user-driven value updates (skipped when `setFieldValue(..., { notify: false })`). */
    onValuesChange?: () => void;
    /**
     * Keys to mark touched on submit before validation.
     * If omitted, merges keys from initial values and current values so optional fields aren’t skipped.
     */
    submitTouchKeys?: FieldKey[];
    children: ReactNode;
  };

  function mergeTouchKeys(currentValues: T, initialSnapshot: T, explicit?: FieldKey[]): FieldKey[] {
    if (explicit && explicit.length > 0) {
      return explicit;
    }
    const set = new Set<FieldKey>(
      [...Object.keys(currentValues), ...Object.keys(initialSnapshot)] as FieldKey[],
    );
    return [...set];
  }

  function FormProvider({
    initialValues: initialValuesProp,
    validate,
    onSubmit,
    onValuesChange,
    submitTouchKeys,
    children,
  }: FormProviderProps) {
    const initialRef = useRef<T>(initialValuesProp);

    useEffect(() => {
      initialRef.current = initialValuesProp;
    }, [initialValuesProp]);

    const [values, setValuesState] = useState<T>(initialValuesProp);
    const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
    const [errors, setErrors] = useState<FormErrors<T>>({});
    const [lastSubmittedValues, setLastSubmittedValues] = useState<T | null>(null);

    /** Avoid re-init / layout thrash when the parent passes a new object with the same logical initial values. */
    const serializedInitialRef = useRef<string | null>(null);

    const validateRef = useRef(validate);
    validateRef.current = validate;

    const submitTouchKeysRef = useRef(submitTouchKeys);
    submitTouchKeysRef.current = submitTouchKeys;

    const runValidation = useCallback((nextValues: T): FormErrors<T> => {
      const fn = validateRef.current;
      if (!fn) {
        return {};
      }
      return fn(nextValues);
    }, []);

    useEffect(() => {
      const serialized = JSON.stringify(initialValuesProp);
      if (
        serializedInitialRef.current !== null &&
        serializedInitialRef.current === serialized
      ) {
        return;
      }
      serializedInitialRef.current = serialized;
      setValuesState(initialValuesProp);
      setTouched({});
      setErrors({});
    }, [initialValuesProp]);

    useEffect(() => {
      const hasTouched = Object.values(touched).some(Boolean);
      if (!validateRef.current || !hasTouched) {
        return;
      }
      setErrors(runValidation(values));
    }, [values, touched, runValidation]);

    const dirty = useMemo(
      () => JSON.stringify(values) !== JSON.stringify(initialValuesProp),
      [values, initialValuesProp],
    );

    const isValid = useMemo(
      () => Object.keys(runValidation(values)).length === 0,
      [values, runValidation],
    );

    const setFieldValue = useCallback(
      <K extends FieldKey>(field: K, value: T[K], options?: { notify?: boolean }) => {
        setValuesState((previous) => ({ ...previous, [field]: value }));
        if (options?.notify !== false) {
          onValuesChange?.();
        }
      },
      [onValuesChange],
    );

    const setValues = useCallback(
      (patch: Partial<T>) => {
        setValuesState((previous) => ({ ...previous, ...patch }));
        onValuesChange?.();
      },
      [onValuesChange],
    );

    const setFieldTouched = useCallback((field: FieldKey, isTouched = true) => {
      setTouched((previous) => ({ ...previous, [field]: isTouched }));
    }, []);

    const resetForm = useCallback((nextInitial?: Partial<T>) => {
      const base = initialRef.current;
      const next = nextInitial ? { ...base, ...nextInitial } : base;
      setValuesState(next);
      setTouched({});
      setErrors({});
    }, []);

    const handleSubmit = useCallback(
      (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const keys = mergeTouchKeys(values, initialRef.current, submitTouchKeysRef.current);
        setTouched(
          keys.reduce<Partial<Record<FieldKey, boolean>>>((acc, key) => {
            acc[key] = true;
            return acc;
          }, {}),
        );

        const nextErrors = runValidation(values);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
          return;
        }

        void onSubmit(values).then((result) => {
          if (result.success) {
            setLastSubmittedValues(values);
          }
        });
      },
      [values, onSubmit, runValidation],
    );

    const ctx = useMemo<FormContextApi>(
      () => ({
        values,
        errors,
        touched,
        dirty,
        isValid,
        setFieldValue,
        setFieldTouched,
        setValues,
        resetForm,
        handleSubmit,
        lastSubmittedValues,
      }),
      [
        values,
        errors,
        touched,
        dirty,
        isValid,
        setFieldValue,
        setFieldTouched,
        setValues,
        resetForm,
        lastSubmittedValues,
        handleSubmit,
      ],
    );

    return (
      <FormContextReact.Provider value={ctx}>{children}</FormContextReact.Provider>
    );
  }

  function useForm(): FormContextApi {
    const ctx = useContext(FormContextReact);
    if (!ctx) {
      throw new Error(
        "useForm must be used within FormProvider from the same createFormContext() instance.",
      );
    }
    return ctx;
  }

  function useFormField<K extends FieldKey>(name: K) {
    const { values, errors, touched, setFieldValue, setFieldTouched } = useForm();

    return {
      name,
      value: values[name],
      error: errors[name],
      touched: touched[name] ?? false,
      setValue: (next: T[K]) => setFieldValue(name, next),
      setTouched: (next = true) => setFieldTouched(name, next),
      onBlur: () => setFieldTouched(name, true),
    };
  }

  return { FormProvider, useForm, useFormField };
}

export interface PriceData {
  price: number;
  date: string;
}

export interface ValidationErrors {
  amount?: string;
  tokens?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrors;
}

export interface ModalState {
  isOpen: boolean;
  success: boolean;
  message: string;
}

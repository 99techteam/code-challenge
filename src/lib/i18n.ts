const messages: Record<string, string> = {
  // Validation
  'validation.required': 'This field is required.',
  'validation.integer': 'Value must be a valid integer.',
  'validation.max_safe':
    'The result sum_to_n(n) must be less than Number.MAX_SAFE_INTEGER (2⁵³ − 1).',
  'validation.method_required': 'Please select an implementation.',
  'validation.amount_number': 'Must be a valid number.',
  'validation.amount_positive': 'Amount must be greater than 0.',
  'validation.same_token': 'From and To tokens must be different.',

  // Form labels
  'form.n_label': 'Value of n',
  'form.n_placeholder': 'e.g. 5',
  'form.method_label': 'Implementation',
  'form.submit': 'Calculate',
  'form.reset': 'Reset',

  // Result
  'result.heading': 'Result',
  'result.expression': 'sum_to_n({n}) = {value}',
  'result.reference': 'Reference',

  // Swap form
  'swap.from_label': 'You send',
  'swap.to_label': 'You receive',
  'swap.amount_placeholder': '0.00',
  'swap.select_token': 'Select token',
  'swap.submit': 'Swap',
  'swap.submitting': 'Swapping...',
  'swap.reset': 'Reset',
  'swap.rate_display': '1 {from} = {rate} {to}',
  'swap.result_heading': 'Swap Confirmed',
  'swap.result_detail': '{fromAmount} {from} → {toAmount} {to}',
  'swap.history_heading': 'Recent Swaps',
  'swap.loading': 'Loading tokens...',
  'swap.error': 'Failed to load token prices. Please try again.',
  'swap.error_network': 'Network error. Check your connection and try again.',
  'swap.error_http': 'Failed to load prices (HTTP {status}). Please try again.',
};

// i18n mock function, in a real application this would be replaced with a proper i18n library
export function t(key: string, vars?: Record<string, string | number>): string {
  let msg = messages[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replaceAll(`{${k}}`, String(v));
    }
  }
  return msg;
}

interface DatabaseError {
  code: string;
}

export const isUniqueConstraintError = (error: unknown): error is DatabaseError => {
  if (error !== null && typeof error === 'object' && 'code' in error) {
    const code = (error as DatabaseError).code;
    return typeof code === 'string' && code === '23505';
  }
  return false;
};
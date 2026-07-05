import { ulid } from 'ulid';

export const generateProductId = (): string => {
  return ulid();
};

export const isValidULID = (id: string): boolean => {
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
  return ulidRegex.test(id);
};

import { v7 as uuidv7 } from 'uuid';

export function generateUUID(): string {
  return uuidv7();
}

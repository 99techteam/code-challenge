import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Unmount React trees after each test so they don't leak between specs.
afterEach(() => {
  cleanup();
});

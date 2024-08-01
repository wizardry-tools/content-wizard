import { Logger } from '@/types';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Mocks the native console logging
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.debug = vi.fn();
  console.error = vi.fn();
});

// Run cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mocks the Logger functions
const mockLogger: Logger = {
  log: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

// Mocks the useLogger hook
vi.mock('@/providers/LoggingProvider', () => ({
  useLogger: () => mockLogger,
}));

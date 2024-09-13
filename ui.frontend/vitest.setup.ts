import * as matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// this silences the console
console.log = vi.fn();
console.warn = vi.fn();
console.debug = vi.fn();
console.error = vi.fn();

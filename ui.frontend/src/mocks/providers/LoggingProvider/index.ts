import { Logger } from '@/types';

export const mockLogger: Logger = {
  log: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

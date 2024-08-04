import { useAlertDispatcher } from '@/providers';
import { useWizardStorageAPI } from '../storage-api';
import { emptyMockFunction } from '@/mocks/util';

const ERROR_MESSAGE = 'Terrible Error (but completely expected, this is a test)';

describe('WizardStorageAPI', () => {
  vi.mock('@/providers', () => {
    return {
      useAlertDispatcher() {
        return emptyMockFunction;
      },
    };
  });
  const mockedAlertDispatcher = useAlertDispatcher();
  let storage = useWizardStorageAPI({ alertDispatcher: mockedAlertDispatcher });

  beforeEach(() => {
    storage = useWizardStorageAPI({ alertDispatcher: mockedAlertDispatcher });
  });

  it('returns nothing if no value set', () => {
    const result = storage.get('key1');
    expect(result).toBeNull();
  });

  it('sets and gets a value correctly', () => {
    const result = storage.set('key2', 'value');
    expect(result).toEqual({
      error: null,
      isQuotaError: false,
    });

    const newResult = storage.get('key2');
    expect(newResult).toEqual('value');
  });

  it('sets and removes a value correctly', () => {
    let result = storage.set('key3', 'value');
    expect(result).toEqual({
      error: null,
      isQuotaError: false,
    });

    result = storage.set('key3', '');
    expect(result).toEqual({
      error: null,
      isQuotaError: false,
    });

    const getResult = storage.get('key3');
    expect(getResult).toBeNull();
  });

  it('sets and overrides a value correctly', () => {
    let result = storage.set('key4', 'value');
    expect(result).toEqual({
      error: null,
      isQuotaError: false,
    });

    result = storage.set('key4', 'value2');
    expect(result).toEqual({
      error: null,
      isQuotaError: false,
    });

    const getResult = storage.get('key4');
    expect(getResult).toEqual('value2');
  });

  it('cleans up `null` value', () => {
    storage.set('key5', 'null');
    const result = storage.get('key5');
    expect(result).toBeNull();
  });

  it('cleans up `undefined` value', () => {
    storage.set('key6', 'undefined');
    const result = storage.get('key6');
    expect(result).toBeNull();
  });

  it('returns any error while setting a value', () => {
    const throwingStorage = useWizardStorageAPI({
      storage: {
        setItem() {
          throw new DOMException(ERROR_MESSAGE);
        },
        getItem() {
          return null;
        },
        clear: () => ({}),
        removeItem: () => ({}),
        length: 1,
      },
    });
    const result = throwingStorage.set('key', 'value');

    expect(result.error?.message).toEqual(`Error: ${ERROR_MESSAGE}`);
    expect(result.isQuotaError).toBe(false);
  });

  it('returns isQuotaError to true if isQuotaError is thrown', () => {
    const throwingStorage = useWizardStorageAPI({
      storage: {
        setItem() {
          throw new DOMException(ERROR_MESSAGE, 'QuotaExceededError');
        },
        getItem() {
          return null;
        },
        clear: () => ({}),
        removeItem: () => ({}),
        length: 1,
      },
    });
    const result = throwingStorage.set('key', 'value');

    expect(result.error?.message).toEqual(`QuotaExceededError: ${ERROR_MESSAGE}`);
    expect(result.isQuotaError).toBe(true);
  });
});

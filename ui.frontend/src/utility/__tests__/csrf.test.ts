import { getCsrfToken } from '../csrf';
import { DYNAMIC_HEADERS } from '../http';

describe('getCsrfToken function', () => {
  let fetchMocked: any = undefined;
  beforeEach(() => {
    fetchMocked = jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ token: 'csrf-token' }) })) as jest.Mock,
      );
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return a csrf token', async () => {
    const csrfToken = await getCsrfToken();

    // Check the fetch url
    expect(fetchMocked).toBeCalledWith('/libs/granite/csrf/token.json', DYNAMIC_HEADERS);

    // Should return the exact csrf token
    expect(csrfToken).toEqual('csrf-token');
  });
});

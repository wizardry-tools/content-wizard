import { a11yProps } from '../ui';

describe('a11yProps function', () => {
  it('returns proper a11yProps', () => {
    const index = 0;
    const id = 'full-width-tab-';
    const expectedOutput = {
      id: `${id}${index}`,
      'aria-controls': `${id}${index}`,
    };

    const output = a11yProps(index);
    expect(output).toEqual(expectedOutput);
  });

  it('returns a11yProps with custom id', () => {
    const index = 1;
    const id = 'custom-id-';
    const expectedOutput = {
      id: `${id}${index}`,
      'aria-controls': `${id}${index}`,
    };

    const output = a11yProps(index, id);
    expect(output).toEqual(expectedOutput);
  });
});

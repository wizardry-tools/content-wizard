import { renderHook } from '@testing-library/react';
import { createTheme, Theme } from '@mui/material/styles';
import { UsePaperThemeProps } from '@/types';
import { usePaperTheme } from '../usePaperTheme';

/**
 * Test for usePaperTheme Hook.
 */

describe('usePaperTheme', () => {
  const mockTheme: Theme = createTheme();
  it('returns expected styles with default props', () => {
    const { result } = renderHook(() => usePaperTheme()(mockTheme));
    // Validate result
    expect(result.current.backgroundColor).toBeDefined();
    expect(result.current.color).toBeDefined();
    expect(result.current.transition).toBeDefined();
    // Continue assertions...
  });

  it('returns expected styles with custom props', () => {
    const props: UsePaperThemeProps = {
      elevation: 2,
      styles: { fontWeight: 'bold' },
    };

    const { result } = renderHook(() => usePaperTheme(props)(mockTheme));

    // Validate result
    expect(result.current.backgroundColor).toBeDefined();
    expect(result.current.color).toBeDefined();
    expect(result.current.transition).toBeDefined();
    expect(result.current.boxShadow).toBeDefined();
    expect(result.current.fontWeight).toEqual('bold');
    // Continue assertions...
  });
});

import { render, fireEvent, RenderResult } from '@testing-library/react';
import { Mock } from 'vitest';
import { ThemeProvider, createTheme, Theme } from '@mui/system';
import { GlobalNav } from '../GlobalNav';
import { useThemeDispatch } from '@/providers';

describe('GlobalNav', () => {
  vi.mock('@mui/material', () => {
    return {
      Box: vi.fn(({ children }) => {
        return <div>{children}</div>;
      }),
      Link: vi.fn(({ href, children }) => {
        return <a href={href}>{children}</a>;
      }),
      IconButton: vi.fn(({ children, onClick }) => {
        return (
          <a role="button" onClick={onClick}>
            <img src="/" alt="test" />
            {children}
          </a>
        );
      }),
    };
  });
  vi.mock('@/providers/WizardThemeProvider', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const mockedDispatch = vi.fn(() => {});
    return {
      useThemeDispatch: vi.fn(() => mockedDispatch),
      DARK: 'dark',
      LIGHT: 'light',
      WizardAlert: vi.fn(),
    };
  });

  let container: RenderResult;
  const theme: Theme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#F0F0F0',
      },
    },
  });
  const themeDispatch = useThemeDispatch() as Mock;
  beforeEach(() => {
    container = render(
      <ThemeProvider theme={theme}>
        <GlobalNav pageTitle="Test Page" />
      </ThemeProvider>,
    );
  });

  test('contains a link to the start page', () => {
    const linkContainer = container.getByRole('heading');
    const link = linkContainer.firstChild ?? { href: '', textContent: '' };
    expect(link).toHaveAttribute('href', '/');
    expect(link.textContent).toContain('Adobe Experience Manager');
  });

  test('displays the passed page title', () => {
    expect(container.getByText(/Test Page/)).toBeInTheDocument();
  });

  test('toggles color mode', () => {
    const toggle = container.getByRole('button');
    fireEvent.click(toggle);
    expect(themeDispatch).toBeCalledWith('dark');
  });
});

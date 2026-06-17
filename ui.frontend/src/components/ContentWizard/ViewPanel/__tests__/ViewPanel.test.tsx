// Importing required dependencies and mock data
import { render, screen } from '@testing-library/react';
import type { ViewPanelProps } from '@/types';
import { ViewPanel } from '../ViewPanel';

describe('ViewPanel', () => {
  it('renders children if value is equal to index', () => {
    const props: ViewPanelProps = {
      index: 1,
      value: 1,
      dir: 'ltr',
      children: <div>View Content</div>,
    };

    render(<ViewPanel {...props} />);

    expect(screen.getByText('View Content')).toBeTruthy();
  });

  it('does not render children if value is not equal to index', () => {
    const props: ViewPanelProps = {
      index: 1,
      value: 2,
      dir: 'ltr',
      children: <div>View Content</div>,
    };

    render(<ViewPanel {...props} />);

    expect(screen.queryByText('View Content')).not.toBeVisible();
  });

  it('renders with provided padding', () => {
    const props: ViewPanelProps = {
      index: 1,
      value: 1,
      dir: 'ltr',
      padding: 5,
      children: <div>View Content</div>,
    };

    render(<ViewPanel {...props} />);
    // The padding sx is applied to the tabpanel container, not the child text node.
    // MUI maps sx={{ p: 5 }} to theme.spacing(5) = 40px with the default 8px spacing unit.
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveStyle('padding: 40px');
  });
});

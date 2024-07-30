// Importing required dependencies and mock data
import { render, screen } from '@testing-library/react';
import { TabPanel } from '../TabPanel';
import { TabPanelProps } from '@/types';

describe('TabPanel', () => {
  it('renders children if value is equal to index', () => {
    const props: TabPanelProps = {
      index: 1,
      value: 1,
      dir: 'ltr',
      children: <div>Tab Content</div>,
    };

    render(<TabPanel {...props} />);

    expect(screen.getByText('Tab Content')).toBeTruthy();
  });

  it('does not render children if value is not equal to index', () => {
    const props: TabPanelProps = {
      index: 1,
      value: 2,
      dir: 'ltr',
      children: <div>Tab Content</div>,
    };

    render(<TabPanel {...props} />);

    expect(screen.queryByText('Tab Content')).not.toBeVisible();
  });

  it('renders with provided padding', () => {
    const props: TabPanelProps = {
      index: 1,
      value: 1,
      dir: 'ltr',
      padding: 5,
      children: <div>Tab Content</div>,
    };

    render(<TabPanel {...props} />);
    const element = screen.getByText('Tab Content');
    expect(element).toHaveStyle(`padding: ${props.padding}`);
  });
});

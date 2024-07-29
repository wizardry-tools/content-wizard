import { render, fireEvent } from '@testing-library/react';
import { Bar } from './Bar';

describe('Testing Bar component', () => {
  it('renders Bar', () => {
    const mockOnTabSelect = jest.fn();
    jest.spyOn(require('@/providers/ResultsProvider'), 'useResults').mockReturnValue({ results: [] });
    const { getByText } = render(<Bar tabValue={0} onTabSelect={mockOnTabSelect} />);
    getByText('Query Wizard');
    getByText('Query IDE');
    getByText('Results');
  });

  it('triggers onTabSelect when a tab is clicked', () => {
    const mockOnTabSelect = jest.fn();
    jest.spyOn(require('@/providers/ResultsProvider'), 'useResults').mockReturnValue({ results: [] });
    const { getByText } = render(<Bar tabValue={0} onTabSelect={mockOnTabSelect} />);
    fireEvent.click(getByText('Query IDE'));
    expect(mockOnTabSelect).toHaveBeenCalled();
  });

  it('does not trigger onTabSelect when the Results tab is clicked and results length is less than 1', () => {
    const mockOnTabSelect = jest.fn();
    jest.spyOn(require('@/providers/ResultsProvider'), 'useResults').mockReturnValue({ results: [] });
    const { getByText } = render(<Bar tabValue={0} onTabSelect={mockOnTabSelect} />);
    fireEvent.click(getByText('Results'));
    expect(mockOnTabSelect).not.toHaveBeenCalled();
  });
});

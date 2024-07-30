import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Bar } from './Bar';
import * as ResultsProvider from '@/providers/ResultsProvider';
import { ResultsContextProps } from '@/types';

const EmptyContext: ResultsContextProps = {
  results: [],
  keys: [],
  filter: '',
  setFilter: () => ({}),
  tableResults: [],
  order: 'asc',
  setOrder: () => ({}),
  orderBy: '',
  setOrderBy: () => ({}),
  exportResults: () => ({}),
};
describe('Testing Bar component', () => {
  it('renders Bar', () => {
    const mockOnTabSelect = vi.fn();
    vi.spyOn(ResultsProvider, 'useResults').mockReturnValue(EmptyContext);
    const { getByText } = render(<Bar tabValue={0} onTabSelect={mockOnTabSelect} />);
    getByText('Query Wizard');
    getByText('Query IDE');
    getByText('Results');
  });

  it('triggers onTabSelect when a tab is clicked', () => {
    const mockOnTabSelect = vi.fn();
    vi.spyOn(ResultsProvider, 'useResults').mockReturnValue(EmptyContext);
    const { getByText } = render(<Bar tabValue={0} onTabSelect={mockOnTabSelect} />);
    fireEvent.click(getByText('Query IDE'));
    expect(mockOnTabSelect).toHaveBeenCalled();
  });

  it('does not trigger onTabSelect when the Results tab is clicked and results length is less than 1', () => {
    const mockOnTabSelect = vi.fn();
    vi.spyOn(ResultsProvider, 'useResults').mockReturnValue(EmptyContext);
    const { getByText } = render(<Bar tabValue={0} onTabSelect={mockOnTabSelect} />);
    fireEvent.click(getByText('Results'));
    expect(mockOnTabSelect).not.toHaveBeenCalled();
  });
});

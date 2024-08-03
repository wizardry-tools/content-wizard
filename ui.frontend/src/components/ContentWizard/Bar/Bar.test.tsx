import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Bar } from './Bar';
import * as ResultsProvider from '@/providers/ResultsProvider';
import type { ResultsContextProps } from '@/types';

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
    const mockOnViewSelect = vi.fn();
    vi.spyOn(ResultsProvider, 'useResults').mockReturnValue(EmptyContext);
    const { getByText } = render(<Bar selectedView={0} onViewSelect={mockOnViewSelect} />);
    getByText('Query Wizard');
    getByText('Query IDE');
    getByText('Results');
  });

  it('triggers onViewSelect when a tab is clicked', () => {
    const mockOnViewSelect = vi.fn();
    vi.spyOn(ResultsProvider, 'useResults').mockReturnValue(EmptyContext);
    const { getByText } = render(<Bar selectedView={0} onViewSelect={mockOnViewSelect} />);
    fireEvent.click(getByText('Query IDE'));
    expect(mockOnViewSelect).toHaveBeenCalled();
  });

  it('does not trigger onViewSelect when the Results tab is clicked and results length is less than 1', () => {
    const mockOnViewSelect = vi.fn();
    vi.spyOn(ResultsProvider, 'useResults').mockReturnValue(EmptyContext);
    const { getByText } = render(<Bar selectedView={0} onViewSelect={mockOnViewSelect} />);
    fireEvent.click(getByText('Results'));
    expect(mockOnViewSelect).not.toHaveBeenCalled();
  });
});

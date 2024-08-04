import { fireEvent, render } from '@testing-library/react';
import type { Mock } from 'vitest';
import type { ComponentProps } from 'react';
import { useQueryDispatcher } from '@/providers';
import { formatQuery } from '../HistoryContext';
import { HistoryItem } from '../HistoryItem';
import { HistoryContextProvider } from '../HistoryContextProvider';
import { useEditorContext } from '../../editor';
import { Tooltip } from '../../ui';
import { emptyMockFunction } from '@/mocks/util';
import { mockLogger } from '@/mocks/providers/LoggingProvider';

const mockQuery = /* GraphQL */ `
  query Test($string: String) {
    test {
      hasArgs(string: $string)
    }
  }
`;

const mockVariables = JSON.stringify({ string: 'string' });

const mockHeaders = JSON.stringify({ foo: 'bar' });

const mockOperationName = 'Test';

type QueryHistoryItemProps = ComponentProps<typeof HistoryItem>;

function QueryHistoryItemWithContext(props: QueryHistoryItemProps) {
  return (
    <Tooltip.Provider>
      <HistoryContextProvider>
        <HistoryItem {...props} />
      </HistoryContextProvider>
    </Tooltip.Provider>
  );
}

const baseMockProps: QueryHistoryItemProps = {
  item: {
    query: mockQuery,
    language: 'GraphQL',
    variables: mockVariables,
    headers: mockHeaders,
    favorite: false,
  },
};

function getMockProps(customProps?: Partial<QueryHistoryItemProps>): QueryHistoryItemProps {
  return {
    ...baseMockProps,
    ...customProps,
    item: { ...baseMockProps.item, ...customProps?.item },
  };
}

describe('HistoryItem', () => {
  vi.mock('../../ide-providers/storage', () => {
    const mockStorage = {
      set: vi.fn(() => ({ isQuotaError: false, error: null })),
      get: vi.fn(() => null),
      clear: vi.fn(),
      storage: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(() => ({})),
        removeItem: vi.fn(() => ({})),
        clear: vi.fn(),
        length: 0,
      },
    };

    return {
      useStorageContext() {
        return mockStorage;
      },
    };
  });
  vi.mock('../../editor', () => {
    const mockedSetQueryEditor = vi.fn();
    const mockedSetVariableEditor = vi.fn();
    const mockedSetHeaderEditor = vi.fn();
    return {
      useEditorContext() {
        return {
          queryEditor: { setValue: mockedSetQueryEditor },
          variableEditor: { setValue: mockedSetVariableEditor },
          headerEditor: { setValue: mockedSetHeaderEditor },
        };
      },
    };
  });
  vi.mock('@/providers', () => {
    return {
      useQueryDispatcher() {
        return emptyMockFunction;
      },
      useAlertDispatcher() {
        return emptyMockFunction;
      },
      useLogger() {
        return mockLogger;
      },
    };
  });

  const mockedSetQueryEditor = useEditorContext()?.queryEditor?.setValue as Mock;
  const mockedSetVariableEditor = useEditorContext()?.variableEditor?.setValue as Mock;
  const mockedSetHeaderEditor = useEditorContext()?.headerEditor?.setValue as Mock;
  const mockedQueryDispatcher = useQueryDispatcher() as Mock;
  beforeEach(() => {
    mockedSetQueryEditor.mockClear();
    mockedSetVariableEditor.mockClear();
    mockedSetHeaderEditor.mockClear();
    mockedQueryDispatcher.mockClear();
  });
  it('renders operationName if label is not provided', () => {
    const otherMockProps = { item: { operationName: mockOperationName } };
    const props = getMockProps(otherMockProps);
    const { container } = render(<QueryHistoryItemWithContext {...props} />);
    expect(container.querySelector('button.wizard-history-item-label')!.textContent).toBe(mockOperationName);
  });

  it('renders a string version of the query if label or operation name are not provided', () => {
    const { container } = render(<QueryHistoryItemWithContext {...getMockProps()} />);
    expect(container.querySelector('button.wizard-history-item-label')!.textContent).toBe(
      `${getMockProps().item.language} ${formatQuery(mockQuery)}`,
    );
  });

  it('selects the item when history label button is clicked', () => {
    const otherMockProps = { item: { operationName: mockOperationName } };
    const mockProps = getMockProps(otherMockProps);
    const { container } = render(<QueryHistoryItemWithContext {...mockProps} />);
    fireEvent.click(container.querySelector('button.wizard-history-item-label')!);
    expect(mockedQueryDispatcher).toHaveBeenCalledTimes(1);
    expect(mockedSetQueryEditor).toHaveBeenCalledTimes(0);
    expect(mockedSetVariableEditor).toHaveBeenCalledTimes(1);
    expect(mockedSetVariableEditor).toHaveBeenCalledWith(mockProps.item.variables);
    expect(mockedSetHeaderEditor).toHaveBeenCalledTimes(1);
    expect(mockedSetHeaderEditor).toHaveBeenCalledWith(mockProps.item.headers);
  });

  it('renders label input if the edit label button is clicked', () => {
    const { container, getByLabelText } = render(<QueryHistoryItemWithContext {...getMockProps()} />);
    fireEvent.click(getByLabelText('Edit label'));
    expect(container.querySelectorAll('li.editable').length).toBe(1);
    expect(container.querySelectorAll('input').length).toBe(1);
    expect(container.querySelectorAll('button.wizard-history-item-label').length).toBe(0);
  });
});

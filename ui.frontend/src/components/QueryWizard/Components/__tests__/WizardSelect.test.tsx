import { WizardSelect } from '../WizardSelect';
import { render, fireEvent, act } from '@testing-library/react';
import { WizardInputProps } from '@/types';
import { FieldTypes } from '../fields';
import { mockLogger } from '@/mocks/providers/LoggingProvider';

describe('WizardSelect', () => {
  vi.mock('@/providers', () => {
    return {
      useFieldDispatcher: () => vi.fn(),
      useLogger: () => {
        return mockLogger;
      },
    };
  });
  const mockProps: WizardInputProps = {
    defaultValue: '',
    field: {
      name: 'targetType',
      label: 'Test Field',
      required: true,
      options: {
        '1': 'Option1',
        '2': 'Option2',
      },
      value: '1',
      fieldType: FieldTypes.WizardSelect,
      category: 'targeting',
    },
    disabled: false,
  };

  it('should render properly', () => {
    const { getByText, getByRole, getAllByRole } = render(
      <div data-testid="select-backdrop">
        <WizardSelect {...mockProps} />
      </div>,
    );
    expect(getByText('Test Field')).to.exist;
    const trigger = getByRole('combobox');
    // Let's open the select component
    // in the browser user click also focuses
    act(() => {
      fireEvent.mouseDown(trigger);
    });

    const options = getAllByRole('option');
    expect(options[0]).toHaveFocus();
    expect(options[0].textContent).to.equal('Option1');
    expect(options[1].textContent).to.equal('Option2');
  });

  it('should handle select change', () => {
    const { getByRole, getAllByRole } = render(
      <div data-testid="select-backdrop">
        <WizardSelect {...mockProps} />
      </div>,
    );

    const trigger = getByRole('combobox');
    // Let's open the select component
    // in the browser user click also focuses
    act(() => {
      fireEvent.mouseDown(trigger);
    });
    const options = getAllByRole('option');
    act(() => {
      options[1].click();
    });
    expect(trigger.textContent).to.equal(options[1].textContent);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { WizardInput } from '../WizardInput';
import { FieldConfig, InputValue } from '@/types';
import { FieldTypes } from '@/components/QueryWizard/Components';
import { mockLogger } from '@/mocks/providers/LoggingProvider';

describe('WizardInput function', () => {
  vi.mock('@/providers', () => {
    return {
      useFieldDispatcher: () => vi.fn(),
      useLogger: () => {
        return mockLogger;
      },
    };
  });
  test('Should correctly render and handle interaction', () => {
    const mockField: FieldConfig = {
      category: 'targeting',
      fieldType: FieldTypes.WizardInput,
      value: undefined,
      placeholder: '/content',
      name: 'path',
      label: 'mockLabel',
      required: true,
    };
    const mockDefaultValue: InputValue = 'mock default value';

    render(<WizardInput field={mockField} defaultValue={mockDefaultValue} disabled={false} />);

    // Getting the rendered TextField by id
    const textField = screen.getByPlaceholderText('/content');

    // Checking if the component and initial props are correctly rendered
    expect(textField).toHaveProperty('value', mockDefaultValue);
    expect(textField).toHaveAttribute('name', mockField.name);
    expect(textField).toHaveAttribute('placeholder', mockField.placeholder);
    expect(textField).toHaveAttribute('required');

    const newInputValue = 'new mock value';

    // Emulating the input change
    fireEvent.change(textField, { target: { value: newInputValue } });

    // Checking if the input change event was correctly handled
    expect(textField).toHaveProperty('value', newInputValue);
  });

  test('Should correctly handle focus and blur events', () => {
    const mockField: FieldConfig = {
      category: 'targeting',
      fieldType: FieldTypes.WizardInput,
      value: undefined,
      placeholder: '/content',
      name: 'path',
      label: 'mockLabel',
      required: true,
    };
    const mockDefaultValue: InputValue = 'mock default value';

    render(<WizardInput field={mockField} defaultValue={mockDefaultValue} disabled={false} />);

    // Getting the rendered TextField by id
    const textField = screen.getByPlaceholderText('/content');

    // Checking initial focus
    expect(textField).not.toHaveFocus();
    expect(textField.parentNode).not.toHaveClass('Mui-focused');

    // Emulating the focus event
    fireEvent.focus(textField);

    // Checking if the onFocus handler was correctly executed
    expect(textField.parentNode).toHaveClass('Mui-focused');

    // Emulate the blur event
    fireEvent.blur(textField);

    // Checking if the onBlur handler was correctly executed
    expect(textField.parentNode).not.toHaveClass('Mui-focused');
  });
});

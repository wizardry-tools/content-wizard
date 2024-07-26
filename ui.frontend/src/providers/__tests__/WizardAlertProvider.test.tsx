import { render, screen, fireEvent } from '@testing-library/react';
import { WizardAlertProvider, useAlertContext, useAlertDispatcher } from '../WizardAlertProvider';
import { useLogger } from '../LoggingProvider';

jest.mock('../LoggingProvider');

const TestComponent = () => {
  const { message, severity } = useAlertContext();
  const dispatchAlert = useAlertDispatcher();

  return (
    <div>
      <button
        onClick={() => {
          dispatchAlert({
            message: 'Test Alert',
            severity: 'error',
            caller: TestComponent,
          });
        }}
      >
        Trigger Alert
      </button>
      <div data-testid="message">{message}</div>
      <div data-testid="severity">{severity}</div>
    </div>
  );
};

describe('WizardAlertProvider', () => {
  beforeEach(() => {
    (useLogger as jest.Mock).mockReturnValue({
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    });
  });

  test('provides default context values', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
      </WizardAlertProvider>,
    );
    expect(screen.getByTestId('message')).toHaveTextContent('');
    expect(screen.getByTestId('severity')).toHaveTextContent('info');
  });

  test('dispatches alert correctly', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
      </WizardAlertProvider>,
    );
    fireEvent.click(screen.getByText('Trigger Alert'));
    expect(screen.getByTestId('message')).toHaveTextContent('Test Alert');
    expect(screen.getByTestId('severity')).toHaveTextContent('error');
  });
});

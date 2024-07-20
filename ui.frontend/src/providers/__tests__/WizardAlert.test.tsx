import { render, screen, fireEvent, act } from '@testing-library/react';
import { WizardAlertProvider, WizardAlert, useAlertDispatcher } from '../WizardAlertProvider';
import { useLogger } from '../LoggingProvider';

jest.mock('../LoggingProvider');

const TestComponent = () => {
  const dispatchAlert = useAlertDispatcher();

  return (
    <button
      onClick={() =>
        dispatchAlert({
          message: 'Test Alert',
          severity: 'error',
          caller: TestComponent,
        })
      }
    >
      Trigger Alert
    </button>
  );
};

describe('WizardAlert', () => {
  beforeEach(() => {
    (useLogger as jest.Mock).mockReturnValue({
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    });
  });

  jest.useFakeTimers();

  test('displays alert message when triggered', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
        <WizardAlert />
      </WizardAlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  test('hides alert message after timeout', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
        <WizardAlert />
      </WizardAlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
  });

  test('does not hide alert message on hover', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
        <WizardAlert />
      </WizardAlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    fireEvent.mouseOver(screen.getByText('Test Alert'));
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  test('hides alert message when mouse leaves', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
        <WizardAlert />
      </WizardAlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));
    fireEvent.mouseOver(screen.getByText('Test Alert'));
    fireEvent.mouseLeave(screen.getByText('Test Alert'));
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
  });
});

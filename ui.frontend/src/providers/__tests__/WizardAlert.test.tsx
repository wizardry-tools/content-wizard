import { render, screen, fireEvent, act } from '@testing-library/react';
import { WizardAlertProvider, WizardAlert, useAlertDispatcher } from '@/providers';

vi.mock('./LoggingProvider');

const TestComponent = () => {
  const dispatchAlert = useAlertDispatcher();

  return (
    <button
      onClick={() => {
        dispatchAlert({
          message: 'Test Alert',
          severity: 'error',
        });
      }}
    >
      Trigger Alert
    </button>
  );
};

describe('WizardAlert', () => {
  vi.useFakeTimers();

  it('displays alert message when triggered', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
        <WizardAlert />
      </WizardAlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));
    expect(screen.getByText('Test Alert'));
  });

  it('hides alert message after timeout', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
        <WizardAlert />
      </WizardAlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
  });

  it('does not hide alert message on hover', () => {
    render(
      <WizardAlertProvider>
        <TestComponent />
        <WizardAlert />
      </WizardAlertProvider>,
    );

    fireEvent.click(screen.getByText('Trigger Alert'));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    fireEvent.mouseOver(screen.getByText('Test Alert'));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.getByText('Test Alert')).toBeInTheDocument();
  });

  it('hides alert message when mouse leaves', () => {
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
      vi.advanceTimersByTime(5000);
    });
    expect(screen.queryByText('Test Alert')).not.toBeInTheDocument();
  });
});

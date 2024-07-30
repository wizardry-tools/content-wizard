import { render, screen, fireEvent } from '@testing-library/react';
import { LoggingProvider } from '../LoggingProvider'; // Adjust the import as necessary
import { useLogger } from '../useLogger';

// Helper component to use the logger
const TestComponent = () => {
  const logger = useLogger();

  return (
    <div>
      <button
        onClick={() => {
          logger.log({ message: 'Log Message' });
        }}
      >
        Log
      </button>
      <button
        onClick={() => {
          logger.warn({ message: 'Warn Message' });
        }}
      >
        Warn
      </button>
      <button
        onClick={() => {
          logger.debug({ message: 'Debug Message' });
        }}
      >
        Debug
      </button>
      <button
        onClick={() => {
          logger.error({ message: 'Error Message' });
        }}
      >
        Error
      </button>
    </div>
  );
};

describe('LoggingProvider', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should log messages when buttons are clicked', () => {
    render(
      <LoggingProvider showLog={true} showDebug={true} showError={true} showWarn={true}>
        <TestComponent />
      </LoggingProvider>,
    );

    fireEvent.click(screen.getByText('Log'));
    fireEvent.click(screen.getByText('Warn'));
    fireEvent.click(screen.getByText('Debug'));
    fireEvent.click(screen.getByText('Error'));

    expect(console.log).toHaveBeenCalledWith('Log Message');
    expect(console.warn).toHaveBeenCalledWith('Warn Message');
    expect(console.debug).toHaveBeenCalledWith('Debug Message');
    expect(console.error).toHaveBeenCalledWith('Error Message');
  });

  it('should respect logging toggles', () => {
    render(
      <LoggingProvider>
        <TestComponent />
      </LoggingProvider>,
    );

    fireEvent.click(screen.getByText('Log'));
    fireEvent.click(screen.getByText('Warn'));
    fireEvent.click(screen.getByText('Debug'));
    fireEvent.click(screen.getByText('Error'));

    expect(console.log).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.debug).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should pass additional arguments correctly', () => {
    const logProps = { message: 'Log Message', additional: 'info' };
    const warnProps = { message: 'Warn Message', additional: 'info' };
    const debugProps = { message: 'Debug Message', additional: 'info' };
    const errorProps = { message: 'Error Message', additional: 'info' };

    const TestComponentWithArgs = () => {
      const logger = useLogger();

      return (
        <div>
          <button
            onClick={() => {
              logger.log(logProps);
            }}
          >
            Log
          </button>
          <button
            onClick={() => {
              logger.warn(warnProps);
            }}
          >
            Warn
          </button>
          <button
            onClick={() => {
              logger.debug(debugProps);
            }}
          >
            Debug
          </button>
          <button
            onClick={() => {
              logger.error(errorProps);
            }}
          >
            Error
          </button>
        </div>
      );
    };

    render(
      <LoggingProvider showLog={true} showDebug={true} showError={true} showWarn={true}>
        <TestComponentWithArgs />
      </LoggingProvider>,
    );

    fireEvent.click(screen.getByText('Log'));
    fireEvent.click(screen.getByText('Warn'));
    fireEvent.click(screen.getByText('Debug'));
    fireEvent.click(screen.getByText('Error'));

    expect(console.log).toHaveBeenCalledWith('Log Message', { additional: 'info' });
    expect(console.warn).toHaveBeenCalledWith('Warn Message', { additional: 'info' });
    expect(console.debug).toHaveBeenCalledWith('Debug Message', { additional: 'info' });
    expect(console.error).toHaveBeenCalledWith('Error Message', { additional: 'info' });
  });
});

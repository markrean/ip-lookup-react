import { render, screen, waitFor, act } from '@testing-library/react';
import { jest } from '@jest/globals';
import LocalTimeDisplay from '../LocalTimeDisplay';

const mockFormat = jest.fn();
const originalDateTimeFormat = Intl.DateTimeFormat;

beforeAll(() => {
  global.Intl.DateTimeFormat = jest.fn(() => ({
    format: mockFormat,
  })) as unknown as typeof Intl.DateTimeFormat;
});

afterAll(() => {
  global.Intl.DateTimeFormat = originalDateTimeFormat;
});

describe('LocalTimeDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockFormat.mockReturnValue('12:34:56');
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('should render nothing when isVisible is false', () => {
    const { container } = render(
      <LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when timeZone is undefined', () => {
    const { container } = render(<LocalTimeDisplay timeZone={undefined} isVisible={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render nothing when both isVisible is false and timeZone is undefined', () => {
    const { container } = render(<LocalTimeDisplay timeZone={undefined} isVisible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render time when isVisible is true and timeZone is provided', () => {
    render(<LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />);

    expect(mockFormat).toHaveBeenCalled();
    expect(screen.getByText('12:34:56')).toBeInTheDocument();
  });

  it('should create DateTimeFormat with correct options', () => {
    render(<LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />);

    expect(Intl.DateTimeFormat).toHaveBeenCalledWith(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'America/Los_Angeles',
    });
  });

  it('should update time every second', async () => {
    mockFormat
      .mockReturnValueOnce('12:34:56')
      .mockReturnValueOnce('12:34:57')
      .mockReturnValueOnce('12:34:58');

    render(<LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />);

    expect(screen.getByText('12:34:56')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.getByText('12:34:57')).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    await waitFor(() => {
      expect(screen.getByText('12:34:58')).toBeInTheDocument();
    });
  });

  it('should clear interval when component unmounts', () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const { unmount } = render(
      <LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />,
    );

    act(() => {
      unmount();
    });

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  it('should clear interval and reset when isVisible changes to false', async () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const { rerender } = render(
      <LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />,
    );

    expect(screen.getByText('12:34:56')).toBeInTheDocument();

    rerender(<LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={false} />);

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(screen.queryByText('12:34:56')).not.toBeInTheDocument();
    clearIntervalSpy.mockRestore();
  });

  it('should clear interval and reset when timeZone changes', async () => {
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');
    const { rerender } = render(
      <LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />,
    );

    expect(screen.getByText('12:34:56')).toBeInTheDocument();

    rerender(<LocalTimeDisplay timeZone="Europe/London" isVisible={true} />);

    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(Intl.DateTimeFormat).toHaveBeenCalledWith(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Europe/London',
    });
    clearIntervalSpy.mockRestore();
  });

  it('should format current date on each tick', () => {
    const mockDate = new Date('2024-01-01T12:34:56Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as Date);

    render(<LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />);

    expect(mockFormat).toHaveBeenCalledWith(mockDate);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(mockFormat).toHaveBeenCalledTimes(2);
    expect(mockFormat).toHaveBeenLastCalledWith(mockDate);

    jest.restoreAllMocks();
  });

  it('should render Typography with correct props', () => {
    render(<LocalTimeDisplay timeZone="America/Los_Angeles" isVisible={true} />);

    const typography = screen.getByText('12:34:56');
    expect(typography).toHaveClass('MuiTypography-body2');
  });
});

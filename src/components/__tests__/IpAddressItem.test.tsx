import { render, screen, fireEvent } from '@testing-library/react';
import IpAddressItem from '../IpAddressItem';
import type { IpEntry } from '../../hooks/useIpLookupEntries';

jest.mock('../LocalTimeDisplay', () => {
  return function MockLocalTimeDisplay({ isVisible }: { isVisible: boolean; timeZone?: string }) {
    return isVisible ? <div data-testid="local-time">12:34:56</div> : null;
  };
});

describe('IpAddressItem', () => {
  const mockOnChange = jest.fn();
  const mockOnLookup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (entry: IpEntry, index = 0) => {
    return render(
      <IpAddressItem index={index} entry={entry} onChange={mockOnChange} onLookup={mockOnLookup} />,
    );
  };

  describe('rendering', () => {
    it('should render index number', () => {
      const entry: IpEntry = { value: '', status: 'idle' };
      renderComponent(entry, 0);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should render correct index number', () => {
      const entry: IpEntry = { value: '', status: 'idle' };
      renderComponent(entry, 2);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should render TextField with entry value', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'idle' };
      renderComponent(entry);

      const input = screen.getByDisplayValue('8.8.8.8');
      expect(input).toBeInTheDocument();
    });

    it('should render loading spinner when status is loading', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'loading' };
      renderComponent(entry);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should render flag and time when status is success', () => {
      const entry: IpEntry = {
        value: '8.8.8.8',
        status: 'success',
        countryCode: 'US',
        timeZone: 'America/Los_Angeles',
      };
      renderComponent(entry);

      expect(screen.getByTestId('local-time')).toBeInTheDocument();
    });

    it('should render error helper text when status is error', () => {
      const entry: IpEntry = {
        value: '8.8.8.8',
        status: 'error',
        error: 'Invalid IP address',
      };
      renderComponent(entry);

      expect(screen.getByText('Invalid IP address')).toBeInTheDocument();
    });
  });

  describe('input handling', () => {
    it('should disable input when status is loading', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'loading' };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should enable input when status is not loading', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'idle' };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
    });

    it('should show error state when status is error', () => {
      const entry: IpEntry = {
        value: '8.8.8.8',
        status: 'error',
        error: 'Invalid IP',
      };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('lookup triggers', () => {
    it('should call onLookup on blur when not loading', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'idle' };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(mockOnLookup).toHaveBeenCalledTimes(1);
    });

    it('should not call onLookup on blur when loading', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'loading' };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(mockOnLookup).not.toHaveBeenCalled();
    });

    it('should call onLookup on Enter key when not loading', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'idle' };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnLookup).toHaveBeenCalledTimes(1);
    });

    it('should not call onLookup on Enter key when loading', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'loading' };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnLookup).not.toHaveBeenCalled();
    });

    it('should not call onLookup on other keys', () => {
      const entry: IpEntry = { value: '8.8.8.8', status: 'idle' };
      renderComponent(entry);

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Escape' });

      expect(mockOnLookup).not.toHaveBeenCalled();
    });
  });

  describe('success state', () => {
    it('should render flag when countryCode is provided', () => {
      const entry: IpEntry = {
        value: '8.8.8.8',
        status: 'success',
        countryCode: 'US',
        timeZone: 'America/Los_Angeles',
      };
      renderComponent(entry);

      expect(screen.getByTestId('local-time')).toBeInTheDocument();
    });

    it('should not render flag when countryCode is not provided', () => {
      const entry: IpEntry = {
        value: '8.8.8.8',
        status: 'success',
        timeZone: 'America/Los_Angeles',
      };
      renderComponent(entry);

      expect(screen.getByTestId('local-time')).toBeInTheDocument();
    });

    it('should render LocalTimeDisplay when status is success', () => {
      const entry: IpEntry = {
        value: '8.8.8.8',
        status: 'success',
        timeZone: 'America/Los_Angeles',
      };
      renderComponent(entry);

      expect(screen.getByTestId('local-time')).toBeInTheDocument();
    });
  });
});

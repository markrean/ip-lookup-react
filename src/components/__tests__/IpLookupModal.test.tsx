import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IpLookupModal from '../IpLookupModal';
import { useIpLookupEntries } from '../../hooks/useIpLookupEntries';

jest.mock('../../hooks/useIpLookupEntries');

jest.mock('../LocalTimeDisplay', () => {
  return function MockLocalTimeDisplay({ isVisible }: { isVisible: boolean; timeZone?: string }) {
    return isVisible ? <div data-testid="local-time">12:34:56</div> : null;
  };
});

const mockUseIpLookupEntries = useIpLookupEntries as jest.MockedFunction<typeof useIpLookupEntries>;

describe('IpLookupModal', () => {
  const mockOnClose = jest.fn();
  const mockAddEntry = jest.fn();
  const mockChangeEntryValue = jest.fn();
  const mockLookupEntry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIpLookupEntries.mockReturnValue({
      entries: [{ value: '', status: 'idle' }],
      addEntry: mockAddEntry,
      changeEntryValue: mockChangeEntryValue,
      lookupEntry: mockLookupEntry,
    });
  });

  describe('rendering', () => {
    it('should render modal with title', () => {
      render(<IpLookupModal onClose={mockOnClose} />);

      expect(screen.getByText('IP Lookup')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should render description text', () => {
      render(<IpLookupModal onClose={mockOnClose} />);

      expect(
        screen.getByText('Enter one or more IP addresses and get their country.'),
      ).toBeInTheDocument();
    });

    it('should render Add button', () => {
      render(<IpLookupModal onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<IpLookupModal onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close IP lookup');
      expect(closeButton).toBeInTheDocument();
    });

    it('should render IpAddressItem for each entry', () => {
      mockUseIpLookupEntries.mockReturnValue({
        entries: [
          { value: '8.8.8.8', status: 'idle' },
          { value: '1.1.1.1', status: 'idle' },
        ],
        addEntry: mockAddEntry,
        changeEntryValue: mockChangeEntryValue,
        lookupEntry: mockLookupEntry,
      });

      render(<IpLookupModal onClose={mockOnClose} />);

      expect(screen.getByDisplayValue('8.8.8.8')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1.1.1.1')).toBeInTheDocument();
    });
  });

  describe('Add button', () => {
    it('should be enabled when no entries have empty values', () => {
      mockUseIpLookupEntries.mockReturnValue({
        entries: [{ value: '8.8.8.8', status: 'idle' }],
        addEntry: mockAddEntry,
        changeEntryValue: mockChangeEntryValue,
        lookupEntry: mockLookupEntry,
      });

      render(<IpLookupModal onClose={mockOnClose} />);

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).not.toBeDisabled();
    });

    it('should be disabled when any entry has empty value', () => {
      mockUseIpLookupEntries.mockReturnValue({
        entries: [{ value: '', status: 'idle' }],
        addEntry: mockAddEntry,
        changeEntryValue: mockChangeEntryValue,
        lookupEntry: mockLookupEntry,
      });

      render(<IpLookupModal onClose={mockOnClose} />);

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeDisabled();
    });

    it('should be disabled when any entry has whitespace-only value', () => {
      mockUseIpLookupEntries.mockReturnValue({
        entries: [{ value: '   ', status: 'idle' }],
        addEntry: mockAddEntry,
        changeEntryValue: mockChangeEntryValue,
        lookupEntry: mockLookupEntry,
      });

      render(<IpLookupModal onClose={mockOnClose} />);

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeDisabled();
    });

    it('should call addEntry when clicked', async () => {
      const user = userEvent.setup();
      mockUseIpLookupEntries.mockReturnValue({
        entries: [{ value: '8.8.8.8', status: 'idle' }],
        addEntry: mockAddEntry,
        changeEntryValue: mockChangeEntryValue,
        lookupEntry: mockLookupEntry,
      });

      render(<IpLookupModal onClose={mockOnClose} />);

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      expect(mockAddEntry).toHaveBeenCalledTimes(1);
    });
  });

  describe('close button', () => {
    it('should call onClose when clicked', async () => {
      const user = userEvent.setup();
      render(<IpLookupModal onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close IP lookup');
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('entry interactions', () => {
    it('should call changeEntryValue when entry value changes', async () => {
      const user = userEvent.setup();
      render(<IpLookupModal onClose={mockOnClose} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '8.8.8.8');

      expect(mockChangeEntryValue).toHaveBeenCalled();
    });

    it('should call lookupEntry when entry blur occurs', () => {
      render(<IpLookupModal onClose={mockOnClose} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(mockLookupEntry).toHaveBeenCalledWith(0);
    });

    it('should call lookupEntry with correct index for multiple entries', () => {
      mockUseIpLookupEntries.mockReturnValue({
        entries: [
          { value: '8.8.8.8', status: 'idle' },
          { value: '1.1.1.1', status: 'idle' },
        ],
        addEntry: mockAddEntry,
        changeEntryValue: mockChangeEntryValue,
        lookupEntry: mockLookupEntry,
      });

      render(<IpLookupModal onClose={mockOnClose} />);

      const inputs = screen.getAllByRole('textbox');
      fireEvent.blur(inputs[1]);

      expect(mockLookupEntry).toHaveBeenCalledWith(1);
    });
  });

  describe('modal behavior', () => {
    it('should have correct ARIA attributes', () => {
      render(<IpLookupModal onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'ip-lookup-title');
    });

    it('should render modal as open', () => {
      render(<IpLookupModal onClose={mockOnClose} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});

import { renderHook, act, waitFor } from '@testing-library/react';
import { useIpLookupEntries } from '../useIpLookupEntries';

global.fetch = jest.fn();

describe('useIpLookupEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should initialize with one empty entry', () => {
      const { result } = renderHook(() => useIpLookupEntries());

      expect(result.current.entries).toHaveLength(1);
      expect(result.current.entries[0]).toEqual({
        value: '',
        status: 'idle',
      });
    });
  });

  describe('addEntry', () => {
    it('should add a new empty entry', () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.addEntry();
      });

      expect(result.current.entries).toHaveLength(2);
      expect(result.current.entries[1]).toEqual({
        value: '',
        status: 'idle',
      });
    });

    it('should add multiple entries', () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.addEntry();
        result.current.addEntry();
      });

      expect(result.current.entries).toHaveLength(3);
    });
  });

  describe('changeEntryValue', () => {
    it('should update the value of an entry', () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.changeEntryValue(0, '8.8.8.8');
      });

      expect(result.current.entries[0].value).toBe('8.8.8.8');
      expect(result.current.entries[0].status).toBe('idle');
    });

    it('should reset entry metadata when value changes', () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.changeEntryValue(0, '8.8.8.8');
      });

      act(() => {
        result.current.changeEntryValue(0, '1.1.1.1');
      });

      expect(result.current.entries[0].value).toBe('1.1.1.1');
      expect(result.current.entries[0].error).toBeUndefined();
      expect(result.current.entries[0].location).toBeUndefined();
      expect(result.current.entries[0].timeZone).toBeUndefined();
      expect(result.current.entries[0].countryCode).toBeUndefined();
    });

    it('should only update the specified entry', () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.addEntry();
        result.current.changeEntryValue(0, '8.8.8.8');
        result.current.changeEntryValue(1, '1.1.1.1');
      });

      expect(result.current.entries[0].value).toBe('8.8.8.8');
      expect(result.current.entries[1].value).toBe('1.1.1.1');
    });
  });

  describe('lookupEntry - validation', () => {
    it('should return early if entry does not exist', async () => {
      const { result } = renderHook(() => useIpLookupEntries());

      await act(async () => {
        await result.current.lookupEntry(999);
      });

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should set error status for empty value', async () => {
      const { result } = renderHook(() => useIpLookupEntries());

      await act(async () => {
        await result.current.lookupEntry(0);
      });

      expect(result.current.entries[0].status).toBe('error');
      expect(result.current.entries[0].error).toBe('Please enter an IP address before searching.');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should set error status for whitespace-only value', async () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.changeEntryValue(0, '   ');
      });

      await act(async () => {
        await result.current.lookupEntry(0);
      });

      expect(result.current.entries[0].status).toBe('error');
      expect(result.current.entries[0].error).toBe('Please enter an IP address before searching.');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should set error status for invalid IP format', async () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.changeEntryValue(0, 'invalid-ip');
      });

      await act(async () => {
        await result.current.lookupEntry(0);
      });

      expect(result.current.entries[0].status).toBe('error');
      expect(result.current.entries[0].error).toBe('Enter a valid IPv4 address (e.g. 8.8.8.8).');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should set error status for IPs out of range', async () => {
      const { result } = renderHook(() => useIpLookupEntries());

      act(() => {
        result.current.changeEntryValue(0, '256.256.256.256');
      });

      await act(async () => {
        await result.current.lookupEntry(0);
      });

      expect(result.current.entries[0].status).toBe('error');
      expect(result.current.entries[0].error).toBe('Enter a valid IPv4 address (e.g. 8.8.8.8).');
      expect(global.fetch).not.toHaveBeenCalled();
    });

  });

  describe('lookupEntry - API calls', () => {
    it('should set loading status before API call', async () => {
      const { result } = renderHook(() => useIpLookupEntries());
      const mockResponse = {
        city: 'Mountain View',
        region: 'California',
        country_name: 'United States',
        timezone: 'America/Los_Angeles',
        country_code: 'us',
      };

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(
        promise.then((data) => ({
          ok: true,
          json: async () => data,
        })),
      );

      act(() => {
        result.current.changeEntryValue(0, '8.8.8.8');
      });

      act(() => {
        result.current.lookupEntry(0);
      });

      await waitFor(() => {
        expect(result.current.entries[0].status).toBe('loading');
      });

      await act(async () => {
        resolvePromise!(mockResponse);
        await promise;
      });
    });

    it('should not update entry if value changed during lookup', async () => {
      const { result } = renderHook(() => useIpLookupEntries());
      const mockResponse = {
        city: 'Mountain View',
        region: 'California',
        country_name: 'United States',
        timezone: 'America/Los_Angeles',
        country_code: 'us',
      };

      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(
        promise.then((data) => ({
          ok: true,
          json: async () => data,
        })),
      );

      act(() => {
        result.current.changeEntryValue(0, '8.8.8.8');
      });

      act(() => {
        result.current.lookupEntry(0);
      });

      act(() => {
        result.current.changeEntryValue(0, '1.1.1.1');
      });

      await act(async () => {
        resolvePromise!(mockResponse);
        await promise;
      });

      await waitFor(() => {
        expect(result.current.entries[0].status).toBe('idle');
        expect(result.current.entries[0].value).toBe('1.1.1.1');
        expect(result.current.entries[0].location).toBeUndefined();
      });
    });
  });
});


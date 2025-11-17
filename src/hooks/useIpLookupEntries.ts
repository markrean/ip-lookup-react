import { useCallback, useState, useRef, useEffect } from 'react';

type LookupStatus = 'idle' | 'loading' | 'success' | 'error';

export interface IpEntry {
  value: string;
  status: LookupStatus;
  error?: string;
  location?: string;
  timeZone?: string;
  countryCode?: string;
}

const IPv4_REGEX = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

export const useIpLookupEntries = () => {
  const [entries, setEntries] = useState<IpEntry[]>([{ value: '', status: 'idle' }]);
  const entriesRef = useRef(entries);
  
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);

  const addEntry = useCallback(() => {
    setEntries((prev) => [...prev, { value: '', status: 'idle' }]);
  }, []);

  const changeEntryValue = useCallback((index: number, value: string) => {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              value,
              status: 'idle',
              error: undefined,
              location: undefined,
              timeZone: undefined,
              countryCode: undefined,
            }
          : entry,
      ),
    );
  }, []);

  const lookupEntry = useCallback(async (index: number) => {
    // Get the current entry value synchronously from ref
    const currentEntry = entriesRef.current[index];
    if (!currentEntry) {
      return;
    }

    const trimmed = currentEntry.value.trim();

    if (!trimmed) {
      setEntries((prev) =>
        prev.map((entry, i) =>
          i === index
            ? {
                ...entry,
                status: 'error',
                error: 'Please enter an IP address before searching.',
                location: undefined,
                timeZone: undefined,
                countryCode: undefined,
              }
            : entry,
        ),
      );
      return;
    }

    if (!IPv4_REGEX.test(trimmed)) {
      setEntries((prev) =>
        prev.map((entry, i) =>
          i === index
            ? {
                ...entry,
                status: 'error',
                error: 'Enter a valid IPv4 address (e.g. 8.8.8.8).',
                location: undefined,
                timeZone: undefined,
                countryCode: undefined,
              }
            : entry,
        ),
      );
      return;
    }

    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              status: 'loading',
              error: undefined,
              location: undefined,
              timeZone: undefined,
            }
          : entry,
      ),
    );

    try {
      const response = await fetch(`https://ipapi.co/${trimmed}/json/`);
      if (!response.ok) {
        throw new Error('Lookup failed. Please try again.');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.reason || 'Unable to find that IP address.');
      }

      const locationParts = [data.city, data.region, data.country_name].filter(Boolean);
      const location = locationParts.join(', ') || 'Location unavailable';
      const timeZone: string | undefined = data.timezone || undefined;

      setEntries((prev) =>
        prev.map((entry, i) => {
          if (i !== index) {
            return entry;
          }

          if (entry.value.trim() !== trimmed) {
            return entry;
          }

          return {
            ...entry,
            status: 'success',
            error: undefined,
            location,
            timeZone,
            countryCode: data.country_code?.toUpperCase(),
          };
        }),
      );
    } catch (error) {
      setEntries((prev) =>
        prev.map((entry, i) => {
          if (i !== index) {
            return entry;
          }

          return {
            ...entry,
            status: 'error',
            error:
              error instanceof Error
                ? error.message
                : 'Something went wrong while looking up that IP address.',
            location: undefined,
            timeZone: undefined,
          };
        }),
      );
    }
  }, []);

  return {
    entries,
    addEntry,
    changeEntryValue,
    lookupEntry,
  };
};

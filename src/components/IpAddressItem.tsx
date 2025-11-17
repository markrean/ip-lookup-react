import { useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { IpEntry } from '../hooks/useIpLookupEntries';
import * as Flags from 'country-flag-icons/react/3x2';
import LocalTimeDisplay from './LocalTimeDisplay';

const IP_ALLOWED_PATTERN = /[^0-9.]/g;

interface IpAddressItemProps {
  index: number;
  entry: IpEntry;
  onChange: (value: string) => void;
  onLookup: () => void;
}

const IpAddressItem = ({ index, entry, onChange, onLookup }: IpAddressItemProps) => {
  const handleChange = useCallback(
    (input: string) => {
      const sanitized = input.replace(IP_ALLOWED_PATTERN, '');
      onChange(sanitized);
    },
    [onChange],
  );

  const flagMap = Flags as Record<string, React.ComponentType<{ width?: number }>>;
  const Flag = entry.countryCode ? flagMap[entry.countryCode] : undefined;

  const isLoading = entry.status === 'loading';
  const isError = entry.status === 'error';
  const isSuccess = entry.status === 'success';

  const helperText = useMemo(() => (isError ? entry.error : undefined), [isError, entry.error]);

  return (
    <Stack spacing={1} alignItems="flex-start">
      <Box display="flex" alignItems="center" gap={1} width="100%" sx={{ pb: 2.5 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: 'var(--badge-bg)',
            color: 'var(--badge-text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '0.9rem',
            flex: '0 0 auto',
          }}
        >
          {index + 1}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            height: 30,
          }}
        >
          <TextField
            size="small"
            value={entry.value}
            disabled={isLoading}
            error={isError}
            helperText={helperText}
            onChange={(event) => handleChange(event.target.value)}
            onBlur={() => {
              if (!isLoading) {
                onLookup();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                if (!isLoading) {
                  onLookup();
                }
              }
            }}
            placeholder=""
            slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9.]+' } }}
            sx={{
              width: 'min(300px, 200px)',
              '& .MuiInputBase-root': {
                height: 30,
              },
              '& .MuiInputBase-input': {
                fontSize: '0.9rem',
                padding: '0 8px',
                height: 30,
                boxShadow: 'none',
              },
              '& .MuiFormHelperText-root': {
                margin: 0,
              },
              '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 1,
              }
            }}
          />
        </Box>

        {entry.status === 'loading' && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress
              size={20}
              color="primary"
              sx={{
                color: 'black',
                animationDuration: '3s',

                '& .MuiCircularProgress-circle': {
                  animation: 'none',
                  strokeLinecap: 'round',
                  strokeWidth: 4,
                  strokeDasharray: '6 12',
                },
              }}
            />
          </Stack>
        )}

        {isSuccess && (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            {Flag && (
              <Box sx={{ borderRadius: 0.5, overflow: 'hidden', display: 'inline-flex' }}>
                <Flag width={28} />
              </Box>
            )}
            <LocalTimeDisplay timeZone={entry.timeZone} isVisible={isSuccess} />
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default IpAddressItem;

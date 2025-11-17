import { useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import IpAddressItem from './IpAddressItem';
import { useIpLookupEntries } from '../hooks/useIpLookupEntries';

interface IpLookupModalProps {
  onClose: () => void;
}

const ModalHeader = styled(Box)(() => ({
  display: 'flex',
  flex: 0,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: '1px solid var(--border-color)',
  padding: '8px',
  paddingInlineStart: '16px',
}));

const ModalBody = styled(Box)(() => ({
  padding: '16px',
  overflow: 'auto',
}));

const IpLookupModal = ({ onClose }: IpLookupModalProps) => {
  const { entries, addEntry, changeEntryValue, lookupEntry } = useIpLookupEntries();
  const isAddDisabled = entries.some((entry) => entry.value.trim() === '');

  const handleBlurLookup = useCallback(
    (index: number) => {
      void lookupEntry(index);
    },
    [lookupEntry],
  );

  return (
    <Modal open onClose={onClose} aria-labelledby="ip-lookup-title">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Box
          role="dialog"
          aria-modal="true"
          aria-labelledby="ip-lookup-title"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            width: 'min(480px, 90%)',
            maxHeight: 'calc(100vh - 36px)',
            bgcolor: 'background.paper',
            borderRadius: '6px',
          }}
        >
          <ModalHeader>
            <Typography
              id="ip-lookup-title"
              variant="h6"
              fontSize="16px"
              fontWeight={700}
              color="text.primary"
            >
              IP Lookup
            </Typography>
            <IconButton aria-label="Close IP lookup" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </ModalHeader>

          <ModalBody sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Enter one or more IP addresses and get their country.
            </Typography>

            <Button
              type="button"
              variant="contained"
              disableElevation
              disabled={isAddDisabled}
              onClick={addEntry}
              sx={{
                display: 'flex',
                gap: 1,
                alignSelf: 'flex-start',
                borderRadius: 1,
                backgroundColor: 'var(--button-bg-primary)',
                color: 'var(--button-text-color)',
                fontWeight: 600,
                textTransform: 'none',
                px: 1.5,
                py: 0.5,
                paddingInlineEnd: 2.5,
                '&:hover:not(:disabled)': {
                  backgroundColor: 'var(--button-bg-hover)'
                },
                '&.Mui-disabled': {
                  color: 'var(--button-text-color)',
                  backgroundColor: 'var(--button-bg-disabled)'
                },
              }}
            >
              <AddIcon fontSize="small" /> Add
            </Button>

            <Divider />

            <Stack direction="column" spacing={1.5} sx={{ flex: 1 }}>
              {entries.map((entry, index) => (
                <IpAddressItem
                  key={index}
                  index={index}
                  entry={entry}
                  onChange={(value) => changeEntryValue(index, value)}
                  onLookup={() => handleBlurLookup(index)}
                />
              ))}
            </Stack>
          </ModalBody>
        </Box>
      </Box>
    </Modal>
  );
};

export default IpLookupModal;

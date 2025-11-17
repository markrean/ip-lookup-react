import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

interface OpenIpLookupButtonProps {
  onClick: () => void;
}

const OpenModalButton = styled(Button)(() => ({
  borderRadius: 6,
  paddingBlock: '0.9em',
  paddingInline: '2.4em',
  fontWeight: 600,
  backgroundColor: 'var(--button-bg-primary)',
  color: 'var(--button-text-color)',
  '&:hover': {
    backgroundColor: 'var(--button-bg-hover)',
  },
  '&:focus-visible': {
    outline: 0
  },
}));

const OpenIpLookupButton = ({ onClick }: OpenIpLookupButtonProps) => {
  return (
    <OpenModalButton type="button" variant="contained" disableElevation onClick={onClick}>
      Open IP Lookup
    </OpenModalButton>
  );
};

export default OpenIpLookupButton;

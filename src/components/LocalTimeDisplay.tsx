import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';

interface LocalTimeDisplayProps {
  timeZone?: string;
  isVisible: boolean;
}

const LocalTimeDisplay = ({ timeZone, isVisible }: LocalTimeDisplayProps) => {
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    if (!isVisible || !timeZone) {
      setLocalTime('');
      return;
    }

    const formatter = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone,
    });

    const tick = () => {
      setLocalTime(formatter.format(new Date()));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isVisible, timeZone]);

  if (!localTime) {
    return null;
  }

  return (
    <Typography variant="body2" color="text.secondary">
      {localTime}
    </Typography>
  );
};

export default LocalTimeDisplay;

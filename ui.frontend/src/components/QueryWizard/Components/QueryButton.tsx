import { useEffect, useState } from 'react';
import { Fab, SvgIcon, Typography } from '@mui/material';
import type { QueryButtonProps } from '@/types';
import { RunIcon } from '@/icons';
import { useAlertContext } from '@/providers';

export const QueryButton = ({ isRunning = false, disabled = false, onClick = () => ({}) }: QueryButtonProps) => {
  const alert = useAlertContext();
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);

  const buttonText = () => {
    return `${!isRunning ? 'Run ' : ''}Query ${isRunning ? 'Running' : ''}`;
  };

  const mouseEnter = () => {
    setHover(true);
  };

  const mouseLeave = () => {
    setHover(false);
  };

  useEffect(() => {
    if (hover) {
      setOpen(true);
      return;
    }
    function onTimeout() {
      setOpen(false);
    }
    const timeoutId = setTimeout(onTimeout, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [hover]);

  return (
    <Fab
      name="run-query"
      className={`query-handler-button ${open ? 'query-button-hover' : 'query-button-hide'}`}
      variant="extended"
      color="secondary"
      onClick={onClick}
      disabled={disabled || isRunning || !!alert.message}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      <SvgIcon
        component={RunIcon}
        inheritViewBox
        className={`query-button-icon ${open ? 'query-button-hover' : 'query-button-hide'}`}
      />
      <Typography className={open ? 'query-button-hover' : 'query-button-hide'}>{buttonText()}</Typography>
    </Fab>
  );
};

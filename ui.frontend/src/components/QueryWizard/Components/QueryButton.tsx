import {Fab, SvgIcon, Typography} from "@mui/material";
import {RunIcon} from "src/icons";
import {MouseEvent, useRef, useState} from "react";
import {useAlertContext} from "src/providers";


interface QueryButtonProps {
  isRunning: boolean;
  disabled: boolean;
  onClick: ()=>void;
}


export const QueryButton = ({isRunning = false, disabled = false, onClick = ()=>{}}: QueryButtonProps) => {

  const alert = useAlertContext();
  const [hover, setHover] = useState(false);

  const timer = useRef<number | null>(null);

  const buttonText = () => {
    return `${!isRunning ? 'Run ' : ''}Query ${isRunning ? 'Running' : ''}`;
  }


  const mouseEnter = (_e: MouseEvent) => {
    setHover(true);
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
  }

  const mouseLeave = (_e: MouseEvent) => {
    if (timer.current) {
      window.clearTimeout(timer.current);
    }
    timer.current = window.setTimeout(()=>{
      setHover(false);
    }, 500);

  }

  return(
      <Fab
        name="run-query"
        className={`query-handler-button ${hover?'query-button-hover':'query-button-hide'}`}
        variant="extended"
        color="secondary"
        onClick={onClick}
        disabled={disabled || isRunning || !!alert.message}
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}
      >
        <SvgIcon component={RunIcon} inheritViewBox className={`query-button-icon ${hover?'query-button-hover':'query-button-hide'}`}/>
        <Typography
          className={`${hover?'query-button-hover':'query-button-hide'}`}
        >
          {buttonText()}
        </Typography>
      </Fab>
  );
}

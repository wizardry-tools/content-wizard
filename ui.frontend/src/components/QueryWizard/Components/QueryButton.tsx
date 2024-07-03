import {Fab, SvgIcon, Typography} from "@mui/material";
import {RunIcon} from "../../../icons";
import {MouseEvent, useState} from "react";


interface QueryButtonProps {
  isRunning: boolean;
  disabled: boolean;
  onClick: ()=>void;
}


export const QueryButton = ({isRunning = false, disabled = false, onClick = ()=>{}}: QueryButtonProps) => {

  const [hover, setHover] = useState(false);

  const buttonText = () => {
    return `${!isRunning ? 'Run ' : ''}Query ${isRunning ? 'Running' : ''}`;
  }


  const mouseEnter = (_e: MouseEvent) => {
    setHover(true);

  }

  const mouseLeave = (_e: MouseEvent) => {
    setTimeout(()=>{
      setHover(false);
    }, 500);

  }

  // TODO: The animation doesn't work, need to figure it out.

  return(
      <Fab
        name="run-query"
        className={`query-handler-button ${hover?'query-button-hover':'query-button-hide'}`}
        variant="extended"
        color="secondary"
        onClick={onClick}
        disabled={disabled || isRunning}
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

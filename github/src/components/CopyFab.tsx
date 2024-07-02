import {MouseEvent, useCallback, useState} from "react";
import {Fab, Popover, SvgIcon, Tooltip, Typography} from "@mui/material";
import {ReactComponent as CopyIcon} from "../icons/copy.svg";


const CopyFab = (props:any) => {
  const {hover, onClick} = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [clicked, setClicked] = useState(false);

  const openPopover = useCallback((e: MouseEvent) => {
    setAnchorEl(e.currentTarget as HTMLElement);
  },[]);
  const closePopover = useCallback(() => {
    setAnchorEl(null);
    setClicked(false);
  },[]);
  const onMouseOver = useCallback((e: MouseEvent) => {
    setClicked(false);
    openPopover(e);
  },[openPopover]);
  const onFabClick = useCallback((e: MouseEvent) => {
    setClicked(true);
    onClick(e);
  },[onClick]);

  const openSuccess = (anchorEl && clicked) || false;

  return(
    <span className={`clipboard`}>
      <Tooltip
        id="clipboard-copy-tooltip"
        title={"Copy code snippet"}
      >
        <Fab
          className={`clipboard-fab ${
            hover ? 'show fade-in' : 'hide fade-out'
          }`}
          onClick={onFabClick}
          onMouseOver={onMouseOver}
          onMouseLeave={closePopover}
        >
          <SvgIcon
            component={CopyIcon}
            inheritViewBox={true}
          />
        </Fab>
      </Tooltip>
      <Popover
        id="clipboard-copy-success-popover"
        anchorEl={anchorEl}
        open={openSuccess}
        onClose={closePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Typography className="message">
          Code snippet copied!
        </Typography>
      </Popover>
    </span>
  );
};

export default CopyFab;
import {MouseEvent, useCallback, useState} from "react";
import {Fab, Popover, SvgIcon} from "@mui/material";
import {ReactComponent as CopyIcon} from "../icons/copy.svg";


const CopyFab = (props:any) => {
  const {hover, onClick} = props;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mouseOver, setMouseOver] = useState(false);
  const [clicked, setClicked] = useState(false);

  const openPopover = useCallback((e: MouseEvent) => {
    setAnchorEl(e.currentTarget as HTMLElement);
  },[]);
  const closePopover = useCallback(() => {
    setAnchorEl(null);
    setClicked(false);
  },[]);
  const onMouseOver = useCallback((e: MouseEvent) => {
    setMouseOver(true);
    setClicked(false);
    openPopover(e);
  },[]);
  const onFabClick = useCallback((e: MouseEvent) => {
    setClicked(true);
    setMouseOver(false);
    onClick(e);
  },[]);

  const openToolTip = Boolean(anchorEl && mouseOver);
  const openSuccess = Boolean(anchorEl && clicked);

  return(
    <span className={`clipboard`}>
      <Fab
        className={`clipboard-fab ${
          hover ? 'show fade-in' : 'hide fade-out'
        }`}
        onClick={onFabClick}
        onMouseOver={onMouseOver}
        onMouseLeave={closePopover}
        title="Copy code snippet"
      >
        <SvgIcon
          component={CopyIcon}
          inheritViewBox={true}
        />
      </Fab>
      <Popover
        id="clipboard-copy-tooltip-popover"
        anchorEl={anchorEl}
        open={openToolTip}
        onClose={closePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          pointerEvents: 'none',
        }}
      >
        Copy code snippet
      </Popover>
      <Popover
        id="clipboard-copy-success-popover"
        anchorEl={anchorEl}
        open={openSuccess}
        onClose={closePopover}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        sx={{
          pointerEvents: 'none',
        }}
      >
        Code snippet copied!
      </Popover>
    </span>
  );
};

export default CopyFab;
import Box from '@mui/material/Box';
import {Direction} from "@mui/system";
import {styled} from "@mui/material/styles";

type TabPanelProps = {
  children: any;
  index: number;
  value: number;
  dir: Direction;
  padding?: number;
};

const StyledBox = styled(Box)({
});

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, padding = 3, ...other } = props;

  return (
    <StyledBox
      role="tabpanel"
      className="query-wizard-content-panel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      sx={{ p: padding }}
      {...other}
    >
      {children}
    </StyledBox>
  )
}

export default TabPanel;

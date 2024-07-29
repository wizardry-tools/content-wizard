import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { TabPanelProps } from '@/types';

const StyledBox = styled(Box)({});

export const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, padding = 3, ...other } = props;

  return (
    <StyledBox
      role="tabpanel"
      className="content-wizard-content-panel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      sx={{ p: padding }}
      {...other}
    >
      {children}
    </StyledBox>
  );
};

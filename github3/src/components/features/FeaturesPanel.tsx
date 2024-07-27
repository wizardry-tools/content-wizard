import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FeaturesPanelProps } from '@/types';

const StyledBox = styled(Box)({});

export const FeaturesPanel = (props: FeaturesPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <StyledBox
      role="tabpanel"
      className="features-tabpanel"
      hidden={value !== index}
      id={`features-tabpanel-${index}`}
      aria-labelledby={`features-tab-${index}`}
      pl={'0.5rem'}
      {...other}
    >
      {children}
    </StyledBox>
  );
};

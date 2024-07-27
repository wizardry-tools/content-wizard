import { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import { Direction } from '@mui/system';
import { styled } from '@mui/material/styles';

type FeaturesPanelProps = PropsWithChildren & {
  index: number;
  value: number;
  dir: Direction;
  padding?: number;
};

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

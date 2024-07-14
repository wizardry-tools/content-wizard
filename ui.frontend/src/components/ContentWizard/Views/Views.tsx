import { SwipeableViews } from 'src/components/SwipeableViews';
import { TabPanel } from '../TabPanel';
import { ResultHandler } from 'src/components/Results';
import { useTheme } from '@mui/material/styles';
import { IDE } from 'src/components/IDE';
import Box from '@mui/material/Box';
import { QueryWizard } from 'src/components/QueryWizard';
import { useLogger } from 'src/providers';

export type ViewsProps = {
  tabValue: number;
  onTabPanelSelect: (index: number) => void;
};

export function Views({ tabValue, onTabPanelSelect }: ViewsProps) {
  const logger = useLogger();
  logger.debug({ message: 'ContentWizard/Views render()' });
  const theme = useTheme();

  return (
    <Box className="content-wizard-content">
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        disableLazyLoading={true}
        index={tabValue}
        onChangeIndex={onTabPanelSelect}
        slideClassName="react-swipeable-view-slide"
      >
        <TabPanel value={tabValue} index={0} dir={theme.direction}>
          <QueryWizard onTabPanelSelect={onTabPanelSelect} />
        </TabPanel>
        <TabPanel value={tabValue} index={1} padding={0} dir={theme.direction}>
          <IDE />
        </TabPanel>
        <TabPanel value={tabValue} index={2} dir={theme.direction}>
          <ResultHandler />
        </TabPanel>
      </SwipeableViews>
    </Box>
  );
}

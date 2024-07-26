import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import { useLogger } from '@/providers';
import { IDE, QueryWizard, ResultHandler, SwipeableViews } from '@/components';
import { TabPanel } from '../TabPanel';

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

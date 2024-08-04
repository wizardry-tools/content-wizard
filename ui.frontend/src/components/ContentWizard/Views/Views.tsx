import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import type { ViewsProps } from '@/types';
import { useLogger } from '@/providers';
import { IDE, QueryWizard, ResultHandler } from '@/components';
import { SwipeableViews } from '../SwipeableViews';
import { ViewPanel } from '../ViewPanel';

/**
 * This is the container that holds {@link ViewPanel}s, inside a {@link SwipeableViews} component.
 * @param selectedView {number} the currently selected view
 * @param onViewPanelSelect {ViewPanelSelectCallback} a callback that accepts a number from the {@link SwipeableViews} when a new {@linik ViewPanel} is selected.
 * @constructor
 */
export const Views = ({ selectedView, onViewPanelSelect }: ViewsProps) => {
  const logger = useLogger();
  logger.debug({ message: 'ContentWizard/Views render()' });
  const theme = useTheme();

  return (
    <Box className="content-wizard-content">
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        disableLazyLoading={true}
        index={selectedView}
        onChangeIndex={onViewPanelSelect}
        slideClassName="react-swipeable-view-slide"
      >
        <ViewPanel value={selectedView} index={0} dir={theme.direction}>
          <QueryWizard onViewPanelSelect={onViewPanelSelect} />
        </ViewPanel>
        <ViewPanel value={selectedView} index={1} padding={0} dir={theme.direction}>
          <IDE />
        </ViewPanel>
        <ViewPanel value={selectedView} index={2} dir={theme.direction}>
          <ResultHandler />
        </ViewPanel>
      </SwipeableViews>
    </Box>
  );
};

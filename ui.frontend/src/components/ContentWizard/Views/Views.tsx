import SwipeableViews from "../../SwipeableViews/SwipeableViews";
import { TabPanel } from "../TabPanel";
import ResultHandler from "../../Results/ResultHandler";
import { useTheme } from "@mui/material/styles";
import { IDE } from "../../QueryWizard/views/IDE";
import Box from "@mui/material/Box";
import QueryWizard from "../../QueryWizard/QueryWizard";
import {ViewsProps} from "./index";



export function Views({tabValue, onTabPanelSelect}: ViewsProps) {
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
          <QueryWizard onTabPanelSelect={onTabPanelSelect}/>
        </TabPanel>
        <TabPanel value={tabValue} index={1} padding={0} dir={theme.direction}>
          <IDE/>
        </TabPanel>
        <TabPanel value={tabValue} index={2} dir={theme.direction}>
          <ResultHandler/>
        </TabPanel>
      </SwipeableViews>
    </Box>
  );
}

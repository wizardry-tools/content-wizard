import SwipeableViews from "../SwipeableViews/SwipeableViews";
import TabPanel from "./elements/TabPanel";
import ResultHandler from "./handlers/ResultHandler";
import {useTheme} from "@mui/material/styles";
import {IDE} from "./views/IDE";
import Box from "@mui/material/Box";
import Wizard from "./views/Wizard";

export type QueryWizardViewsProps = {
  tabValue: number,
  onTabPanelSelect: (index: number)=>void;
}


export default function QueryWizardViews({tabValue, onTabPanelSelect}: QueryWizardViewsProps) {
  const theme = useTheme();

  return (
    <Box className="query-wizard-content">
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        disableLazyLoading={true}
        index={tabValue}
        onChangeIndex={onTabPanelSelect}
        slideClassName="react-swipeable-view-slide"
      >
        <TabPanel value={tabValue} index={0} dir={theme.direction}>
          <Wizard onTabPanelSelect={onTabPanelSelect}/>
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

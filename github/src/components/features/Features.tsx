import { Container, Grid, useTheme } from '@mui/material';
import { FeaturePreview } from './FeaturePreview';
import { ideFeatures, queryWizardFeatures, resultsFeatures } from './content';
import { FeaturesBar } from './FeaturesBar';
import { useCallback, useState } from 'react';
import { SwipeableViews } from './swipeable-views';
import { FeaturesPanel } from './FeaturesPanel';

export const Features = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const onTabSelect = useCallback((_event: any, value: any) => {
    setTabValue(value);
  }, []);

  const onTabPanelSelect = useCallback((index: number) => {
    setTabValue(index);
  }, []);

  return (
    <Container id="features" sx={{ pb: { xs: 4, sm: 8 } }}>
      <Grid container spacing={6} sx={{ width: '100%', marginLeft: 0, marginTop: 0 }}>
        <FeaturesBar tabValue={tabValue} onTabSelect={onTabSelect} />
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          disableLazyLoading={false}
          animateHeight={true}
          index={tabValue}
          onChangeIndex={onTabPanelSelect}
          slideClassName="swipeable-view-slide"
        >
          <FeaturesPanel value={tabValue} index={0} dir={theme.direction}>
            <FeaturePreview
              features={queryWizardFeatures}
              prefix={'query-wizard'}
              heading={'Query Wizard Rules'}
              subHeading={'Explore the different rules and filters that the Query Wizard offers.'}
            />
          </FeaturesPanel>
          <FeaturesPanel value={tabValue} index={1} dir={theme.direction}>
            <FeaturePreview
              features={ideFeatures}
              prefix={'ide'}
              heading={'Query IDE Features'}
              subHeading={'Explore the different features that the Query IDE offers.'}
            />
          </FeaturesPanel>
          <FeaturesPanel value={tabValue} index={2} dir={theme.direction}>
            <FeaturePreview
              features={resultsFeatures}
              prefix={'results'}
              heading={'Results Features'}
              subHeading={'Explore the different features that the Results offers.'}
            />
          </FeaturesPanel>
        </SwipeableViews>
      </Grid>
    </Container>
  );
};

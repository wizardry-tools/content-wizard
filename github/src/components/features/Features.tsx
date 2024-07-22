import { Container, Grid, Stack, SvgIcon, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import { FeaturePreview } from './FeaturePreview';
import { ideFeatures, queryWizardFeatures, resultsFeatures } from './content';

export const Features = () => {
  return (
    <Container id="features" sx={{ pb: { xs: 4, sm: 8 } }}>
      <Grid container spacing={6} sx={{ width: '100%', marginLeft: 0, marginTop: 0 }}>
        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: 'center',
            width: { xs: '100%', sm: '70%' },
            marginTop: 0,
            paddingBottom: 4,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              fontSize: 'clamp(2rem, 10vw, 2.5rem)',
            }}
          >
            <SvgIcon
              component={ConstructionIcon}
              className="results-icon"
              inheritViewBox
              sx={{
                fontSize: '2rem',
                mr: 2,
              }}
            />
            Core&nbsp;
            <Typography
              component="span"
              variant="h3"
              sx={(theme) => ({
                fontSize: 'inherit',
                color: 'primary.main',
                ...theme.applyStyles('dark', {
                  color: 'primary.light',
                }),
              })}
            >
              Features
            </Typography>
          </Typography>
        </Stack>
        <FeaturePreview
          features={queryWizardFeatures}
          prefix={'query-wizard'}
          heading={'Query Wizard Rules'}
          subHeading={'Explore the different rules and filters that the Query Wizard offers.'}
        />
        <FeaturePreview
          features={ideFeatures}
          prefix={'ide'}
          heading={'Query IDE Features'}
          subHeading={'Explore the different features that the Query IDE offers.'}
        />
        <FeaturePreview
          features={resultsFeatures}
          prefix={'results'}
          heading={'Results Features'}
          subHeading={'Explore the different features that the Results offers.'}
        />
      </Grid>
    </Container>
  );
};

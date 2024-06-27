import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import HighlightIcon from '@mui/icons-material/Highlight';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Persisted Settings',
    description:
      'The Query IDE supports persisted settings and can remember your Dark/Light mode preference along with previous Query Statements and GraphQL Headers/Variables',
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Build Queries with Ease',
    description:
      'Whether you\'re new to AEM or an experienced Developer, the Content Wizard\'s tools enable you to build Powerful Query Statements that are native to AEM\'s OOTB Query Languages' ,
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Great user experience',
    description:
      'Seamlessly navigate between Content Wizard\'s different views. Swap between Query Wizard and Query IDE when building QueryBuilder statements.',
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Export Queries',
    description:
      'Convenient Copy functionality exists for the Query Wizard and Query IDE, so that you can easily copy the current Query Statement to your device\'s clipboard.',
  },
  {
    icon: <HighlightIcon />,
    title: 'Syntax Highlighting',
    description:
      'Each supported language features Syntax Highlighting that is tuned to the Dark/Light mode themes',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Precision Results',
    description:
      'Fine-tune your QueryBuilder Statements in the Query IDE after using the Query Wizard, to maximize the accuracy of your results.',
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: 'white',
        bgcolor: 'hsl(220, 30%, 2%)',
      }}
    >
      <Container
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: { sm: 'left', md: 'center' },
          }}
        >
          <Typography component="h2" variant="h4">
            Highlights
          </Typography>
          <Typography variant="body1" sx={{ color: 'grey.400' }}>
            Explore why Content Wizard can help your Developers and Authors.
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: 'inherit',
                  p: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'hsla(220, 25%, 25%, .3)',
                  background: 'transparent',
                  backgroundColor: 'grey.900',
                  boxShadow: 'none',
                }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'grey.400' }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

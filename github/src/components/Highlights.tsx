import { Box, Card, Container, Grid, Stack, Typography } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import HighlightIcon from '@mui/icons-material/Highlight';
import IosShareIcon from '@mui/icons-material/IosShare';
import ThumbUpAltRoundedIcon from '@mui/icons-material/ThumbUpAltRounded';

const items = [
  {
    icon: <ConstructionRoundedIcon />,
    title: 'Build Queries with Ease',
    description:
      "Whether you're new to AEM or an experienced developer, the Content Wizard's tools enable you to build powerful query statements that are supported by AEM's out of the box query languages.",
  },
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Persisted Settings',
    description:
      'The Query IDE supports persisted settings and can remember dark/light mode preference along with previous query statements and GraphQL headers/variables.',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Precision Results',
    description:
      'Fine-tune your QueryBuilder Statements in the Query IDE after using the Query Wizard, to maximize the accuracy of your results.',
  },
  {
    icon: <IosShareIcon />,
    title: 'Export Query, Results, and Content',
    description:
      'Conveniently copy query statements to clipboard. Download results as a sharable data file. Extract the content of results as an AEM content package zip.',
  },
  {
    icon: <HighlightIcon />,
    title: 'Syntax Highlighting',
    description:
      'Each supported language features syntax highlighting that is tuned to the dark/light mode themes, making query statements easier to read.',
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: 'Great user experience',
    description:
      "Seamlessly navigate between Content Wizard's different views. Swap between Query Wizard and Query IDE when building QueryBuilder statements. Exposing powerful content features that are easy to use.",
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={(theme) => ({
        pt: { xs: 4, sm: 8 },
        pb: { xs: 8, sm: 12 },
        color: theme.palette.mode === 'dark' ? 'white' : 'black',
        bgcolor: theme.palette.mode === 'dark' ? 'hsl(220, 30%, 2%)' : 'hsl(220, 30%, 96%)',
      })}
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
            textAlign: 'center',
          }}
        >
          <Typography component="h2" variant="h4">
            Highlights
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? 'grey.400' : 'grey.800',
            })}
          >
            Explore why Content Wizard can help your Developers and Authors find AEM content issues without wasting time
            browsing for them.
          </Typography>
        </Box>
        <Grid container spacing={2.5}>
          {items.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Stack
                direction="column"
                className="highlights-card-stack"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{ p: 3 }}
              >
                <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: 'medium' }}>
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={(theme) => ({
                      color: theme.palette.mode === 'dark' ? 'grey.400' : 'grey.800',
                    })}
                  >
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

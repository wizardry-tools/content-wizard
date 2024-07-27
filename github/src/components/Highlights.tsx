import { Box, Card, Container, Grid, Stack, Typography } from '@mui/material';
import { highlightContent } from '@/content';

const { items, heading, subHeading } = highlightContent;

export function Highlights() {
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
            {heading}
          </Typography>
          <Typography
            variant="body1"
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? 'grey.400' : 'grey.800',
            })}
          >
            {subHeading}
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

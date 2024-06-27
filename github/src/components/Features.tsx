import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import { Chip as MuiChip } from '@mui/material';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import Stack from '@mui/material/Stack';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import Typography from '@mui/material/Typography';

import { styled } from '@mui/material/styles';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TranslateIcon from '@mui/icons-material/Translate';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import targetingRulesImage from '../images/wizard-rules/targeting-rules.png';
import msmRulesImage from '../images/wizard-rules/msm-rules.png';
import msmLCRulesImage from '../images/wizard-rules/msm-livecopy-rules.png';
import replicationRulesImage from '../images/wizard-rules/replication-rules.png';
import translationRulesImage from '../images/wizard-rules/translation-rules.png';
import authoringRulesImage from '../images/wizard-rules/authoring-rules.png';

const items = [
  {
    icon: <FindInPageIcon />,
    title: 'Targeting Rules',
    description:
      'These are the standard QueryBuilder rules for what kind of content you are looking for and where.',
    image: `url("${targetingRulesImage}")`,
  },
  {
    icon: <ManageAccountsIcon />,
    title: 'Authoring Rules',
    description:
      'These are rules focused on standard Authoring activity.',
    image: `url("${authoringRulesImage}")`,
  },
  {
    icon: <PublishedWithChangesIcon />,
    title: 'Replication Rules',
    description:
      'These are rules focused on Replication activity.',
    image: `url("${replicationRulesImage}")`,
  },
  {
    icon: <AccountTreeIcon />,
    title: 'MSM Rules',
    description:
      'These are rules focused on Replication activity. "Is Blueprint" does not provide additional options',
    image: `url("${msmRulesImage}")`,
  },
  {
    icon: <AccountTreeIcon />,
    title: 'MSM LiveCopy Rules',
    description:
      'The MSM Rule "Is LiveCopy" will enable additional MSM related rules focused on LiveCopies.',
    image: `url("${msmLCRulesImage}")`,
  },
  {
    icon: <TranslateIcon />,
    title: 'Translation Rules',
    description:
      'These are rules focused on Translated content.',
    image: `url("${translationRulesImage}")`,
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }:any) => selected,
      style: {
        background:
          'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
        color: 'hsl(0, 0%, 100%)',
        borderColor: theme.palette.primary.light,
        '& .MuiChip-label': {
          color: 'hsl(0, 0%, 100%)',
        },
        ...theme.applyStyles('dark', {
          borderColor: theme.palette.primary.dark,
        }),
      },
    },
  ],
}));

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6}>
          <div>
            <Typography component="h2" variant="h4" sx={{ color: 'text.primary' }}>
              Query Wizard Rules
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}
            >
              These are the various QueryBuilder rules supported within the Query Wizard.
            </Typography>
          </div>
          <Grid container item sx={{ gap: 1, display: { xs: 'auto', sm: 'none' } }}>
            {items.map(({ title }, index) => (
              <Chip
                key={index}
                label={title}
                onClick={() => handleItemClick(index)}
                selected={selectedItemIndex === index}
              />
            ))}
          </Grid>
          <Card
            variant="outlined"
            sx={{ display: { xs: 'auto', sm: 'none' }, mt: 4 }}
          >
            <Box
              sx={(theme) => ({
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                minHeight: 280,
                backgroundImage: 'var(--items-image)',
                backgroundRepeat: 'no-repeat'
              })}
              style={
                {
                  '--items-image': items[selectedItemIndex].image,
                } as any
              }
            />
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography
                gutterBottom
                sx={{ color: 'text.primary', fontWeight: 'medium' }}
              >
                {selectedFeature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                {selectedFeature.description}
              </Typography>
            </Box>
          </Card>
          <Stack
            direction="column"
            spacing={2}
            useFlexGap
            sx={{
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            {items.map(({ icon, title, description }, index) => (
              <Card
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 1,
                    height: 'fit-content',
                    width: '100%',
                    background: 'none',
                    '&:hover': {
                      background:
                        'linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)',
                      borderColor: 'primary.light',
                      boxShadow: '0px 2px 8px hsla(0, 0%, 0%, 0.1)',
                      ...theme.applyStyles('dark', {
                        background:
                          'linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)',
                        borderColor: 'primary.dark',
                        boxShadow: '0px 1px 8px hsla(210, 100%, 25%, 0.5) ',
                      }),
                    },
                  }),
                  selectedItemIndex === index &&
                    ((theme) => ({
                      backgroundColor: 'action.selected',
                      borderColor: 'primary.light',
                      ...theme.applyStyles('dark', {
                        borderColor: 'primary.dark',
                      }),
                    })),
                ]}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    textAlign: 'left',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { md: 'center' },
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={[
                      (theme) => ({
                        color: 'grey.400',
                        ...theme.applyStyles('dark', {
                          color: 'grey.600',
                        }),
                      }),
                      selectedItemIndex === index && {
                        color: 'primary.main',
                      },
                    ]}
                  >
                    {icon}
                  </Box>
                  <div>
                    <Typography
                      gutterBottom
                      sx={{ color: 'text.primary', fontWeight: 'medium' }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mb: 1.5 }}
                    >
                      {description}
                    </Typography>
                  </div>
                </Box>
              </Card>
            ))}
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { xs: 'none', sm: 'flex' }, width: '100%' }}
        >
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={(theme) => ({
                m: 'auto',
                width: 420,
                height: 500,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundImage: 'var(--items-image)',
              })}
              style={
                {
                  '--items-image': items[selectedItemIndex].image,
                } as any
              }
            />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

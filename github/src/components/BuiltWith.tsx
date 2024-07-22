import { Box, Container, Grid, IconButton, IconButtonProps, SvgIcon, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SvgIconProps } from '@mui/material/SvgIcon/SvgIcon';
import { TSLogo, ReactLogo, MuiLogo, GraphiQLLogo, MavenLogo, CodeMirrorLogo, AdobeLogo } from 'src/icons';
import '../styles/built-with.scss';

type IconLinkProps = SvgIconProps & IconButtonProps;
const IconLink = (props: IconLinkProps) => {
  const { component, title, children, ...other } = props;

  return (
    (!!component && (
      <IconButton
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
        target="_blank"
        rel="noreferrer"
        title={title}
        {...other}
      >
        <SvgIcon component={component} inheritViewBox />
        <Typography>{title}</Typography>
        {children}
      </IconButton>
    )) || <>{children}</>
  );
};

const ThirdPartyIcon = styled(IconLink)(() => ({
  padding: '1.5rem',
  width: '9.375rem',
  height: '9.375rem',
}));

const thirdPartyMap: IconLinkProps[] = [
  {
    title: 'TypeScript',
    href: 'https://www.typescriptlang.org/',
    'aria-label': 'External navigation link to the TypeScript website',
    component: TSLogo,
  },
  {
    title: 'React',
    href: 'https://react.dev/',
    'aria-label': 'External navigation link to the React website',
    component: ReactLogo,
  },
  {
    title: 'Material UI',
    href: 'https://mui.com/',
    'aria-label': 'External navigation link to the Material UI website',
    component: MuiLogo,
  },
  {
    title: 'GraphiQL IDE',
    href: 'https://graphi-ql-app.netlify.app/',
    'aria-label': 'External navigation link to the GraphiQL IDE website',
    component: GraphiQLLogo,
  },
  {
    title: 'Apache Maven',
    href: 'https://maven.apache.org/',
    'aria-label': 'External navigation link to the Apache Maven website',
    component: MavenLogo,
  },
  {
    title: 'CodeMirror',
    href: 'https://codemirror.net/',
    'aria-label': 'External navigation link to the CodeMirror website',
    component: CodeMirrorLogo,
  },
];

export const BuiltWith = () => {
  return (
    <Box
      id="built-with"
      sx={(theme) => ({
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
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
          <Typography component="h3" variant="h4">
            Content Wizard is built with
          </Typography>
        </Box>
        <Grid container justifyContent="center">
          {thirdPartyMap.map((party, index) => {
            return (
              <Grid item key={index}>
                <ThirdPartyIcon
                  title={party.title}
                  href={party.href}
                  aria-label={party['aria-label']}
                  component={party.component}
                />
              </Grid>
            );
          })}
        </Grid>
        <Box
          sx={{
            width: { sm: '100%', md: '60%' },
            textAlign: 'center',
          }}
        >
          <Typography component="h3" variant="h4">
            built for
          </Typography>
        </Box>
        <Grid container justifyContent="center">
          <ThirdPartyIcon
            title="AEM"
            href="https://business.adobe.com/products/experience-manager/adobe-experience-manager.html"
            aria-label="External navigation link to the Adobe Experience Manager product website"
            component={AdobeLogo}
          />
        </Grid>
      </Container>
    </Box>
  );
};

import { PropsWithChildren, useMemo } from 'react';
import { SxProps } from '@mui/system';
import { Box, Container, IconButton, Link, Typography } from '@mui/material';
import { GitHub } from '@mui/icons-material';
import { useScrollToId } from '@/utils';

function Copyright() {
  return (
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        display: { xs: 'flex', sm: 'block' },
        flexDirection: { xs: 'column', sm: 'none' },
      }}
    >
      <span>{'Copyright © '}</span>
      <Link href="https://wizardry-tools.com/">Content Wizard</Link>
      <Box component={'span'} sx={{ ml: { xs: 0, sm: 0.5 } }}>
        {new Date().getFullYear()}
      </Box>
    </Typography>
  );
}

export function Footer() {
  const scrollToSection = useScrollToId();

  const FooterLink = useMemo(
    () => (props: PropsWithChildren & { id: string; sx?: SxProps }) => {
      const { id, children, sx = {} } = props;
      return (
        <Link
          id={`${id}-footer-link`}
          variant="body2"
          onClick={() => scrollToSection.scroll(id)}
          sx={{
            cursor: 'pointer',
            ...sx,
          }}
        >
          {children}
        </Link>
      );
    },
    [scrollToSection],
  );

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: 'center', md: 'left' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: { xs: 'flex', sm: 'flex' },
            justifyContent: 'flex-end',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <FooterLink id={'hero'} sx={{ fontWeight: 600 }}>
            Content Wizard
          </FooterLink>
          <FooterLink id={'highlights'}>Highlights</FooterLink>
          <FooterLink id={'features'}>Features</FooterLink>
          <FooterLink id={'faq'}>FAQ</FooterLink>
          <FooterLink id={'installation'}>Installation</FooterLink>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <Copyright />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <IconButton
            color="inherit"
            href="https://github.com/wizardry-tools/content-wizard"
            target="_blank"
            aria-label="Github"
            title="Get the code on Github!"
            sx={{
              height: '5rem',
              width: '5rem',
              margin: 'auto',
            }}
          >
            <GitHub sx={{ height: '3rem', width: '3rem' }} />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
}

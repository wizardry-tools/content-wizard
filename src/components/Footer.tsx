import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import {GitHub} from "@mui/icons-material";
import {IconButton} from "@mui/material";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {'Copyright © '}
      <Link href="https://wizardry-tools.github.io/content-wizard/">Content Wizard&nbsp;</Link>
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
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
          flexDirection: { xs: 'column', sm: 'row' },
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            justifyContent: "flex-end",
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            Product
          </Typography>
          <Link color="text.secondary" variant="body2" href="#">
            Features
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            Highlights
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            FAQs
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            justifyContent: "flex-end",
            alignItems: 'flex-end',
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <Copyright />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'flex' },
            justifyContent: "flex-end",
            flexDirection: 'row',
            gap: 1,
          }}
        >
          <IconButton
            color="inherit"
            href="https://github.com/wizardry-tools/content-wizard"
            aria-label="Github"
          >
            <GitHub/>
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
}

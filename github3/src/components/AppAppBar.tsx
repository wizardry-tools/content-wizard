import { useState } from 'react';
import { AppBar, Box, Container, Divider, Drawer, IconButton, PaletteMode, SvgIcon, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { LogoIcon } from '@/icons';
import ToggleColorMode from './ToggleColorMode';
import { ScrollButton, ScrollMenuItem } from './nav-scrollers';

type AppAppBarProps = {
  mode: PaletteMode;
  toggleColorMode: () => void;
};

export function AppAppBar({ mode, toggleColorMode }: AppAppBarProps) {
  const [open, setOpen] = useState(false);
  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const hook = (value: unknown) => {
    if (typeof value === 'boolean') {
      setOpen(value);
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 0,
        bgColor: 'transparent',
        backgroundImage: 'none',
        mt: 2,
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          variant="regular"
          sx={(theme) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderRadius: '999px',
            backdropFilter: 'blur(24px)',
            maxHeight: 40,
            border: '1px solid',
            borderColor: 'divider',
            bgColor: 'hsla(220, 60%, 99%, 0.6)',
            boxShadow: '0 1px 2px hsla(210, 0%, 0%, 0.05), 0 2px 12px hsla(210, 100%, 80%, 0.5)',
            ...theme.applyStyles('dark', {
              bgColor: 'hsla(220, 0%, 0%, 0.7)',
              boxShadow: '0 1px 2px hsla(210, 0%, 0%, 0.5), 0 2px 12px hsla(210, 100%, 25%, 0.3)',
            }),
          })}
        >
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', px: 0 }}>
            <ScrollButton scrollId="hero" sx={{ mr: 2, borderRadius: '3rem' }} hook={hook} hookProps={false}>
              <SvgIcon
                sx={{
                  height: { xs: '2.5rem', sm: '3rem' },
                  width: { xs: '2.5rem', sm: '3rem' },
                }}
                inheritViewBox
                component={LogoIcon}
              />
            </ScrollButton>
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <ScrollButton variant="text" color="info" size="small" scrollId="highlights">
                Highlights
              </ScrollButton>
              <ScrollButton variant="text" color="info" size="small" scrollId="features">
                Features
              </ScrollButton>
              <ScrollButton variant="text" color="info" size="small" scrollId="faq" sx={{ minWidth: 0 }}>
                FAQ
              </ScrollButton>
              <ScrollButton variant="text" color="info" size="small" scrollId="installation">
                Installation
              </ScrollButton>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 0.5,
              alignItems: 'center',
            }}
          >
            <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
          </Box>
          <Box sx={{ display: { sm: 'flex', md: 'none' } }}>
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="top" open={open} onClose={toggleDrawer(false)}>
              <Box sx={{ p: 2, backgroundColor: 'background.default' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <ToggleColorMode mode={mode} toggleColorMode={toggleColorMode} />
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ my: 3 }} />
                <ScrollMenuItem scrollId="highlights">Highlights</ScrollMenuItem>
                <ScrollMenuItem scrollId="features">Features</ScrollMenuItem>
                <ScrollMenuItem scrollId="faq">FAQ</ScrollMenuItem>
                <ScrollMenuItem scrollId="installation">Installation</ScrollMenuItem>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

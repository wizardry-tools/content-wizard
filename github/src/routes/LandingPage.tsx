import { useState } from 'react';
import { Box, CssBaseline, Divider, PaletteMode } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { getTheme } from '@/utils';
import { AppAppBar, BuiltWith, FAQ, Features, Footer, Hero, Highlights, InstallationGuide } from '@/components';

export function LandingPage() {
  const [mode, setMode] = useState<PaletteMode>('dark');
  const defaultTheme = createTheme(getTheme(mode));

  const toggleColorMode = () => {
    setMode((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      document.body.classList.remove(prev);
      document.body.classList.add(newMode);
      return newMode;
    });
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={toggleColorMode} />
      <Hero />
      <Box sx={{ bgColor: 'background.default' }}>
        <Highlights />
        <Divider />
        <Features />
        <Divider />
        <FAQ />
        <Divider />
        <InstallationGuide />
        <Divider />
        <BuiltWith />
        <Divider />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

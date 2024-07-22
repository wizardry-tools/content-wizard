import { useState } from 'react';
import { PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppAppBar from '../components/AppAppBar';
import Hero from '../components/Hero';
import Highlights from '../components/Highlights';
import { Features } from 'src/components/features';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import { InstallationGuide } from '../components/InstallationGuide';
import { getTheme } from 'src/utils';
import { BuiltWith } from '../components/BuiltWith';

export default function LandingPage() {
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
      <Box sx={{ bgcolor: 'background.default' }}>
        <Features />
        <Divider />
        <Highlights />
        <Divider />
        <InstallationGuide />
        <Divider />
        <FAQ />
        <Divider />
        <BuiltWith />
        <Divider />
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

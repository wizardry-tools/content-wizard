import { Box, Link, IconButton } from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { DARK, LIGHT, useThemeDispatch, WizardAlert } from '@/providers';

import './GlobalNav.scss';

const headerCssProps = {
  fontSize: {
    xs: '.7rem',
    sm: '.9rem',
    md: '1.2rem',
  },
};

/**
 * This component represents the bar that's at the very top of the App. It contains a link
 * to the AEM start page and the toggle {@link IconButton} that toggles between light and dark {@link Theme}.
 * It's also the container for the {@link WizardAlert}
 * @param pageTitle {string}
 * @constructor
 */
export const GlobalNav = ({ pageTitle }: { pageTitle: string }) => {
  const theme = useTheme();
  const themeDispatch = useThemeDispatch();

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        themeDispatch(!theme || theme.palette.mode === LIGHT ? DARK : LIGHT);
      },
    }),
    [theme, themeDispatch],
  );

  return (
    <Box sx={headerCssProps} className="globalnav">
      <div className="globalnav-link" data-globalnav-toggle-href="/" role="heading" aria-level={2}>
        <Link
          sx={{
            color: 'rgba(255,255,255,0.8)',
            '&:hover': {
              color: '#ffffff',
            },
          }}
          href="/"
        >
          <span
            className="coral3-Icon coral3-Shell-homeAnchor-icon coral3-Icon--sizeM coral3-Icon--adobeExperienceManagerColor"
            role="img"
            aria-label="adobe experience manager color"
          />
          <span>Adobe Experience Manager</span>
        </Link>
        <span style={{ lineHeight: '2.375rem' }}> / Wizardry Tools / {pageTitle || 'Page Title'}</span>
      </div>
      <div className="globalnav-theme-toggle">
        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </div>
      <WizardAlert />
    </Box>
  );
};

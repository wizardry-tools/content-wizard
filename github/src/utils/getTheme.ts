import type {} from "@mui/material/themeCssVarsAugmentation";
import { ThemeOptions, Theme } from "@mui/material/styles";
import { PaletteMode } from "@mui/material";

export const isDark = (theme: Theme): boolean =>
  theme.palette.mode === "dark" || false;

const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
  },
});

export default function getTheme(mode: PaletteMode): ThemeOptions {
  return {
    ...getDesignTokens(mode),
    components: {
      MuiContainer: {
        styleOverrides: {
          root: () => ({
            "&.markdown-container": {
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            },
          }),
        },
      },
      MuiStack: {
        styleOverrides: {
          root: ({ theme }) => ({
            "&.highlights-card-stack": {
              color: "inherit",
              height: "100%",
              border: "1px solid",
              borderColor: "hsla(220, 25%, 25%, .3)",
              backgroundColor:
                theme.palette.mode === "dark" ? "grey.900" : "grey.200",
              boxShadow: "none",
            },
          }),
        },
      },
    },
  };
}

import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import qwAuthoringDark from "../images/qw/qw-authoring-dark.webp";
import qwAuthoringLight from "../images/qw/qw-authoring-light.webp";
import ideLanguageDark from "../images/ide/ide-language-dark.webp";
import ideLanguageLight from "../images/ide/ide-language-light.webp";
import ideGraphqlDark from "../images/ide/ide-graphql-dark.webp";
import ideGraphqlLight from "../images/ide/ide-graphql-light.webp";
import resultsImageDark from "../images/results/results-dark.webp";
import resultsImageLight from "../images/results/results-light.webp";
import { ReactComponent as LogoIcon } from "../wizard-logo.svg";
import { ReactComponent as WandIcon } from "../icons/magic-wand.svg";
import { ReactComponent as CodeIcon } from "../icons/programming-code.svg";
import { ReactComponent as TableIcon } from "../icons/table.svg";

import { styled } from "@mui/material/styles";
import { SvgIcon, useTheme } from "@mui/material";
import { useMemo } from "react";
import { isDark } from "../utils/getTheme";

const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  width: "100%",
  display: "inline-flex",
  height: "calc(.55 * 100vw)",
  flexGrow: 1,
  flexShrink: 1,
  objectFit: "contain",
  marginTop: theme.spacing(8),
  borderRadius: theme.shape.borderRadius,
  outline: "1px solid",
  boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",
  outlineColor: "hsla(220, 25%, 80%, 0.5)",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
  [theme.breakpoints.up("lg")]: {
    marginTop: theme.spacing(6),
    height: 650,
  },
  ...theme.applyStyles("dark", {
    boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",
    outlineColor: "hsla(210, 100%, 80%, 0.1)",
  }),
}));

export default function Hero() {
  const theme = useTheme();
  const isDarkMode = useMemo(() => isDark(theme), [theme]);
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: "100%",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 90%), transparent)",
        ...theme.applyStyles("dark", {
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
        }),
      })}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{ alignItems: "center", width: { xs: "100%", sm: "70%" } }}
        >
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-end"}
          >
            <Typography
              variant="h1"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                fontSize: "clamp(3rem, 10vw, 3.5rem)",
              }}
            >
              <SvgIcon
                component={LogoIcon}
                className="content-wizard-logo"
                inheritViewBox
                sx={{
                  fontSize: "7rem",
                }}
              />
              Content&nbsp;
              <Typography
                component="span"
                variant="h1"
                sx={(theme) => ({
                  fontSize: "inherit",
                  color: "primary.main",
                  ...theme.applyStyles("dark", {
                    color: "primary.light",
                  }),
                })}
              >
                Wizard
              </Typography>
            </Typography>
            <Typography
              variant={"h2"}
              sx={{
                display: "inline-flex",
                fontSize: { sm: "1.3rem", xs: "1rem" },
                mt: { sm: -5 },
                alignSelf: { sm: "end", xs: "center" },
              }}
            >
              for AEM
            </Typography>
          </Box>
        </Stack>

        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "70%" },
            marginTop: theme.spacing(8),
          }}
        >
          <Typography
            variant="h3"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              fontSize: "clamp(2rem, 10vw, 2.5rem)",
            }}
          >
            <SvgIcon
              component={WandIcon}
              className="query-wizard-icon"
              inheritViewBox
              sx={{
                fontSize: "2rem",
                mr: 2,
              }}
            />
            Query&nbsp;
            <Typography
              component="span"
              variant="h3"
              sx={(theme) => ({
                fontSize: "inherit",
                color: "primary.main",
                ...theme.applyStyles("dark", {
                  color: "primary.light",
                }),
              })}
            >
              Wizard
            </Typography>
          </Typography>
        </Stack>
        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "70%" },
            marginTop: theme.spacing(2),
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
            }}
          >
            Search AEM Content with ease using the Content Wizard's Query
            Wizard, a simple Form driven approach to building and executing
            QueryBuilder statements.
          </Typography>
        </Stack>
        <StyledBox
          id="image"
          sx={{
            backgroundImage: `url(${isDarkMode ? qwAuthoringDark : qwAuthoringLight})`,
          }}
        />

        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "70%" },
            marginTop: theme.spacing(8),
          }}
        >
          <Typography
            variant="h3"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              fontSize: "clamp(2rem, 10vw, 2.5rem)",
            }}
          >
            <SvgIcon
              component={CodeIcon}
              className="query-ide-icon"
              inheritViewBox
              sx={{
                fontSize: "2rem",
                mr: 2,
              }}
            />
            Query&nbsp;
            <Typography
              component="span"
              variant="h3"
              sx={(theme) => ({
                fontSize: "inherit",
                color: "primary.main",
                ...theme.applyStyles("dark", {
                  color: "primary.light",
                }),
              })}
            >
              IDE
            </Typography>
          </Typography>
        </Stack>
        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "70%" },
            marginTop: theme.spacing(2),
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
            }}
          >
            Create or Edit raw Query statements with the Query IDE. Supporting
            QueryBuilder, SQL, JCR-SQL2, XPATH, and GraphQL query languages.
          </Typography>
        </Stack>
        <StyledBox
          id="image"
          sx={{
            backgroundImage: `url(${isDarkMode ? ideLanguageDark : ideLanguageLight})`,
          }}
        />
        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "70%" },
            marginTop: theme.spacing(4),
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
            }}
          >
            Retaining OOTB GraphiQL functionality, the Query IDE can provide
            rich contextual support for GraphQL using on the Document Explorer
            plugin.
          </Typography>
        </Stack>
        <StyledBox
          id="image"
          sx={{
            backgroundImage: `url(${isDarkMode ? ideGraphqlDark : ideGraphqlLight})`,
          }}
        />

        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "70%" },
            marginTop: theme.spacing(8),
          }}
        >
          <Typography
            variant="h3"
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              fontSize: "clamp(2rem, 10vw, 2.5rem)",
            }}
          >
            <SvgIcon
              component={TableIcon}
              className="results-icon"
              inheritViewBox
              sx={{
                fontSize: "2rem",
                mr: 2,
              }}
            />
            Query&nbsp;
            <Typography
              component="span"
              variant="h3"
              sx={(theme) => ({
                fontSize: "inherit",
                color: "primary.main",
                ...theme.applyStyles("dark", {
                  color: "primary.light",
                }),
              })}
            >
              Results
            </Typography>
          </Typography>
        </Stack>
        <Stack
          spacing={2}
          useFlexGap
          flexGrow={1}
          flexShrink={1}
          sx={{
            alignItems: "center",
            width: { xs: "100%", sm: "70%" },
            marginTop: theme.spacing(2),
          }}
        >
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%" },
            }}
          >
            View all iterable results for executed queries within a Paginated
            Data Table.
          </Typography>
        </Stack>
        <StyledBox
          id="image"
          sx={{
            backgroundImage: `url(${isDarkMode ? resultsImageDark : resultsImageLight})`,
          }}
        />
      </Container>
    </Box>
  );
}

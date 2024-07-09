import { useRef, useState, MouseEvent, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  Chip as MuiChip,
  Container,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import TranslateIcon from "@mui/icons-material/Translate";
import PublishedWithChangesIcon from "@mui/icons-material/PublishedWithChanges";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import qwTargetingLight from "../images/qw/qw-targeting-light.webp";
import qwTargetingDark from "../images/qw/qw-targeting-dark.webp";
import qwAuthoringLight from "../images/qw/qw-authoring-light.webp";
import qwAuthoringDark from "../images/qw/qw-authoring-dark.webp";
import qwReplicationLight from "../images/qw/qw-replication-light.webp";
import qwReplicationDark from "../images/qw/qw-replication-dark.webp";
import qwMsmLight from "../images/qw/qw-msm-light.webp";
import qwMsmDark from "../images/qw/qw-msm-dark.webp";
import qwTranslationLight from "../images/qw/qw-translation-light.webp";
import qwTranslationDark from "../images/qw/qw-translation-dark.webp";
import { useMouseOverZoom } from "../hooks";
import { isDark } from "../utils/getTheme";

const items = [
  {
    icon: <FindInPageIcon />,
    title: "Targeting Rules",
    description:
      "These are the standard QueryBuilder rules for what kind of content you are looking for and where.",
    imageLight: qwTargetingLight,
    imageDark: qwTargetingDark,
  },
  {
    icon: <ManageAccountsIcon />,
    title: "Authoring Rules",
    description: "These are rules focused on standard Authoring activity.",
    imageLight: qwAuthoringLight,
    imageDark: qwAuthoringDark,
  },
  {
    icon: <PublishedWithChangesIcon />,
    title: "Replication Rules",
    description: "These are rules focused on Replication activity.",
    imageLight: qwReplicationLight,
    imageDark: qwReplicationDark,
  },
  {
    icon: <AccountTreeIcon />,
    title: "MSM Rules",
    description:
      'These are rules focused on Replication activity. "Is Blueprint" does not provide additional options',
    imageLight: qwMsmLight,
    imageDark: qwMsmDark,
  },
  {
    icon: <TranslateIcon />,
    title: "Translation Rules",
    description: "These are rules focused on Translated content.",
    imageLight: qwTranslationLight,
    imageDark: qwTranslationDark,
  },
];

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }: any) => selected,
      style: {
        background:
          "linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))",
        color: "hsl(0, 0%, 100%)",
        borderColor: theme.palette.primary.light,
        "& .MuiChip-label": {
          color: "hsl(0, 0%, 100%)",
        },
        ...theme.applyStyles("dark", {
          borderColor: theme.palette.primary.dark,
        }),
      },
    },
  ],
}));

const StyledCanvas = styled("canvas")(({ theme }) => ({
  top: 0,
  left: 0,
  position: "absolute",
  display: "none",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  "&.show": {
    [theme.breakpoints.up("md")]: {
      display: "block",
    },
  },
}));

const StyledImage = styled("img")(() => ({
  width: "100%",
  height: "100%",
  objectFit: "contain",
  backgroundSize: "contain",
  backgroundRepease: "no-repeat",
  cursor: "crosshair",
}));

const ZoomCursor = styled("div")(({ theme }) => ({
  position: "absolute",
  borderColor: isDark(theme) ? "grey.200" : "grey.900",
  borderWidth: "1px",
  borderStyle: "solid",
  pointerEvents: "none",
  zIndex: 1200,
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

export default function Features() {
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const theme = useTheme();
  const isDarkMode = useMemo(() => isDark(theme), [theme]);
  const [hoverImage, setHoverImage] = useState(false);
  const highResImage = useRef<HTMLImageElement | null>(null);
  const source = useRef<HTMLImageElement | null>(null);
  const target = useRef<HTMLCanvasElement | null>(null);
  const cursor = useRef<HTMLDivElement | null>(null);

  const enablePreview = useMediaQuery(theme.breakpoints.up("md"));
  const selectedFeature = items[selectedItemIndex];

  const handleItemClick = (index: number) => {
    setSelectedItemIndex(index);
  };

  const handleHover = (event: MouseEvent<HTMLElement>) => {
    const hoveredImage = event.currentTarget as HTMLImageElement;
    if (hoveredImage && hoveredImage?.tagName === "IMG") {
      setHoverImage(true);
      highResImage.current = new Image();
      highResImage.current.src = isDarkMode
        ? selectedFeature.imageDark
        : selectedFeature.imageLight;
    }
  };
  const handleNoHover = (_event: MouseEvent<HTMLElement>) => {
    highResImage.current = null;
    setHoverImage(false);
  };

  useMouseOverZoom(highResImage, source, target, cursor, enablePreview);

  return (
    <Container id="features" sx={{ py: { xs: 8, sm: 16 } }}>
      <Grid container spacing={6}>
        <Grid
          item
          xs={12}
          md={6}
          className="feature-grid"
          display="flex"
          flexDirection="column"
          position="relative"
        >
          <div>
            <Typography
              component="h2"
              variant="h4"
              sx={{ color: "text.primary" }}
            >
              Query Wizard Rules
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", mb: { xs: 2, sm: 4 } }}
            >
              These are the various QueryBuilder rules supported within the
              Query Wizard.
            </Typography>
          </div>
          <Grid
            container
            item
            sx={{ gap: 1, display: { xs: "auto", sm: "none" } }}
          >
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
            className="small-image-card"
            variant="outlined"
            sx={{ display: { xs: "auto", sm: "none" }, mt: 4 }}
          >
            <Box
              className="small-image-container"
              sx={(theme) => ({
                backgroundSize: "contain",
                backgroundPosition: "center",
                minHeight: 280,
                backgroundRepeat: "no-repeat",
                backgroundImage: "var(--items-image-light)",
                ...theme.applyStyles("dark", {
                  backgroundImage: "var(--items-image-dark)",
                }),
              })}
              style={
                {
                  "--items-image-light": `url("${items[selectedItemIndex].imageLight}")`,
                  "--items-image-dark": `url("${items[selectedItemIndex].imageDark}")`,
                } as any
              }
            />
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography
                gutterBottom
                sx={{ color: "text.primary", fontWeight: "medium" }}
              >
                {selectedFeature.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mb: 1.5 }}
              >
                {selectedFeature.description}
              </Typography>
            </Box>
          </Card>
          <Stack
            direction="column"
            className="feature-card-stack"
            spacing={2}
            useFlexGap
            sx={{
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
              display: { xs: "none", sm: "flex" },
            }}
          >
            {items.map(({ icon, title, description }, index) => (
              <Card
                className="feature-card"
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 1,
                    height: "fit-content",
                    width: "100%",
                    background: "none",
                    "&:hover": {
                      background:
                        "linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)",
                      borderColor: "primary.light",
                      boxShadow: "0px 2px 8px hsla(0, 0%, 0%, 0.1)",
                      ...theme.applyStyles("dark", {
                        background:
                          "linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)",
                        borderColor: "primary.dark",
                        boxShadow: "0px 1px 8px hsla(210, 100%, 25%, 0.5) ",
                      }),
                    },
                  }),
                  selectedItemIndex === index &&
                    ((theme) => ({
                      backgroundColor: "action.selected",
                      borderColor: "primary.light",
                      ...theme.applyStyles("dark", {
                        borderColor: "primary.dark",
                      }),
                    })),
                ]}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    textAlign: "left",
                    flexDirection: { xs: "column", md: "row" },
                    alignItems: { md: "center" },
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={[
                      (theme) => ({
                        color: "grey.400",
                        ...theme.applyStyles("dark", {
                          color: "grey.600",
                        }),
                      }),
                      selectedItemIndex === index && {
                        color: "primary.main",
                      },
                    ]}
                  >
                    {icon}
                  </Box>
                  <div>
                    <Typography
                      gutterBottom
                      sx={{ color: "text.primary", fontWeight: "medium" }}
                    >
                      {title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 1.5 }}
                    >
                      {description}
                    </Typography>
                  </div>
                </Box>
              </Card>
            ))}
          </Stack>
          <StyledCanvas ref={target} className={hoverImage ? "show" : "hide"} />
        </Grid>
        <Grid
          item
          className="image-grid"
          xs={12}
          md={6}
          sx={{
            display: { xs: "none", sm: "flex" },
            width: "100%",
            height: "100%",
          }}
        >
          <Card
            variant="outlined"
            className="image-card"
            sx={{
              width: "100%",
              height: "100%",
              display: { xs: "none", sm: "flex" },
              position: "relative",
            }}
          >
            <StyledImage
              src={
                isDarkMode
                  ? items[selectedItemIndex].imageDark
                  : items[selectedItemIndex].imageLight
              }
              onMouseOver={handleHover}
              onMouseLeave={handleNoHover}
              ref={source}
            />
            <ZoomCursor ref={cursor} className="" />
            {/*<Box
              className="image-container"
              ref={imageHoverSource}
              sx={(theme) => ({
                m: 'auto',
                width: '100%',
                height: 500,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundImage: 'var(--items-image-light)',
                ...theme.applyStyles('dark', {
                  backgroundImage: 'var(--items-image-dark)'
                })
              })}
              style={
                {
                  '--items-image-light': `url("${items[selectedItemIndex].imageLight}")`,
                  '--items-image-dark': `url("${items[selectedItemIndex].imageDark}")`,
                } as any
              }
            />*/}
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

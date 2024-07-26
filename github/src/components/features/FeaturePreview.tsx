import { JSX, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip as MuiChip,
  Grid,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { isDark } from '@/utils';
import { useMouseOverZoom } from '@/hooks';

interface ChipProps {
  selected?: boolean;
}

const Chip = styled(MuiChip)<ChipProps>(({ theme }) => ({
  variants: [
    {
      props: ({ selected }: any) => selected,
      style: {
        background: 'linear-gradient(to bottom right, hsl(210, 98%, 48%), hsl(210, 98%, 35%))',
        color: 'hsl(0, 0%, 100%)',
        borderColor: theme.palette.primary.light,
        '& .MuiChip-label': {
          color: 'hsl(0, 0%, 100%)',
        },
        ...theme.applyStyles('dark', {
          borderColor: theme.palette.primary.dark,
        }),
      },
    },
  ],
}));

const StyledCanvas = styled(Paper)(({ theme }) => ({
  top: 0,
  left: 0,
  position: 'absolute',
  display: 'none',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  padding: '0.5rem',
  '&.show': {
    [theme.breakpoints.up('md')]: {
      display: 'block',
    },
  },
}));

const StyledImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  backgroundSize: 'contain',
  backgroundRepease: 'no-repeat',
  cursor: 'crosshair',
  [theme.breakpoints.down('md')]: {
    cursor: 'default',
  },
}));

const ZoomCursor = styled('div')(({ theme }) => ({
  position: 'absolute',
  borderColor: isDark(theme) ? 'grey.200' : 'grey.900',
  borderWidth: '1px',
  borderStyle: 'solid',
  pointerEvents: 'none',
  zIndex: 1200,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

// TODO convert the images to a specific type
export type Feature = {
  icon: JSX.Element;
  title: string;
  description: string;
  imageLight: string;
  imageDark: string;
};

export type FeaturePreviewProps = {
  features: Feature[];
  heading: string;
  subHeading: string;
  prefix: string;
};

export const FeaturePreview = (props: FeaturePreviewProps) => {
  const { features, heading, subHeading, prefix } = props;
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const theme = useTheme();
  const isDarkMode = useMemo(() => isDark(theme), [theme]);
  const [hoverImage, setHoverImage] = useState(false);
  const highResImage = useRef<HTMLImageElement | null>(null);
  const source = useRef<HTMLImageElement | null>(null);
  const target = useRef<HTMLCanvasElement | null>(null);
  const targetContainer = useRef<HTMLDivElement | null>(null);
  const cursor = useRef<HTMLDivElement | null>(null);

  const canvasDimensions = useRef({ width: 0, height: 0 });

  const enablePreview = useMediaQuery(theme.breakpoints.up('md'));
  const selectedFeature = useMemo(() => features[selectedItemIndex], [features, selectedItemIndex]);

  const updateDimensions = useCallback(() => {
    const element = targetContainer.current;
    if (element) {
      canvasDimensions.current = {
        width: element.offsetWidth,
        height: element.offsetHeight,
      };
    }
  }, []);

  const handleMouseEnterContainer = useCallback(() => {
    // since we introduced SwipeableViews, the hidden views are not properly capturing
    // the canvas dimensions, and we need to ensure they are captured/updated before
    // the user interacts with the preview image.
    updateDimensions();
  }, [updateDimensions]);

  const handleItemClick = useCallback((index: number) => {
    setSelectedItemIndex(index);
  }, []);

  const handleHover = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const hoveredImage = event.currentTarget as HTMLImageElement;
      if (hoveredImage && hoveredImage?.tagName === 'IMG') {
        setHoverImage(true);
        highResImage.current = new Image();
        highResImage.current.src = isDarkMode ? selectedFeature.imageDark : selectedFeature.imageLight;
      }
    },
    [isDarkMode, selectedFeature],
  );
  const handleNoHover = useCallback((_event: MouseEvent<HTMLElement>) => {
    highResImage.current = null;
    setHoverImage(false);
  }, []);

  useEffect(() => {
    const element = targetContainer.current;
    if (element) {
      // Initial dimensions
      updateDimensions();

      // Update dimensions on window resize
      window.addEventListener('resize', updateDimensions);

      // Clean up event listener
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, [updateDimensions]);

  useMouseOverZoom(highResImage, source, target, cursor, enablePreview, canvasDimensions);

  const RulesHeading = useMemo(
    () => (props: { heading: string; subHeading: string }) => {
      const { heading, subHeading } = props;
      // Query Wizard Rules
      // Explore the different rules and filters that the Query Wizard offers.
      return (
        <div>
          <Typography component="h3" variant="h5" sx={{ color: 'text.primary' }}>
            {heading}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: { xs: 2, sm: 4 } }}>
            {subHeading}
          </Typography>
        </div>
      );
    },
    [],
  );

  return (
    <Box id={`${prefix}-features`} sx={{ pb: { xs: 4, sm: 8 } }} onMouseEnter={handleMouseEnterContainer}>
      <Grid container spacing={6} sx={{ width: '100%', marginLeft: 0, marginTop: 0 }}>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            paddingLeft: '0 !important',
          }}
          className={`${prefix}-feature-grid`}
          display="flex"
          flexDirection="column"
          position="relative"
        >
          <Grid container item sx={{ gap: 1, display: { xs: 'auto', sm: 'none' } }}>
            <RulesHeading heading={heading} subHeading={subHeading} />
            {features.map(({ title }, index) => (
              <Chip
                key={index}
                label={title}
                onClick={() => handleItemClick(index)}
                selected={selectedItemIndex === index}
              />
            ))}
          </Grid>
          <Card className="small-image-card" variant="outlined" sx={{ display: { xs: 'auto', sm: 'none' }, mt: 4 }}>
            <Box
              className="small-image-container"
              sx={(theme) => ({
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                minHeight: 280,
                backgroundRepeat: 'no-repeat',
                backgroundImage: 'var(--items-image-light)',
                ...theme.applyStyles('dark', {
                  backgroundImage: 'var(--items-image-dark)',
                }),
              })}
              style={
                {
                  '--items-image-light': `url("${selectedFeature.imageLight}")`,
                  '--items-image-dark': `url("${selectedFeature.imageDark}")`,
                } as any
              }
            />
            <Box sx={{ px: 2, pb: 2 }}>
              <Typography gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                {selectedFeature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                {selectedFeature.description}
              </Typography>
            </Box>
          </Card>
          <Stack
            direction="column"
            className={`${prefix}-feature-card-stack`}
            spacing={2}
            useFlexGap
            ref={targetContainer}
            sx={{
              justifyContent: 'center',
              alignItems: 'flex-start',
              width: '100%',
              position: 'relative',
              display: { xs: 'none', sm: 'flex' },
            }}
          >
            {features.map(({ icon, title, description }, index) => (
              <Card
                className="feature-card"
                key={index}
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={[
                  (theme) => ({
                    p: 1,
                    height: 'fit-content',
                    width: '100%',
                    background: 'none',
                    '&:hover': {
                      background:
                        'linear-gradient(to bottom right, hsla(210, 100%, 97%, 0.5) 25%, hsla(210, 100%, 90%, 0.3) 100%)',
                      borderColor: 'primary.light',
                      boxShadow: '0px 2px 8px hsla(0, 0%, 0%, 0.1)',
                      ...theme.applyStyles('dark', {
                        background:
                          'linear-gradient(to right bottom, hsla(210, 100%, 12%, 0.2) 25%, hsla(210, 100%, 16%, 0.2) 100%)',
                        borderColor: 'primary.dark',
                        boxShadow: '0px 1px 8px hsla(210, 100%, 25%, 0.5) ',
                      }),
                    },
                  }),
                  selectedItemIndex === index &&
                    ((theme) => ({
                      backgroundColor: 'action.selected',
                      borderColor: 'primary.light',
                      ...theme.applyStyles('dark', {
                        borderColor: 'primary.dark',
                      }),
                    })),
                ]}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    textAlign: 'left',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={[
                      (theme) => ({
                        color: 'grey.400',
                        ...theme.applyStyles('dark', {
                          color: 'grey.600',
                        }),
                        [theme.breakpoints.down('md')]: {},
                      }),
                      selectedItemIndex === index && {
                        color: 'primary.main',
                      },
                    ]}
                  >
                    {icon}
                  </Box>
                  <div>
                    <Typography gutterBottom sx={{ color: 'text.primary', fontWeight: 'medium' }}>
                      {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                      {description}
                    </Typography>
                  </div>
                </Box>
              </Card>
            ))}
            <StyledCanvas className={hoverImage ? 'show' : 'hide'} elevation={5}>
              <canvas ref={target} />
            </StyledCanvas>
          </Stack>
        </Grid>
        <Grid
          item
          className="image-grid"
          flexDirection={'column'}
          xs={12}
          md={6}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            width: '100%',
            height: '100%',
            paddingLeft: { sm: '0 !important', md: '3rem !important' },
            paddingTop: '3rem',
          }}
        >
          <RulesHeading heading={heading} subHeading={subHeading} />
          <Card
            variant="outlined"
            className="image-card"
            sx={{
              width: '100%',
              height: '100%',
              display: { xs: 'none', sm: 'flex' },
              position: 'relative',
            }}
          >
            <StyledImage
              src={isDarkMode ? selectedFeature.imageDark : selectedFeature.imageLight}
              onMouseOver={handleHover}
              onMouseLeave={handleNoHover}
              ref={source}
            />
            <ZoomCursor ref={cursor} className="" />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

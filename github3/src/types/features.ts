import { JSX, PropsWithChildren } from 'react';
import { Direction } from '@mui/system';

export type ChipProps = {
  selected?: boolean;
};

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

export type FeaturesBarProps = {
  tabValue: number;
  onTabSelect: (_event: unknown, value: number) => void;
};

export type FeaturesPanelProps = PropsWithChildren & {
  index: number;
  value: number;
  dir: Direction;
  padding?: number;
};

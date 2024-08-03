import type { Direction } from '@mui/system';
import type { PropsWithChildren, SyntheticEvent } from 'react';

export type ViewSelectCallback = (_event: SyntheticEvent, value: number) => void;
export type ContentWizardBarProps = {
  selectedView: number;
  onViewSelect: ViewSelectCallback;
};

export type ViewPanelProps = PropsWithChildren & {
  index: number;
  value: number;
  dir: Direction;
  padding?: number;
};

export type ViewPanelSelectCallback = (index: number) => void;
export type ViewsProps = {
  selectedView: number;
  onViewPanelSelect: ViewPanelSelectCallback;
};

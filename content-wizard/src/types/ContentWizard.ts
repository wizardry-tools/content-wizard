import { Direction } from '@mui/system';
import { PropsWithChildren, SyntheticEvent } from 'react';

export type ContentWizardBarProps = {
  tabValue: number;
  onTabSelect: (_event: SyntheticEvent, value: number) => void;
};

export type TabPanelProps = PropsWithChildren & {
  index: number;
  value: number;
  dir: Direction;
  padding?: number;
};

export type ViewsProps = {
  tabValue: number;
  onTabPanelSelect: (index: number) => void;
};

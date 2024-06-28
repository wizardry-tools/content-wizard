import type { SyntheticEvent } from 'react';
import type { ViewsProps } from './ContentWizard';
import type { FieldConfig, FieldsConfig } from './Fields';
export type QueryWizardProps = Pick<ViewsProps, 'onViewPanelSelect'>;
export type QueryButtonProps = {
  isRunning: boolean;
  disabled: boolean;
  onClick: () => void;
};
export type AccordionTabProps = {
  fields: FieldConfig[];
  fullConfig: FieldsConfig;
  expanded: string | false;
  onChange: (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => void;
};

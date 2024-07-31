import { SyntheticEvent } from 'react';
import { ViewsProps } from './ContentWizard';
import { FieldConfig, FieldsConfig } from './Fields';
export type QueryWizardProps = Pick<ViewsProps, 'onTabPanelSelect'>;
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

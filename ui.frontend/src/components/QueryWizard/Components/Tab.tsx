import { fieldCategories, FieldConfig, FieldsConfig } from './fields';
import { ElementType, SyntheticEvent, useMemo } from 'react';
import { Accordion as AccordionTab, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FormGrid } from './FormGrid';
import { useLogger } from '@/providers';
import { useRenderCount } from '@/utility';

export type TabProps = {
  fields: FieldConfig[];
  fullConfig: FieldsConfig;
  expanded: string | false;
  onChange: (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => void;
};
export const Tab = (props: TabProps) => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `Tab[${renderCount}] render()` });

  const { expanded, fields, fullConfig, onChange } = props;

  const { drawerID, summary } = useMemo(() => {
    const category = fields[0].category;
    return {
      drawerID: `accordion-drawer--${category}`,
      summary: fieldCategories[category],
    };
  }, [fields]);

  const drawerContents = useMemo(
    () =>
      fields.map((field) => {
        if (!field.render) {
          return null;
        }
        const disabled =
          field.isDisabled && typeof field.isDisabled === 'function' ? field.isDisabled(fullConfig) : false;
        const Component: ElementType = field.fieldType;
        return <Component key={field.name} defaultValue={field.value} field={field} disabled={disabled} />;
      }),
    [fields, fullConfig],
  );

  return (
    <AccordionTab key={drawerID} expanded={expanded === drawerID} onChange={onChange(drawerID)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${drawerID}-content`} id={`${drawerID}-header`}>
        <Typography variant="h4" sx={{ flexShrink: 1 }}>
          {summary}
        </Typography>
      </AccordionSummary>
      <FormGrid className={`${drawerID}-grid smooth-transition`} container padding={1} spacing={2}>
        {drawerContents}
      </FormGrid>
    </AccordionTab>
  );
};

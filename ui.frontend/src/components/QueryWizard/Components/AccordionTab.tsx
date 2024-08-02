import { useMemo } from 'react';
import type { ElementType } from 'react';
import { Accordion as MuiAccordion, AccordionSummary, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { AccordionTabProps } from '@/types';
import { useLogger } from '@/providers';
import { useRenderCount } from '@/utility';
import { fieldCategories } from '@/components/QueryWizard/Components/fields';
import { FormGrid } from './FormGrid';

export const AccordionTab = (props: AccordionTabProps) => {
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
    <MuiAccordion key={drawerID} expanded={expanded === drawerID} onChange={onChange(drawerID)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${drawerID}-content`} id={`${drawerID}-header`}>
        <Typography variant="h4" sx={{ flexShrink: 1 }}>
          {summary}
        </Typography>
      </AccordionSummary>
      <FormGrid className={`${drawerID}-grid smooth-transition`} container padding={1} spacing={2}>
        {drawerContents}
      </FormGrid>
    </MuiAccordion>
  );
};

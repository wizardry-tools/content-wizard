import { useCallback, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { Paper } from '@mui/material';
import { useFields, useLogger } from '@/providers';
import { useRenderCount } from '@/utility';
import {
  authoringFields,
  msmFields,
  replicationFields,
  targetingFields,
  translationFields,
} from './fields';
import { AccordionTab } from './AccordionTab';

export const Accordion = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `Accordion[${renderCount}] render()` });

  const [expanded, setExpanded] = useState<string | false>(false);
  const fieldsConfig = useFields();

  const handleAccordionChange = useCallback(
    (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    [],
  );

  return (
    <Paper className="accordion-paper" elevation={3}>
      <AccordionTab
        fields={targetingFields()}
        fullConfig={fieldsConfig}
        expanded={expanded}
        onChange={handleAccordionChange}
      />
      <AccordionTab
        fields={authoringFields()}
        fullConfig={fieldsConfig}
        expanded={expanded}
        onChange={handleAccordionChange}
      />
      <AccordionTab
        fields={replicationFields()}
        fullConfig={fieldsConfig}
        expanded={expanded}
        onChange={handleAccordionChange}
      />
      <AccordionTab
        fields={msmFields()}
        fullConfig={fieldsConfig}
        expanded={expanded}
        onChange={handleAccordionChange}
      />
      <AccordionTab
        fields={translationFields()}
        fullConfig={fieldsConfig}
        expanded={expanded}
        onChange={handleAccordionChange}
      />
      {/*<AccordionTab*/}
      {/*  fields={customFields()}*/}
      {/*  fullConfig={fieldsConfig}*/}
      {/*  expanded={expanded}*/}
      {/*  onChange={handleAccordionChange}*/}
      {/*/>*/}
    </Paper>
  );
};

import { SyntheticEvent, useCallback, useRef, useState } from 'react';
import { Tab } from './Tab';
import { authoringFields, msmFields, replicationFields, targetingFields, translationFields } from './index';
import { Paper } from '@mui/material';
import { useFields, useLogger } from 'src/providers';

export const Accordion = () => {
  const logger = useLogger();
  const renderCount = useRef(0);
  logger.debug({ message: `Accordion[${++renderCount.current}] render()` });

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
      <Tab fields={targetingFields()} fullConfig={fieldsConfig} expanded={expanded} onChange={handleAccordionChange} />
      <Tab fields={authoringFields()} fullConfig={fieldsConfig} expanded={expanded} onChange={handleAccordionChange} />
      <Tab
        fields={replicationFields()}
        fullConfig={fieldsConfig}
        expanded={expanded}
        onChange={handleAccordionChange}
      />
      <Tab fields={msmFields()} fullConfig={fieldsConfig} expanded={expanded} onChange={handleAccordionChange} />
      <Tab
        fields={translationFields()}
        fullConfig={fieldsConfig}
        expanded={expanded}
        onChange={handleAccordionChange}
      />
    </Paper>
  );
};

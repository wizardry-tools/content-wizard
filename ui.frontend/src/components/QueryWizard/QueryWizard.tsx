import { Accordion as AccordionTab, AccordionSummary, Stack, Paper, Typography, Theme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ElementType, ReactNode, SyntheticEvent, useCallback, useMemo, useState } from 'react';
import { useFields, useFieldDispatch, useQuery } from 'src/providers';
import { fieldCategories, fieldCategoryTypes, FieldConfig } from './Components';
import { Tooltip, WizardStatementEditor } from 'src/components/IDE/core/src';
import { FormGrid } from './Components';
import { ViewsProps } from 'src/components/ContentWizard/Views';
import { QueryHandler } from 'src/components/Query';

import './QueryWizard.scss';

const buttonStackStyles = (_theme: Theme) => {
  return {
    display: 'block',
    overflowX: 'visible',
    width: 0,
  };
};

export type QueryWizardProps = Pick<ViewsProps, 'onTabPanelSelect'>;

export function QueryWizard({ onTabPanelSelect }: QueryWizardProps) {
  const fields = useFields();
  const targetingFields = useMemo(() => {
    return Object.values(fields).filter((field) => field.category === fieldCategoryTypes.targeting);
  }, [fields]);
  const authoringFields = useMemo(() => {
    return Object.values(fields).filter((field) => field.category === fieldCategoryTypes.authoring);
  }, [fields]);
  const replicationFields = useMemo(() => {
    return Object.values(fields).filter((field) => field.category === fieldCategoryTypes.replication);
  }, [fields]);
  const msmFields = useMemo(() => {
    return Object.values(fields).filter((field) => field.category === fieldCategoryTypes.msm);
  }, [fields]);
  const translationFields = useMemo(() => {
    return Object.values(fields).filter((field) => field.category === fieldCategoryTypes.translation);
  }, [fields]);
  const [expanded, setExpanded] = useState<string | false>(false);

  const fieldDispatch = useFieldDispatch();
  const query = useQuery();

  const handleChange = (field: FieldConfig) => {
    fieldDispatch({
      name: field.name,
      value: field.value,
      type: 'UPDATE_VALUE',
    });
  };
  const memoizedHandleChange = useCallback(handleChange, [fieldDispatch]);

  const handleAccordionChange = (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const Tab = useCallback(
    (accordionFields: FieldConfig[]) => {
      const category = accordionFields[0].category;
      const drawerID = `accordion-drawer--${category}`;
      const summary = fieldCategories[category];
      const drawerContents = accordionFields.map((field) => {
        if (field.isDisabled && field.isDisabled(fields)) {
          return null;
        }
        const Component: ElementType = field.fieldType as ElementType;
        return <Component onChange={memoizedHandleChange} key={field.name} defaultValue={field.value} field={field} />;
      });
      return (
        <AccordionTab key={drawerID} expanded={expanded === drawerID} onChange={handleAccordionChange(drawerID)}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`${drawerID}-content`}
            id={`${drawerID}-header`}
          >
            <Typography variant="h4" sx={{ flexShrink: 1 }}>
              {summary}
            </Typography>
          </AccordionSummary>
          <FormGrid className={`${drawerID}-grid smooth-transition`} container padding={1} spacing={2}>
            {drawerContents}
          </FormGrid>
        </AccordionTab>
      );
    },
    [expanded, fields, memoizedHandleChange],
  );

  const Accordion = () => {
    let drawers: ReactNode[] = [];
    drawers.push(Tab(targetingFields));
    drawers.push(Tab(authoringFields));
    drawers.push(Tab(replicationFields));
    drawers.push(Tab(msmFields));
    drawers.push(Tab(translationFields));
    return (
      <Paper className="accordion-paper" elevation={3}>
        {drawers}
      </Paper>
    );
  };

  const StatementWindow = useMemo(() => {
    if (query.statement) {
      return (
        <Paper elevation={3} className="statement-paper">
          <Tooltip.Provider>
            <Stack className="wizard-editor-stack" direction="row" spacing={1}>
              <WizardStatementEditor editorTheme="wizard" keyMap="sublime" className="querybuilder-statement" />
            </Stack>
          </Tooltip.Provider>
        </Paper>
      );
    }
    return null;
  }, [query.statement]);

  return (
    <Paper className="wizard-builder">
      <Stack className="main-stack" direction="row" useFlexGap>
        <Stack className="statement-stack">{StatementWindow}</Stack>
        <Stack className="accordion-stack">{Accordion()}</Stack>
        <Stack className="query-button-stack" sx={buttonStackStyles} justifyContent="flex-start">
          <QueryHandler onResults={onTabPanelSelect} />
        </Stack>
      </Stack>
    </Paper>
  );
}

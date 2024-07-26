import { SyntheticEvent, memo, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { questionsAndAnswers } from '@/content';

export function FAQ() {
  const [expanded, setExpanded] = useState<string>('');

  const handleChange = (panel: string) => (_event: SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : '');
  };

  const FAQAccordion = memo(() => {
    return (
      <Box sx={{ width: '100%' }}>
        {questionsAndAnswers.map((qna, index) => {
          const id = `panel${index}`;
          return (
            <Accordion expanded={expanded === id} key={id} onChange={handleChange(id)}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${id}d-content`} id={`${id}d-header`}>
                <Typography component="h3" variant="subtitle2">
                  {qna.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body2"
                  gutterBottom
                  component={'section'}
                  sx={{ maxWidth: { sm: '100%', md: '70%' } }}
                >
                  {qna.answer}
                </Typography>
                {qna.image}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    );
  });

  return (
    <Box
      sx={(theme) => ({
        color: theme.palette.mode === 'dark' ? 'white' : 'black',
        bgcolor: theme.palette.mode === 'dark' ? 'hsl(220, 30%, 2%)' : 'hsl(220, 30%, 96%)',
      })}
    >
      <Container
        id="faq"
        sx={{
          pt: { xs: 4, sm: 8 },
          pb: { xs: 8, sm: 12 },
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Typography
          component="h2"
          variant="h4"
          sx={{
            color: 'text.primary',
            width: { sm: '100%', md: '60%' },
            textAlign: 'center',
          }}
        >
          Frequently asked questions
        </Typography>
        <FAQAccordion />
      </Container>
    </Box>
  );
}

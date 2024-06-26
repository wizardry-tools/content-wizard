

// TODO: Refactor this to be agnostic of component, so that it can be reused
// For TabPanel
export function a11yProps(index: number) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}
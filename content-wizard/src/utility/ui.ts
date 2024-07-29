// For TabPanel
export function a11yProps(index: number, id = 'full-width-tab-') {
  return {
    id: `${id}${index}`,
    'aria-controls': `${id}${index}`,
  };
}

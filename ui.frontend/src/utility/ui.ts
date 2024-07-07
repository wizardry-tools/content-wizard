// For TabPanel
export function a11yProps(index: number, id: string = 'full-width-tab-') {
  return {
    id: `${id}${index}`,
    'aria-controls': `${id}${index}`,
  };
}

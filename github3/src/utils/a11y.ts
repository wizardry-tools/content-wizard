export function a11yProps(index: number, id = 'tab-'): Record<string, string> {
  return {
    id: `${id}${index}`,
    'aria-controls': `${id}${index}`,
  };
}

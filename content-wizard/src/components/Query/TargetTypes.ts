import { TargetType, TargetTypeLabel } from '@/types';

export const targetTypes: Record<TargetType, TargetTypeLabel> = {
  none: 'None',
  resource: 'Resource Type',
  template: 'Template Type',
  text: 'Full Text Search',
};

//export const TargetTypeLookup = createReverseMapping(TargetTypes);

import type { GraphiQLPlugin } from '@/types';
import { HistoryIcon } from '@/icons';
import { History } from '../../history';

export const HISTORY_PLUGIN: GraphiQLPlugin = {
  title: 'History',
  icon: HistoryIcon,
  content: History,
};

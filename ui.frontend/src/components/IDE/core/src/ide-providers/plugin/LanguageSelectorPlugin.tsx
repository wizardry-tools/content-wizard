import type { GraphiQLPlugin } from '@/types';
import { ProgrammingCode } from '@/icons';
import { LanguageSelector } from '../../language-selector';

export const LANGUAGE_SELECTOR_PLUGIN: GraphiQLPlugin = {
  title: 'Language Selector',
  icon: ProgrammingCode,
  content: LanguageSelector,
};

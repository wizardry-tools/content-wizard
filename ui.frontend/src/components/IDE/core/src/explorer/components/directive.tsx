import type { DirectiveProps } from '@/types';
import './directive.scss';

export function Directive({ directive }: DirectiveProps) {
  return <span className="wizard-doc-explorer-directive">@{directive.name.value}</span>;
}

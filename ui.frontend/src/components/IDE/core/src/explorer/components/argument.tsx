import type { ArgumentProps } from '@/types';
import { MarkdownContent } from '../../ui';
import { DefaultValue } from './default-value';
import { TypeLink } from './type-link';
import './argument.scss';

export const Argument = ({ arg, showDefaultValue, inline }: ArgumentProps) => {
  const definition = (
    <span>
      <span className="wizard-doc-explorer-argument-name">{arg.name}</span>
      {': '}
      <TypeLink type={arg.type} />
      {showDefaultValue !== false && <DefaultValue field={arg} />}
    </span>
  );
  if (inline) {
    return definition;
  }
  return (
    <div className="wizard-doc-explorer-argument">
      {definition}
      {arg.description ? <MarkdownContent type="description">{arg.description}</MarkdownContent> : null}
      {arg.deprecationReason ? (
        <div className="wizard-doc-explorer-argument-deprecation">
          <div className="wizard-doc-explorer-argument-deprecation-label">Deprecated</div>
          <MarkdownContent type="deprecation">{arg.deprecationReason}</MarkdownContent>
        </div>
      ) : null}
    </div>
  );
};

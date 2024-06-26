import { GraphQLArgument } from 'graphql';

import { DefaultValue } from './default-value';
import { TypeLink } from './type-link';

import './argument.scss';
import { MarkdownContent } from '../../ui';

type ArgumentProps = {
  /**
   * The argument that should be rendered.
   */
  arg: GraphQLArgument;
  /**
   * Toggle if the default value for the argument is shown (if there is one)
   * @default false
   */
  showDefaultValue?: boolean;
  /**
   * Toggle whether to render the whole argument including description and
   * deprecation reason (`false`) or to just render the argument name, type,
   * and default value in a single line (`true`).
   * @default false
   */
  inline?: boolean;
};

export function Argument({ arg, showDefaultValue, inline }: ArgumentProps) {
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
      {arg.description ? (
        <MarkdownContent type="description">{arg.description}</MarkdownContent>
      ) : null}
      {arg.deprecationReason ? (
        <div className="wizard-doc-explorer-argument-deprecation">
          <div className="wizard-doc-explorer-argument-deprecation-label">
            Deprecated
          </div>
          <MarkdownContent type="deprecation">
            {arg.deprecationReason}
          </MarkdownContent>
        </div>
      ) : null}
    </div>
  );
}

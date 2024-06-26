import { DirectiveNode } from 'graphql';

import './directive.scss';

type DirectiveProps = {
  /**
   * The directive that should be rendered.
   */
  directive: DirectiveNode;
};

export function Directive({ directive }: DirectiveProps) {
  return (
    <span className="wizard-doc-explorer-directive">
      @{directive.name.value}
    </span>
  );
}

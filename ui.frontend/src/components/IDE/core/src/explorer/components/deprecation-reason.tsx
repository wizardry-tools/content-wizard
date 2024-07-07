import { MarkdownContent } from '../../ui';

import './deprecation-reason.scss';

type DeprecationReasonProps = {
  /**
   * The deprecation reason as markdown string.
   */
  children?: string | null;
  preview?: boolean;
};

export function DeprecationReason(props: DeprecationReasonProps) {
  return props.children ? (
    <div className="wizard-doc-explorer-deprecation">
      <div className="wizard-doc-explorer-deprecation-label">Deprecated</div>
      <MarkdownContent type="deprecation" onlyShowFirstChild={props.preview ?? true}>
        {props.children}
      </MarkdownContent>
    </div>
  ) : null;
}

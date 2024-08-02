import type { DeprecationReasonProps } from '@/types';
import { MarkdownContent } from '../../ui';
import './deprecation-reason.scss';

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

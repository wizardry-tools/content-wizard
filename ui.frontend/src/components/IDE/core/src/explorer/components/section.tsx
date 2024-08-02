import type { ComponentType } from 'react';
import type { ExplorerSectionProps } from '@/types';
import {
  ArgumentIcon,
  DeprecatedArgumentIcon,
  DeprecatedEnumValueIcon,
  DeprecatedFieldIcon,
  DirectiveIcon,
  EnumValueIcon,
  FieldIcon,
  ImplementsIcon,
  RootTypeIcon,
  TypeIcon,
} from '@/icons';
import './section.scss';

export function ExplorerSection(props: ExplorerSectionProps) {
  const Icon = TYPE_TO_ICON[props.title];
  return (
    <div>
      <div className="wizard-doc-explorer-section-title">
        <Icon />
        {props.title}
      </div>
      <div className="wizard-doc-explorer-section-content">{props.children}</div>
    </div>
  );
}

const TYPE_TO_ICON: Record<ExplorerSectionProps['title'], ComponentType> = {
  Arguments: ArgumentIcon,
  'Deprecated Arguments': DeprecatedArgumentIcon,
  'Deprecated Enum Values': DeprecatedEnumValueIcon,
  'Deprecated Fields': DeprecatedFieldIcon,
  Directives: DirectiveIcon,
  'Enum Values': EnumValueIcon,
  Fields: FieldIcon,
  Implements: ImplementsIcon,
  Implementations: TypeIcon,
  'Possible Types': TypeIcon,
  'Root Types': RootTypeIcon,
  Type: TypeIcon,
  'All Schema Types': TypeIcon,
};

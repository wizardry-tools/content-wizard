/**
 * All icons must be added to this module.
 * Exposed via '@/icons'
 */
import { ComponentProps, FC } from 'react';
import { ReactComponent as _ArgumentIcon } from './argument.svg';
import { ReactComponent as _ChevronDownIcon } from './chevron-down.svg';
import { ReactComponent as _ChevronLeftIcon } from './chevron-left.svg';
import { ReactComponent as _ChevronUpIcon } from './chevron-up.svg';
import { ReactComponent as _CloseIcon } from './close.svg';
import { ReactComponent as _CopyIcon } from './copy.svg';
import { ReactComponent as _DeprecatedArgumentIcon } from './deprecated-argument.svg';
import { ReactComponent as _DeprecatedEnumValueIcon } from './deprecated-enum-value.svg';
import { ReactComponent as _DeprecatedFieldIcon } from './deprecated-field.svg';
import { ReactComponent as _DirectiveIcon } from './directive.svg';
import { ReactComponent as _DocsFilledIcon } from './docs-filled.svg';
import { ReactComponent as _DocsIcon } from './docs.svg';
import { ReactComponent as _EnumValueIcon } from './enum-value.svg';
import { ReactComponent as _FieldIcon } from './field.svg';
import { ReactComponent as _HistoryIcon } from './history.svg';
import { ReactComponent as _ImplementsIcon } from './implements.svg';
import { ReactComponent as _KeyboardShortcutIcon } from './keyboard-shortcut.svg';
import { ReactComponent as _MagicWand } from './magic-wand.svg';
import { ReactComponent as _MagnifyingGlassIcon } from './magnifying-glass.svg';
import { ReactComponent as _MergeIcon } from './merge.svg';
import { ReactComponent as _PenIcon } from './pen.svg';
import { ReactComponent as _PlayIcon } from './play.svg';
import { ReactComponent as _PlusIcon } from './plus.svg';
import { ReactComponent as _PrettifyIcon } from './prettify.svg';
import { ReactComponent as _ProgrammingCode } from './programming-code.svg';
import { ReactComponent as _ReloadIcon } from './reload.svg';
import { ReactComponent as _RootTypeIcon } from './root-type.svg';
import { ReactComponent as _Run } from './run.svg';
import { ReactComponent as _SettingsIcon } from './settings.svg';
import { ReactComponent as _StarFilledIcon } from './star-filled.svg';
import { ReactComponent as _StarIcon } from './star.svg';
import { ReactComponent as _StopIcon } from './stop.svg';
import { ReactComponent as _Table } from './table.svg';
import { ReactComponent as _TrashIcon } from './trash.svg';
import { ReactComponent as _TypeIcon } from './type.svg';

export const ArgumentIcon = generateIcon(_ArgumentIcon);
export const ChevronDownIcon = generateIcon(_ChevronDownIcon);
export const ChevronLeftIcon = generateIcon(_ChevronLeftIcon);
export const ChevronUpIcon = generateIcon(_ChevronUpIcon);
export const CloseIcon = generateIcon(_CloseIcon);
export const CopyIcon = generateIcon(_CopyIcon);
export const DeprecatedArgumentIcon = generateIcon(_DeprecatedArgumentIcon);
export const DeprecatedEnumValueIcon = generateIcon(_DeprecatedEnumValueIcon);
export const DeprecatedFieldIcon = generateIcon(_DeprecatedFieldIcon);
export const DirectiveIcon = generateIcon(_DirectiveIcon);
export const DocsFilledIcon = generateIcon(_DocsFilledIcon, 'filled docs icon');
export const DocsIcon = generateIcon(_DocsIcon);
export const EnumValueIcon = generateIcon(_EnumValueIcon);
export const FieldIcon = generateIcon(_FieldIcon);
export const HistoryIcon = generateIcon(_HistoryIcon);
export const ImplementsIcon = generateIcon(_ImplementsIcon);
export const KeyboardShortcutIcon = generateIcon(_KeyboardShortcutIcon);
export const MagicWand = generateIcon(_MagicWand);
export const MagnifyingGlassIcon = generateIcon(_MagnifyingGlassIcon);
export const MergeIcon = generateIcon(_MergeIcon);
export const PenIcon = generateIcon(_PenIcon);
export const PlayIcon = generateIcon(_PlayIcon);
export const PlusIcon = generateIcon(_PlusIcon);
export const PrettifyIcon = generateIcon(_PrettifyIcon);
export const ProgrammingCode = generateIcon(_ProgrammingCode);
export const ReloadIcon = generateIcon(_ReloadIcon);
export const RootTypeIcon = generateIcon(_RootTypeIcon);
export const RunIcon = generateIcon(_Run);
export const SettingsIcon = generateIcon(_SettingsIcon);
export const StarFilledIcon = generateIcon(_StarFilledIcon, 'filled star icon');
export const StarIcon = generateIcon(_StarIcon);
export const StopIcon = generateIcon(_StopIcon);
export const TableIcon = generateIcon(_Table);
export const TrashIcon = generateIcon(_TrashIcon, 'trash icon');
export const TypeIcon = generateIcon(_TypeIcon);

function generateIcon(RawComponent: any, titleProp?: string): FC<ComponentProps<'svg'>> {
  const title =
    titleProp ||
    (typeof RawComponent.name !== 'undefined' &&
      RawComponent.name
        // Icon component name starts with `Svg${CamelCaseFilename without .svg}`
        .replace('Svg', '')
        // Insert a space before all caps
        .replaceAll(/([A-Z])/g, ' $1')
        .trimStart()
        .toLowerCase() + ' icon') ||
    undefined;
  function IconComponent(props: ComponentProps<'svg'>) {
    return <RawComponent title={title} {...props} />;
  }
  IconComponent.displayName = RawComponent.name;
  return IconComponent;
}

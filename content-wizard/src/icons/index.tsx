/**
 * All icons must be added to this module.
 * Exposed via '@/icons'
 */
import { ComponentProps, FC, SVGProps } from 'react';
import _ArgumentIcon from './argument.svg?react';
import _ChevronDownIcon from './chevron-down.svg?react';
import _ChevronLeftIcon from './chevron-left.svg?react';
import _ChevronUpIcon from './chevron-up.svg?react';
import _CloseIcon from './close.svg?react';
import _CopyIcon from './copy.svg?react';
import _DeprecatedArgumentIcon from './deprecated-argument.svg?react';
import _DeprecatedEnumValueIcon from './deprecated-enum-value.svg?react';
import _DeprecatedFieldIcon from './deprecated-field.svg?react';
import _DirectiveIcon from './directive.svg?react';
import _DocsFilledIcon from './docs-filled.svg?react';
import _DocsIcon from './docs.svg?react';
import _EnumValueIcon from './enum-value.svg?react';
import _FieldIcon from './field.svg?react';
import _HistoryIcon from './history.svg?react';
import _ImplementsIcon from './implements.svg?react';
import _KeyboardShortcutIcon from './keyboard-shortcut.svg?react';
import _MagicWand from './magic-wand.svg?react';
import _MagnifyingGlassIcon from './magnifying-glass.svg?react';
import _MergeIcon from './merge.svg?react';
import _PenIcon from './pen.svg?react';
import _PlayIcon from './play.svg?react';
import _PlusIcon from './plus.svg?react';
import _PrettifyIcon from './prettify.svg?react';
import _ProgrammingCode from './programming-code.svg?react';
import _ReloadIcon from './reload.svg?react';
import _RootTypeIcon from './root-type.svg?react';
import _Run from './run.svg?react';
import _SettingsIcon from './settings.svg?react';
import _StarFilledIcon from './star-filled.svg?react';
import _StarIcon from './star.svg?react';
import _StopIcon from './stop.svg?react';
import _Table from './table.svg?react';
import _TrashIcon from './trash.svg?react';
import _TypeIcon from './type.svg?react';

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

function generateIcon(RawComponent: FC<SVGProps<SVGSVGElement>>, titleProp?: string): FC<ComponentProps<'svg'>> {
  const title = titleProp ?? extractName(RawComponent) ?? 'untitled svg';
  function IconComponent(props: ComponentProps<'svg'>) {
    return <RawComponent {...props} />;
  }
  IconComponent.displayName = title;
  return IconComponent;
}

function extractName(RawComponent: unknown) {
  if (
    RawComponent &&
    typeof RawComponent === 'object' &&
    'name' in RawComponent &&
    typeof RawComponent.name === 'string'
  ) {
    return (
      RawComponent.name
        .replace('Svg', '')
        // Insert a space before all caps
        .replaceAll(/([A-Z])/g, ' $1')
        .trimStart()
        .toLowerCase() + ' icon'
    );
  } else {
    return undefined;
  }
}

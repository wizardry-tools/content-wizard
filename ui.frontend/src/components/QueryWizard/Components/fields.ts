import { ContentTypes, TargetTypes } from 'src/components/Query';
import { ElementType } from 'react';
import dayjs from 'dayjs';

/** "Simple" Query Properties */
export const FieldConfigNames = {
  path: 'path',
  type: 'type',
  targetType: 'targetType',
  targetResourceType: 'targetResourceType',
  fulltext: 'fulltext',
  createdBy: 'createdBy',
  lastModifiedBy: 'lastModifiedBy',
  lastReplicatedBy: 'lastReplicatedBy',
  lastRolledoutBy: 'lastRolledoutBy',
  language: 'language',
  created: 'created',
  lastModified: 'lastModified',
  lastReplicated: 'lastReplicated',
  lastRolledout: 'lastRolledout',
  isPublished: 'isPublished',
  isUnpublished: 'isUnpublished',
  isDeactivated: 'isDeactivated',
  isBlueprint: 'isBlueprint',
  isLiveCopy: 'isLiveCopy',
  isSuspended: 'isSuspended',
  hasCancelledPropertyInheritance: 'hasCancelledPropertyInheritance',
  inheritanceCancelledProperty: 'inheritanceCancelledProperty',
  hasLocalContent: 'hasLocalContent',
  hasMsmGhosts: 'hasMsmGhosts',
  isLanguageCopy: 'isLanguageCopy',
  hasBeenTranslated: 'hasBeenTranslated',
  limit: 'limit',
} as const;
export type FieldConfigNameKey = keyof typeof FieldConfigNames;
export type FieldConfigName = (typeof FieldConfigNames)[FieldConfigNameKey];

export type DayTime = dayjs.Dayjs | null;
export type DateRange = {
  lowerBound: DayTime | undefined;
  upperBound: DayTime | undefined;
};
export type NumberValue = number | number[];
export type InputValue = DateRange | NumberValue | string | boolean | null | undefined;

export type onChangeCallback = (value: InputValue) => void;
export type DisabledCallback = (fields: FieldsConfig) => boolean;

export const fieldCategoryTypes = {
  targeting: 'targeting',
  authoring: 'authoring',
  replication: 'replication',
  msm: 'msm',
  translation: 'translation',
} as const;
export type FieldCategoryTypeKey = keyof typeof fieldCategoryTypes;
export type FieldCategoryType = (typeof fieldCategoryTypes)[FieldCategoryTypeKey];

// just holding a description string for now.
export type FieldCategory = string;
export const fieldCategories: Record<FieldCategoryType, FieldCategory> = {
  targeting: 'What are you looking for?',
  authoring: 'Filter by Authoring activity',
  replication: 'Filter by Replication activity',
  msm: 'Filter for MSM content',
  translation: 'Filter for Translated content',
};

export interface FieldConfig {
  readonly name: FieldConfigNameKey;
  readonly label: string;
  readonly fieldType: ElementType;
  value: InputValue;
  readonly checkboxValue?: InputValue;
  required?: boolean;
  isDisabled?: DisabledCallback;
  onChange?: onChangeCallback;
  readonly options?: typeof ContentTypes | typeof TargetTypes;
  category: FieldCategoryType;
  render?: boolean; // Dictates that the Field should not render
}
export type FieldConfigAction = Pick<FieldConfig, 'name'> &
  Pick<FieldConfig, 'value'> & {
    type: 'UPDATE_VALUE';
    caller?: Function;
  };

export const Field = (field: FieldConfig) => {
  const render = field.render ?? true;
  const isDisabled = (fields: FieldsConfig): boolean => {
    return field.isDisabled ? field.isDisabled(fields) : false;
  };
  return { ...field, isDisabled, render };
};
export type FieldsConfig = Record<FieldConfigNameKey, FieldConfig>;

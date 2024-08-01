import { ElementType, PropsWithChildren } from 'react';
import dayjs from 'dayjs';
import { Query } from './Query';

export type FieldConfigName =
  | 'path'
  | 'type'
  | 'targetType'
  | 'targetResourceType'
  | 'fulltext'
  | 'createdBy'
  | 'lastModifiedBy'
  | 'lastReplicatedBy'
  | 'lastRolledoutBy'
  | 'language'
  | 'created'
  | 'lastModified'
  | 'lastReplicated'
  | 'lastRolledout'
  | 'isPublished'
  | 'isUnpublished'
  | 'isDeactivated'
  | 'isBlueprint'
  | 'isLiveCopy'
  | 'isSuspended'
  | 'hasCancelledPropertyInheritance'
  | 'inheritanceCancelledProperty'
  | 'hasLocalContent'
  | 'hasMsmGhosts'
  | 'isLanguageCopy'
  | 'hasBeenTranslated'
  | 'limit';

export type FieldConfigCategory = 'targeting' | 'authoring' | 'replication' | 'msm' | 'translation';
export type FieldCategoryLabel = string;
export type FieldCategories = Record<FieldConfigCategory, FieldCategoryLabel>;

export type DayTime = dayjs.Dayjs | null;
export type DateRange = {
  lowerBound: DayTime | undefined;
  upperBound: DayTime | undefined;
};
export type NumberValue = number | number[];
export type InputValue = DateRange | NumberValue | string | boolean | null | undefined;

export type onChangeCallback = (value: InputValue) => void;
export type DisabledCallback = (fields: FieldsConfig) => boolean;

export type FieldConfig = {
  readonly name: FieldConfigName;
  readonly label: string;
  readonly fieldType: ElementType;
  value: InputValue;
  readonly checkboxValue?: InputValue;
  required?: boolean;
  isDisabled?: DisabledCallback;
  onChange?: onChangeCallback;
  readonly options?: Record<string, string>;
  category: FieldConfigCategory;
  render?: boolean; // Dictates that the Field should not render
};

export type FieldConfigAction = Pick<FieldConfig, 'name'> &
  Pick<FieldConfig, 'value'> & {
    type: 'UPDATE_VALUE';
  };

export type FieldsConfig = Record<FieldConfigName, FieldConfig>;

export type FieldsProviderProps = PropsWithChildren & Partial<Query>;

export type SimpleInputProps = {
  defaultValue: InputValue;
  field: FieldConfig;
  disabled: boolean;
};

export type SimpleSliderProps = SimpleInputProps & {
  min: number;
  max: number;
  step: number;
};
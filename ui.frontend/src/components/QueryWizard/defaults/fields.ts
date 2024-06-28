import {ContentTypeLookup, ContentTypes} from "../types/ContentTypes";
import {TargetTypeLookup, TargetTypes} from "../types/TargetTypes";
import * as React from "react";
import SimpleInput from "../FormElements/SimpleInput";
import SimpleSelect from "../FormElements/SimpleSelect";
import SimpleCheckbox from "../FormElements/SimpleCheckbox";
import SimpleDatePicker from "../FormElements/SimpleDatePicker";
import SimpleSlider from "../FormElements/SimpleSlider";
import dayjs from "dayjs";


export const FieldTypes: { [key: string]: React.ElementType} = {
  SimpleInput,
  SimpleSelect,
  SimpleCheckbox,
  SimpleDatePicker,
  SimpleSlider
}

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
  limit: 'limit'
} as const;
export type FieldConfigNameKey = keyof typeof FieldConfigNames;
export type FieldConfigName = typeof FieldConfigNames[FieldConfigNameKey];

export type DayTime = dayjs.Dayjs | null;
export type DateRange = {
  lowerBound: DayTime | undefined;
  upperBound: DayTime | undefined;
}
export type NumberValue = number | number[];
export type InputValue = DateRange | NumberValue | string | boolean | null | undefined;


export type onChangeCallback = (value: InputValue)=>void;
export type DisabledCallback = (fields: FieldsConfig)=>boolean;

export const fieldCategoryTypes = {
  targeting: 'targeting',
  authoring: 'authoring',
  replication: 'replication',
  msm: 'msm',
  translation: 'translation',
} as const;
export type FieldCategoryTypeKey = keyof typeof fieldCategoryTypes;
export type FieldCategoryType = typeof fieldCategoryTypes[FieldCategoryTypeKey];

// just holding a description string for now.
export type FieldCategory = string;
export const fieldCategories:Record<FieldCategoryType, FieldCategory> = {
  targeting: "What are you looking for?",
  authoring: "Filter by Authoring activity",
  replication: "Filter by Replication activity",
  msm: "Filter for MSM content",
  translation: "Filter for Translated content"
}



export interface FieldConfig {
  readonly name: FieldConfigNameKey;
  readonly label: string;
  readonly fieldType: React.ElementType;
  value:  InputValue;
  readonly checkboxValue?: InputValue;
  required?: boolean;
  isDisabled?: DisabledCallback;
  onChange?: onChangeCallback;
  readonly options?: typeof ContentTypes | typeof TargetTypes;
  category: FieldCategoryType;
}
export type FieldConfigAction = Pick<FieldConfig, 'name'> & Pick<FieldConfig, 'value'> & {
  type: 'UPDATE_VALUE';
}

export const Field = (field: FieldConfig) => {
  const isDisabled = (fields: FieldsConfig):boolean => {
    return field.isDisabled ? field.isDisabled(fields) : false;
  };
  return { ...field, isDisabled};
}

export type FieldsConfig = Record<FieldConfigNameKey, FieldConfig>;
export const fields: FieldsConfig = {
  path: Field({
    name: 'path',
    label: 'Content Path',
    fieldType: FieldTypes.SimpleInput,
    value: '/content/core-components-examples',
    required: true,
    category: fieldCategoryTypes.targeting
  }),
  type: Field({
    name: 'type',
    label: 'Content Type',
    fieldType: FieldTypes.SimpleSelect,
    value: ContentTypeLookup[ContentTypes.child],
    required: true,
    options: ContentTypes,
    category: fieldCategoryTypes.targeting
  }),
  targetType: Field({
    name: 'targetType',
    label: 'Target Type',
    fieldType: FieldTypes.SimpleSelect,
    value: TargetTypeLookup[TargetTypes.resource],
    options: TargetTypes,
    category: fieldCategoryTypes.targeting
  }),
  targetResourceType: Field({
    name: 'targetResourceType',
    label: 'Target Resource Type',
    fieldType: FieldTypes.SimpleInput,
    value: 'core-components-examples/components/text',
    isDisabled: (fields: FieldsConfig) => {
      let type = fields.targetType.value;
      return !type || type === TargetTypeLookup[TargetTypes.none] || type === TargetTypeLookup[TargetTypes.text]
    },
    category: fieldCategoryTypes.targeting
  }),
  fulltext: Field({
    name: 'fulltext',
    label: 'Text Search',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => {
      return fields.targetType.value !== TargetTypeLookup[TargetTypes.text];
    },
    category: fieldCategoryTypes.targeting
  }),
  createdBy: Field({
    name: 'createdBy',
    label: 'Created By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: fieldCategoryTypes.authoring
  }),
  lastModifiedBy: Field({
    name: 'lastModifiedBy',
    label: 'Last Modified By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: fieldCategoryTypes.authoring
  }),
  lastReplicatedBy: Field({
    name: 'lastReplicatedBy',
    label: 'Last Replicated By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isUnpublished.value),
    category: fieldCategoryTypes.replication
  }),
  lastRolledoutBy: Field({
    name: 'lastRolledoutBy',
    label: 'Last Rolledout By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm
  }),
  language: Field({
    name: 'language',
    label: 'Target Language',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: fieldCategoryTypes.translation
  }),
  created: Field({
    name: 'created',
    label: 'Creation',
    fieldType: FieldTypes.SimpleDatePicker,
    value: '',
    category: fieldCategoryTypes.authoring
  }),
  lastModified: Field({
    name: 'lastModified',
    label: 'Last Modified',
    fieldType: FieldTypes.SimpleDatePicker,
    value: '',
    category: fieldCategoryTypes.authoring
  }),
  lastReplicated: Field({
    name: 'lastReplicated',
    label: 'Last Replicated',
    fieldType: FieldTypes.SimpleDatePicker,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isUnpublished.value),
    category: fieldCategoryTypes.replication
  }),
  lastRolledout: Field({
    name: 'lastRolledout',
    label: 'Last Rolledout',
    fieldType: FieldTypes.SimpleDatePicker,
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm
  }),
  isPublished: Field({
    name: 'isPublished',
    label: 'Is Published?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'Activate',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isUnpublished.value || fields.isDeactivated.value),
    category: fieldCategoryTypes.replication
  }),
  isUnpublished: Field({
    name: 'isUnpublished',
    label: 'Is Unpublished?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isPublished.value || fields.isDeactivated.value),
    category: fieldCategoryTypes.replication
  }),
  isDeactivated: Field({
    name: 'isDeactivated',
    label: 'Is Deactivated?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'Deactivate',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isPublished.value || fields.isUnpublished.value),
    category: fieldCategoryTypes.replication
  }),
  isBlueprint: Field({
    name: 'isBlueprint',
    label: 'Is Blueprint?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:LiveSync',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isLiveCopy.value),
    category: fieldCategoryTypes.msm
  }),
  isLiveCopy: Field({
    name: 'isLiveCopy',
    label: 'Is LiveCopy?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isBlueprint.value),
    category: fieldCategoryTypes.msm
  }),
  isSuspended: Field({
    name: 'isSuspended',
    label: 'Is Suspended?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:LiveSyncCancelled',
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm
  }),
  hasCancelledPropertyInheritance: Field({
    name: 'hasCancelledPropertyInheritance',
    label: 'Has Cancelled Property Inheritance?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:PropertyLiveSyncCancelled',
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm
  }),
  inheritanceCancelledProperty: Field({
    name: 'inheritanceCancelledProperty',
    label: 'Inheritance Cancelled for Property',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm
  }),
  hasLocalContent: Field({
    name: 'hasLocalContent',
    label: 'Has Local Content?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    //isDisabled: (config: any)=>!config.isLiveCopy,
    isDisabled: ()=>true, // need logic to support child node traversal,
    category: fieldCategoryTypes.msm
  }),
  hasMsmGhosts: Field({
    name: 'hasMsmGhosts',
    label: 'is MSM Ghost Components?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'wcm/msm/components/ghost',
    value: '',
    isDisabled: (fields: FieldsConfig)=>(!fields.isSuspended.value || fields.type.value !== ContentTypeLookup[ContentTypes.child]),
    category: fieldCategoryTypes.msm
  }),
  isLanguageCopy: Field({
    name: 'isLanguageCopy',
    label: 'Is Language Copy?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: ()=>false, // TODO: is there ever a case where we can't search for language copies???,
    category: fieldCategoryTypes.translation
  }),
  hasBeenTranslated: Field({
    name: 'hasBeenTranslated',
    label: 'Has Been Translated?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'APPROVED',
    value: '',
    // checkboxValue: ['READY_FOR_REVIEW', 'APPROVED'] // TODO when multi-value is being processed
    isDisabled: (fields: FieldsConfig) => !fields.isLanguageCopy.value,
    category: fieldCategoryTypes.translation
  }),
  limit: Field({
    name: 'limit',
    label: 'Limit Results',
    fieldType: FieldTypes.SimpleSlider,
    value: 100,
    category: fieldCategoryTypes.targeting
  })
}

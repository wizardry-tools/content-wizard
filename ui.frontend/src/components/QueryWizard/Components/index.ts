import { ElementType } from 'react';
import { SimpleInput } from './SimpleInput';
import { SimpleSelect } from './SimpleSelect';
import { SimpleCheckbox } from './SimpleCheckbox';
import { SimpleDatePicker } from './SimpleDatePicker';
import { SimpleSlider } from './SimpleSlider';
import { ContentTypeLookup, ContentTypes, TargetTypeLookup, TargetTypes } from 'src/components/Query';
import { Field, fieldCategoryTypes, FieldsConfig } from './fields';

export * from './fields';
export * from './predicates';
export * from './FormGrid';
export * from './QueryButton';
export * from './SimpleInput';
export * from './SimpleDatePicker';
export * from './SimpleCheckbox';
export * from './SimpleSelect';
export * from './SimpleSlider';
export * from './StatementWindow';
export * from './Tab';
export * from './Accordion';

export const FieldTypes: { [key: string]: ElementType } = {
  SimpleInput,
  SimpleSelect,
  SimpleCheckbox,
  SimpleDatePicker,
  SimpleSlider,
};

/**
 * Monolithic configuration object that helps us define the QueryWizard fields and
 * any relevant logic to support building QueryBuilder predicates from them.
 */
export const defaultFields: FieldsConfig = {
  path: Field({
    name: 'path',
    label: 'Content Path',
    fieldType: FieldTypes.SimpleInput,
    value: '/content/we-retail',
    required: true,
    category: fieldCategoryTypes.targeting,
  }),
  type: Field({
    name: 'type',
    label: 'Content Type',
    fieldType: FieldTypes.SimpleSelect,
    value: ContentTypeLookup[ContentTypes.child],
    required: true,
    options: ContentTypes,
    category: fieldCategoryTypes.targeting,
  }),
  targetType: Field({
    name: 'targetType',
    label: 'Target Type',
    fieldType: FieldTypes.SimpleSelect,
    value: TargetTypeLookup[TargetTypes.text],
    options: TargetTypes,
    category: fieldCategoryTypes.targeting,
  }),
  targetResourceType: Field({
    name: 'targetResourceType',
    label: 'Target Resource Type',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => {
      let type = fields.targetType.value;
      return !type || type === TargetTypeLookup[TargetTypes.none] || type === TargetTypeLookup[TargetTypes.text];
    },
    category: fieldCategoryTypes.targeting,
  }),
  fulltext: Field({
    name: 'fulltext',
    label: 'Text Search',
    fieldType: FieldTypes.SimpleInput,
    value: 'winter',
    isDisabled: (fields: FieldsConfig) => {
      return fields.targetType.value !== TargetTypeLookup[TargetTypes.text];
    },
    category: fieldCategoryTypes.targeting,
  }),
  createdBy: Field({
    name: 'createdBy',
    label: 'Created By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: fieldCategoryTypes.authoring,
  }),
  lastModifiedBy: Field({
    name: 'lastModifiedBy',
    label: 'Last Modified By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: fieldCategoryTypes.authoring,
  }),
  lastReplicatedBy: Field({
    name: 'lastReplicatedBy',
    label: 'Last Replicated By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isUnpublished.value,
    category: fieldCategoryTypes.replication,
  }),
  lastRolledoutBy: Field({
    name: 'lastRolledoutBy',
    label: 'Last Rolledout By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm,
  }),
  language: Field({
    name: 'language',
    label: 'Target Language',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: fieldCategoryTypes.translation,
  }),
  created: Field({
    name: 'created',
    label: 'Creation',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    category: fieldCategoryTypes.authoring,
  }),
  lastModified: Field({
    name: 'lastModified',
    label: 'Last Modified',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    category: fieldCategoryTypes.authoring,
  }),
  lastReplicated: Field({
    name: 'lastReplicated',
    label: 'Last Replicated',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    isDisabled: (fields: FieldsConfig) => !!fields.isUnpublished.value,
    category: fieldCategoryTypes.replication,
  }),
  lastRolledout: Field({
    name: 'lastRolledout',
    label: 'Last Rolledout',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm,
  }),
  isPublished: Field({
    name: 'isPublished',
    label: 'Is Published?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'Activate',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isUnpublished.value || fields.isDeactivated.value),
    category: fieldCategoryTypes.replication,
  }),
  isUnpublished: Field({
    name: 'isUnpublished',
    label: 'Is Unpublished?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isPublished.value || fields.isDeactivated.value),
    category: fieldCategoryTypes.replication,
  }),
  isDeactivated: Field({
    name: 'isDeactivated',
    label: 'Is Deactivated?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'Deactivate',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!(fields.isPublished.value || fields.isUnpublished.value),
    category: fieldCategoryTypes.replication,
  }),
  isBlueprint: Field({
    name: 'isBlueprint',
    label: 'Is Blueprint?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:LiveSync',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm,
  }),
  isLiveCopy: Field({
    name: 'isLiveCopy',
    label: 'Is LiveCopy?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isBlueprint.value,
    category: fieldCategoryTypes.msm,
  }),
  isSuspended: Field({
    name: 'isSuspended',
    label: 'Is Suspended?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:LiveSyncCancelled',
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm,
  }),
  hasCancelledPropertyInheritance: Field({
    name: 'hasCancelledPropertyInheritance',
    label: 'Has Cancelled Property Inheritance?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:PropertyLiveSyncCancelled',
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm,
  }),
  inheritanceCancelledProperty: Field({
    name: 'inheritanceCancelledProperty',
    label: 'Inheritance Cancelled for Property',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: fieldCategoryTypes.msm,
  }),
  hasLocalContent: Field({
    name: 'hasLocalContent',
    label: 'Has Local Content?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    //isDisabled: (config: any)=>!config.isLiveCopy,
    render: false, // need logic to support child node traversal, do not render until that is implemented
    category: fieldCategoryTypes.msm,
  }),
  hasMsmGhosts: Field({
    name: 'hasMsmGhosts',
    label: 'is MSM Ghost Components?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'wcm/msm/components/ghost',
    value: '',
    isDisabled: (fields: FieldsConfig) =>
      !fields.isSuspended.value || fields.type.value !== ContentTypeLookup[ContentTypes.child],
    category: fieldCategoryTypes.msm,
  }),
  isLanguageCopy: Field({
    name: 'isLanguageCopy',
    label: 'Is Language Copy?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: () => false, // TODO: is there ever a case where we can't search for language copies???,
    category: fieldCategoryTypes.translation,
  }),
  hasBeenTranslated: Field({
    name: 'hasBeenTranslated',
    label: 'Has Been Translated?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'APPROVED',
    value: '',
    // checkboxValue: ['READY_FOR_REVIEW', 'APPROVED'] // TODO when multi-value is being processed
    isDisabled: (fields: FieldsConfig) => !fields.isLanguageCopy.value,
    category: fieldCategoryTypes.translation,
  }),
  limit: Field({
    name: 'limit',
    label: 'Limit Results',
    fieldType: FieldTypes.SimpleSlider,
    value: 100,
    category: fieldCategoryTypes.targeting,
  }),
};

export const targetingFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === fieldCategoryTypes.targeting);
};
export const authoringFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === fieldCategoryTypes.authoring);
};
export const replicationFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === fieldCategoryTypes.replication);
};
export const msmFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === fieldCategoryTypes.msm);
};
export const translationFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === fieldCategoryTypes.translation);
};

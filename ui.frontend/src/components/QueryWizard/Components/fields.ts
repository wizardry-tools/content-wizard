import type { FieldCategories, FieldConfig, FieldsConfig } from '@/types';
import type { ElementType } from 'react';
import { targetTypes, contentTypes } from '@/constants';
import { SimpleInput } from '@/components/QueryWizard/Components/SimpleInput';
import { SimpleSelect } from '@/components/QueryWizard/Components/SimpleSelect';
import { SimpleCheckbox } from '@/components/QueryWizard/Components/SimpleCheckbox';
import { SimpleDatePicker } from '@/components/QueryWizard/Components/SimpleDatePicker';
import { SimpleSlider } from '@/components/QueryWizard/Components/SimpleSlider';

export const fieldCategories: FieldCategories = {
  targeting: 'What are you looking for?',
  authoring: 'Filter by Authoring activity',
  replication: 'Filter by Replication activity',
  msm: 'Filter for MSM content',
  translation: 'Filter for Translated content',
};

export const Field = (field: FieldConfig) => {
  const render = field.render ?? true;
  const isDisabled = (fields: FieldsConfig): boolean => {
    return field.isDisabled ? field.isDisabled(fields) : false;
  };
  return { ...field, isDisabled, render };
};

export const FieldTypes: Record<string, ElementType> = {
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
    category: 'targeting',
  }),
  type: Field({
    name: 'type',
    label: 'Content Type',
    fieldType: FieldTypes.SimpleSelect,
    value: 'child',
    required: true,
    options: contentTypes,
    category: 'targeting',
  }),
  targetType: Field({
    name: 'targetType',
    label: 'Target Type',
    fieldType: FieldTypes.SimpleSelect,
    value: 'text',
    options: targetTypes,
    category: 'targeting',
  }),
  targetResourceType: Field({
    name: 'targetResourceType',
    label: 'Target Resource Type',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => {
      const type = fields.targetType.value;
      return !type || type === 'none' || type === 'text';
    },
    category: 'targeting',
  }),
  fulltext: Field({
    name: 'fulltext',
    label: 'Text Search',
    fieldType: FieldTypes.SimpleInput,
    value: 'winter',
    isDisabled: (fields: FieldsConfig) => {
      return fields.targetType.value !== 'text';
    },
    category: 'targeting',
  }),
  createdBy: Field({
    name: 'createdBy',
    label: 'Created By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: 'authoring',
  }),
  lastModifiedBy: Field({
    name: 'lastModifiedBy',
    label: 'Last Modified By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: 'authoring',
  }),
  lastReplicatedBy: Field({
    name: 'lastReplicatedBy',
    label: 'Last Replicated By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isUnpublished.value,
    category: 'replication',
  }),
  lastRolledoutBy: Field({
    name: 'lastRolledoutBy',
    label: 'Last Rolledout By',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: 'msm',
  }),
  language: Field({
    name: 'language',
    label: 'Target Language',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    category: 'translation',
  }),
  created: Field({
    name: 'created',
    label: 'Creation',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    category: 'authoring',
  }),
  lastModified: Field({
    name: 'lastModified',
    label: 'Last Modified',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    category: 'authoring',
  }),
  lastReplicated: Field({
    name: 'lastReplicated',
    label: 'Last Replicated',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    isDisabled: (fields: FieldsConfig) => !!fields.isUnpublished.value,
    category: 'replication',
  }),
  lastRolledout: Field({
    name: 'lastRolledout',
    label: 'Last Rolledout',
    fieldType: FieldTypes.SimpleDatePicker,
    value: null,
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: 'msm',
  }),
  isPublished: Field({
    name: 'isPublished',
    label: 'Is Published?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'Activate',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isUnpublished.value || !!fields.isDeactivated.value,
    category: 'replication',
  }),
  isUnpublished: Field({
    name: 'isUnpublished',
    label: 'Is Unpublished?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isPublished.value || !!fields.isDeactivated.value,
    category: 'replication',
  }),
  isDeactivated: Field({
    name: 'isDeactivated',
    label: 'Is Deactivated?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'Deactivate',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isPublished.value || !!fields.isUnpublished.value,
    category: 'replication',
  }),
  isBlueprint: Field({
    name: 'isBlueprint',
    label: 'Is Blueprint?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:LiveSync',
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isLiveCopy.value,
    category: 'msm',
  }),
  isLiveCopy: Field({
    name: 'isLiveCopy',
    label: 'Is LiveCopy?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: (fields: FieldsConfig) => !!fields.isBlueprint.value,
    category: 'msm',
  }),
  isSuspended: Field({
    name: 'isSuspended',
    label: 'Is Suspended?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:LiveSyncCancelled',
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: 'msm',
  }),
  hasCancelledPropertyInheritance: Field({
    name: 'hasCancelledPropertyInheritance',
    label: 'Has Cancelled Property Inheritance?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'cq:PropertyLiveSyncCancelled',
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: 'msm',
  }),
  inheritanceCancelledProperty: Field({
    name: 'inheritanceCancelledProperty',
    label: 'Inheritance Cancelled for Property',
    fieldType: FieldTypes.SimpleInput,
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isLiveCopy.value,
    category: 'msm',
  }),
  hasLocalContent: Field({
    name: 'hasLocalContent',
    label: 'Has Local Content?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    //isDisabled: (config: any)=>!config.isLiveCopy,
    render: false, // need logic to support child node traversal, do not render until that is implemented
    category: 'msm',
  }),
  hasMsmGhosts: Field({
    name: 'hasMsmGhosts',
    label: 'is MSM Ghost Components?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'wcm/msm/components/ghost',
    value: '',
    isDisabled: (fields: FieldsConfig) => !fields.isSuspended.value || fields.type.value !== 'child',
    category: 'msm',
  }),
  isLanguageCopy: Field({
    name: 'isLanguageCopy',
    label: 'Is Language Copy?',
    fieldType: FieldTypes.SimpleCheckbox,
    value: '',
    isDisabled: () => false, // TODO: is there ever a case where we can't search for language copies???,
    category: 'translation',
  }),
  hasBeenTranslated: Field({
    name: 'hasBeenTranslated',
    label: 'Has Been Translated?',
    fieldType: FieldTypes.SimpleCheckbox,
    checkboxValue: 'APPROVED',
    value: '',
    // checkboxValue: ['READY_FOR_REVIEW', 'APPROVED'] // TODO when multi-value is being processed
    isDisabled: (fields: FieldsConfig) => !fields.isLanguageCopy.value,
    category: 'translation',
  }),
  limit: Field({
    name: 'limit',
    label: 'Limit Results',
    fieldType: FieldTypes.SimpleSlider,
    value: 100,
    category: 'targeting',
  }),
};

export const targetingFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === 'targeting');
};
export const authoringFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === 'authoring');
};
export const replicationFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === 'replication');
};
export const msmFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === 'msm');
};
export const translationFields = () => {
  return Object.values(defaultFields).filter((field) => field.category === 'translation');
};

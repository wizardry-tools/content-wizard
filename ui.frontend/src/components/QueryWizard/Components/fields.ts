import { FieldCategories, FieldConfig, FieldConfigCategory, FieldsConfig } from '@/types';

/** "Simple" Query Properties */
// export const FieldConfigNames = {
//   path: 'path',
//   type: 'type',
//   targetType: 'targetType',
//   targetResourceType: 'targetResourceType',
//   fulltext: 'fulltext',
//   createdBy: 'createdBy',
//   lastModifiedBy: 'lastModifiedBy',
//   lastReplicatedBy: 'lastReplicatedBy',
//   lastRolledoutBy: 'lastRolledoutBy',
//   language: 'language',
//   created: 'created',
//   lastModified: 'lastModified',
//   lastReplicated: 'lastReplicated',
//   lastRolledout: 'lastRolledout',
//   isPublished: 'isPublished',
//   isUnpublished: 'isUnpublished',
//   isDeactivated: 'isDeactivated',
//   isBlueprint: 'isBlueprint',
//   isLiveCopy: 'isLiveCopy',
//   isSuspended: 'isSuspended',
//   hasCancelledPropertyInheritance: 'hasCancelledPropertyInheritance',
//   inheritanceCancelledProperty: 'inheritanceCancelledProperty',
//   hasLocalContent: 'hasLocalContent',
//   hasMsmGhosts: 'hasMsmGhosts',
//   isLanguageCopy: 'isLanguageCopy',
//   hasBeenTranslated: 'hasBeenTranslated',
//   limit: 'limit',
// } as const;
// export type FieldConfigNameKey = keyof typeof FieldConfigNames;
// export type FieldConfigName = (typeof FieldConfigNames)[FieldConfigNameKey];

// export const fieldCategoryTypes = {
//   targeting: 'targeting',
//   authoring: 'authoring',
//   replication: 'replication',
//   msm: 'msm',
//   translation: 'translation',
// } as const;
// export type FieldCategoryTypeKey = keyof typeof fieldCategoryTypes;
// export type FieldCategoryType = (typeof fieldCategoryTypes)[FieldCategoryTypeKey];

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

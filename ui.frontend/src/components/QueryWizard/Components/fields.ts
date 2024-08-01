import { FieldCategories, FieldConfig, FieldsConfig } from '@/types';

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

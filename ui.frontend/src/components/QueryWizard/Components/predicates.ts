import type { ContentType, DateRange, FieldsConfig, InputValue, PredicateConfig, PredicatesConfig } from '@/types';
import { contentTypeMap } from '@/constants';

export const Predicate = ({
  rawInject = () => '',
  configInject = () => '',
  useConfig = false,
  ...other
}: PredicateConfig) => {
  const isValid = (value: InputValue): boolean => {
    const dateRange = value as DateRange;
    const { raw, operation, valueRequired = true } = { ...other };
    if (valueRequired && !value) {
      return false;
    }
    if (raw) {
      return true;
    }
    if (!rawInject && !configInject) {
      //if (!property || !property(this.config)) {
      return false;
    }
    return !!(value ?? operation ?? (dateRange && (dateRange.upperBound ?? dateRange.lowerBound)));
  };
  return { ...other, isValid, rawInject, configInject, useConfig };
};

export const predicates: PredicatesConfig = {
  path: Predicate({
    type: 'path',
    rawInject: (value: InputValue) => `path=${value as string}\n`,
  }),
  type: Predicate({
    type: 'type',
    rawInject: (value: InputValue) => {
      const contentType = value as ContentType;
      if (contentType) {
        if (contentType === 'cf') {
          return `type=${contentTypeMap[contentType]}\ncontentfragment=true\n`;
        } else if (contentType !== 'custom') {
          return `type=${contentTypeMap[contentType]}\n`;
        }
      }
      return '';
    },
  }),
  customContentType: Predicate({
    type: 'type',
    rawInject: (value: InputValue) => `type=${value as string}\n`,
  }),
  targetType: Predicate({
    type: null,
    // TODO: this controls whether we are going for a ResourceType, a TemplateType , or FullText search
  }),
  targetResourceType: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      // TODO: This should inject the TargetResourceType into a property PredicateType with these properties being targeted
      const prefix = ['page', 'xf', 'cf'].includes(fields.type.value as string) ? 'jcr:content/' : '';
      if (fields.targetType.value === 'resource') {
        return prefix + 'sling:resourceType';
      } else if (fields.targetType.value === 'cfmodel') {
        return prefix + 'data/cq:model';
      } else {
        return prefix + 'cq:template';
      }
    },
    useConfig: true,
  }),
  fulltext: Predicate({
    type: 'fulltext',
    rawInject: (value: InputValue) => `fulltext=${value as string}\n`,
  }),
  createdBy: Predicate({
    type: 'property',
    property: 'jcr:createdBy',
  }),
  lastModifiedBy: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset'].includes(fields.type.value as string)) {
        return 'jcr:content/jcr:lastModifiedBy';
      } else if (['page', 'xf'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastModifiedBy';
      }
      return 'cq:lastModifiedBy';
    },
    useConfig: true,
  }),
  lastReplicatedBy: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastReplicatedBy';
      }
      return 'cq:lastReplicatedBy';
    },
    useConfig: true,
  }),
  lastRolledoutBy: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastRolledoutBy';
      }
      return 'cq:lastRolledoutBy';
    },
    useConfig: true,
  }),
  language: Predicate({
    type: 'property',
    rawInject: (value: InputValue) => `language=${value as string}\n`,
  }),
  created: Predicate({
    type: 'property',
    property: 'jcr:created',
  }),
  lastModified: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset'].includes(fields.type.value as string)) {
        return 'jcr:content/jcr:lastModified';
      } else if (['page', 'xf'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastModified';
      }
      return 'cq:lastModified';
    },
    useConfig: true,
  }),
  lastReplicated: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastReplicated';
      }
      return 'cq:lastReplicated';
    },
    useConfig: true,
  }),
  lastRolledout: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastRolledout';
      }
      return 'cq:lastRolledout';
    },
    useConfig: true,
  }),
  isPublished: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastReplicationAction';
      }
      return 'cq:lastReplicationAction';
    },
    useConfig: true,
  }),
  isUnpublished: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastReplicationAction';
      }
      return 'cq:lastReplicationAction';
    },
    useConfig: true,
    operation: 'not',
  }),
  isDeactivated: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:lastReplicationAction';
      }
      return 'cq:lastReplicationAction';
    },
    useConfig: true,
  }),
  isBlueprint: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/jcr:mixinTypes';
      }
      return 'jcr:mixinTypes';
    },
    useConfig: true,
    operation: 'unequals',
  }),
  isLiveCopy: Predicate({
    type: 'isLiveCopy',
    raw: 'isLiveCopy=true',
  }),
  isSuspended: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/jcr:mixinTypes';
      }
      return 'jcr:mixinTypes';
    },
    useConfig: true,
  }),
  hasCancelledPropertyInheritance: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/jcr:mixinTypes';
      }
      return 'jcr:mixinTypes';
    },
    useConfig: true,
  }),
  inheritanceCancelledProperty: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:propertyInheritanceCancelled';
      }
      return 'cq:propertyInheritanceCancelled';
    },
    useConfig: true,
  }),
  hasLocalContent: Predicate({
    // not in use
    type: 'property',
  }),
  hasMsmGhosts: Predicate({
    type: 'property',
    property: 'sling:resourceType',
  }),
  isLanguageCopy: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:translationSourcePath';
      }
      return 'cq:translationSourcePath';
    },
    useConfig: true,
    operation: 'exists',
  }),
  hasBeenTranslated: Predicate({
    type: 'property',
    configInject: (fields: FieldsConfig): string => {
      if (['cf', 'asset', 'xf', 'page'].includes(fields.type.value as string)) {
        return 'jcr:content/cq:translationStatus';
      }
      return 'cq:translationStatus';
    },
    useConfig: true,
  }),
  limit: Predicate({
    type: 'limit',
    rawInject: (value: InputValue) => {
      if (value) {
        return `p.limit=${value as string}\n${(value as number) < 0 ? 'p.guessTotal=1000' : ''}`;
      }
      return '';
    },
  }),
  customPredicates: Predicate({
    type: 'predicateList',
  }),
};

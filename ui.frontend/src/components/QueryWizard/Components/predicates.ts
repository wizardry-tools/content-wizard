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
      if (fields.targetType.value === 'resource') {
        return 'sling:resourceType';
      } else {
        return 'cq:template';
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
    property: 'jcr:content/cq:lastModifiedBy',
  }),
  lastReplicatedBy: Predicate({
    type: 'property',
    property: 'jcr:content/cq:lastReplicatedBy',
  }),
  lastRolledoutBy: Predicate({
    type: 'property',
    property: 'jcr:content/cq:lastReplicated',
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
    property: 'jcr:content/cq:lastModified',
  }),
  lastReplicated: Predicate({
    type: 'property',
    property: 'jcr:content/cq:lastReplicated',
  }),
  lastRolledout: Predicate({
    type: 'property',
    property: 'jcr:content/cq:lastRolledout',
  }),
  isPublished: Predicate({
    type: 'property',
    property: 'jcr:content/cq:lastReplicationAction',
  }),
  isUnpublished: Predicate({
    type: 'property',
    property: 'jcr:content/cq:lastReplicationAction',
    operation: 'not',
  }),
  isDeactivated: Predicate({
    type: 'property',
    property: 'jcr:content/cq:lastReplicationAction',
  }),
  isBlueprint: Predicate({
    type: 'property',
    property: 'jcr:content/jcr:mixinTypes',
    operation: 'unequals',
  }),
  isLiveCopy: Predicate({
    type: 'isLiveCopy',
    raw: 'isLiveCopy=true',
  }),
  isSuspended: Predicate({
    type: 'property',
    property: 'jcr:content/jcr:mixinTypes',
  }),
  hasCancelledPropertyInheritance: Predicate({
    type: 'property',
    property: 'jcr:content/jcr:mixinTypes',
  }),
  inheritanceCancelledProperty: Predicate({
    type: 'property',
    property: 'jcr:content/cq:propertyInheritanceCancelled',
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
    property: 'jcr:content/cq:translationSourcePath',
    operation: 'exists',
  }),
  hasBeenTranslated: Predicate({
    type: 'property',
    property: 'jcr:content/cq:translationStatus',
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
};

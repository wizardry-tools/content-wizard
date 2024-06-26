import {ContentType, ContentTypeMap} from "../types/ContentTypes";
import {TargetType, TargetTypeLookup, TargetTypes} from "../types/TargetTypes";
import {DateRange, FieldConfigNameKey, FieldsConfig, InputValue} from "./fields";

export const predicateTypes = {
  fulltext: "fulltext",
  path: "path",
  type: "type",
  nodename: "nodename",
  property: "property",
  limit: "limit",
  isLiveCopy: 'isLiveCopy',
  null: null
} as const;

export type PredicateKey = keyof typeof predicateTypes;
export type PredicateType = typeof predicateTypes[PredicateKey];

export type RawInjectCallback = (value: InputValue, prefix?: string)=>string;
export type PredicateValidityCallback = (value: InputValue)=>boolean;
export type ConfigInjectCallback = (fields: FieldsConfig)=>string;

export interface PredicateConfig {
  readonly type: PredicateType;
  readonly raw?: string; // static predicate value
  readonly rawInject?: RawInjectCallback // simple predicate based on string injection
  readonly valueRequired?: boolean;
  readonly operation?: string;
  readonly property?: string;
  readonly configInject?: ConfigInjectCallback; // relative property path for the query, uses a callback since some fields need dynamic definitions.
  readonly useConfig?: boolean;
  readonly isValid?: PredicateValidityCallback;
}

export const Predicate = (
  {
    rawInject = ()=>'', 
    configInject = ()=>'', 
    useConfig = false,
    ...other
  }: PredicateConfig) => {
  
  const isValid = (value: InputValue):boolean => {
    const dateRange = value as DateRange;
    const {raw, operation, valueRequired = true} = {...other};
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
    return !!(value || operation || (dateRange && (dateRange.upperBound || dateRange.lowerBound)));
  }
  return { ...other, isValid, rawInject, configInject, useConfig};
}

export type PredicatesConfig = Record<FieldConfigNameKey, PredicateConfig>;
export const predicates: PredicatesConfig = {
  path: Predicate({
    type: predicateTypes.path,
    rawInject: (value: InputValue) => `path=${value}\n`
  }),
  type: Predicate({
    type: predicateTypes.type,
    rawInject: (value: InputValue) => {
      let contentType = ContentTypeMap[value as ContentType];
      return `type=${contentType}\n`;
    }
  }),
  targetType: Predicate({
    type: predicateTypes.null
    // TODO: this controls whether we are going for a ResourceType, a TemplateType , or FullText search
  }),
  targetResourceType: Predicate({
    type: predicateTypes.property,
    configInject: (fields: FieldsConfig): string =>{
      // TODO: This should inject the TargetResourceType into a property PredicateType with these properties being targeted
      if (fields.targetType.value === TargetTypeLookup[TargetTypes.resource] as TargetType) {
        return 'sling:resourceType';
      } else {
        return 'cq:template';
      }
    },
    useConfig: true
  }),
  fulltext: Predicate({
    type: predicateTypes.fulltext,
    rawInject: (value: InputValue) => `fulltext=${value}\n`
  }),
  createdBy: Predicate({
    type: predicateTypes.property,
    property: 'jcr:createdBy'
  }),
  lastModifiedBy: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastModifiedBy'
  }),
  lastReplicatedBy: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastReplicatedBy'
  }),
  lastRolledoutBy: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastReplicated'
  }),
  language: Predicate({
    type: predicateTypes.property,
    rawInject: (value: InputValue) => `language=${value}\n`
  }),
  created: Predicate({
    type: predicateTypes.property,
    property: 'jcr:created'
  }),
  lastModified: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastModified'
  }),
  lastReplicated: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastReplicated'
  }),
  lastRolledout: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastRolledout'
  }),
  isPublished: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastReplicationAction'
  }),
  isUnpublished: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastReplicationAction',
    operation: 'not'
  }),
  isDeactivated: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:lastReplicationAction'
  }),
  isBlueprint: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/jcr:mixinTypes',
    operation: 'unequals'
  }),
  isLiveCopy: Predicate({
    type: predicateTypes.isLiveCopy,
    raw: 'isLiveCopy=true'
  }),
  isSuspended: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/jcr:mixinTypes'
  }),
  hasCancelledPropertyInheritance: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/jcr:mixinTypes'
  }),
  inheritanceCancelledProperty: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:propertyInheritanceCancelled'
  }),
  hasLocalContent: Predicate({ // not in use
    type: predicateTypes.property,
  }),
  hasMsmGhosts: Predicate({
    type: predicateTypes.property,
    property: 'sling:resourceType'
  }),
  isLanguageCopy: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:translationSourcePath',
    operation: 'exists'
  }),
  hasBeenTranslated: Predicate({
    type: predicateTypes.property,
    property: 'jcr:content/cq:translationStatus',
  }),
  limit: Predicate({
    type: predicateTypes.limit,
    rawInject: (value: InputValue) => {
      if (value) {
        return `p.limit=${value}\n` +
          (value < 0 ? 'p.guessTotal=1000':'');
      }
      return '';
    }
  }),
}
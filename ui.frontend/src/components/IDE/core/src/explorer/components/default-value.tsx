import { astFromValue, print } from 'graphql';
import type { ValueNode } from 'graphql';
import type { DefaultValueProps } from '@/types';
import './default-value.scss';

const printDefault = (ast?: ValueNode | null): string => {
  if (!ast) {
    return '';
  }
  return print(ast);
};

export function DefaultValue({ field }: DefaultValueProps) {
  if (!('defaultValue' in field) || field.defaultValue === undefined) {
    return null;
  }
  const ast = astFromValue(field.defaultValue, field.type);
  if (!ast) {
    return null;
  }
  return (
    <>
      {' = '}
      <span className="wizard-doc-explorer-default-value">{printDefault(ast)}</span>
    </>
  );
}

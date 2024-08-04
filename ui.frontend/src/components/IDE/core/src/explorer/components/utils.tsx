import type { JSX } from 'react';
import { isListType, isNonNullType } from 'graphql';
import type { GraphQLNamedType, GraphQLType } from 'graphql';

export const renderType = (
  type: GraphQLType,
  renderNamedType: (namedType: GraphQLNamedType) => JSX.Element,
): JSX.Element => {
  if (isNonNullType(type)) {
    return <>{renderType(type.ofType, renderNamedType)}!</>;
  }
  if (isListType(type)) {
    return <>[{renderType(type.ofType, renderNamedType)}]</>;
  }
  return renderNamedType(type);
};

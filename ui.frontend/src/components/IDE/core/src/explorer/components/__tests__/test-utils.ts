import type { GraphQLNamedType, GraphQLType } from 'graphql';
import type { ExplorerContextType, ExplorerNavStackItem } from '@/types';

export function mockExplorerContextValue(navStackItem: ExplorerNavStackItem): ExplorerContextType {
  return {
    explorerNavStack: [navStackItem],
    pop: () => ({}),
    push: () => ({}),
    reset: () => ({}),
  };
}

export function unwrapType(type: GraphQLType): GraphQLNamedType {
  return 'ofType' in type ? unwrapType(type.ofType) : type;
}

describe('Empty test file', () => {
  it("Shouldn't do anything", () => ({}));
});

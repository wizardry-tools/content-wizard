import type { GraphQLNamedType, GraphQLType } from 'graphql';
import type { ExplorerContextType, ExplorerNavStackItem } from '@/types';

export const mockExplorerContextValue = (navStackItem: ExplorerNavStackItem): ExplorerContextType => {
  return {
    explorerNavStack: [navStackItem],
    pop: () => ({}),
    push: () => ({}),
    reset: () => ({}),
  };
};

export const unwrapType = (type: GraphQLType): GraphQLNamedType => {
  return 'ofType' in type ? unwrapType(type.ofType) : type;
};

describe('Empty test file', () => {
  it("Shouldn't do anything", () => ({}));
});

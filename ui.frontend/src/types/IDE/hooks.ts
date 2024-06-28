import type { GetDefaultFieldNamesFn } from '@graphiql/toolkit';
import type { Caller } from '@/types';

export type UseCopyQueryArgs = {
  /**
   * This is how context is tracked when there are multiple instance of context existing at the same time.
   * It ensures the correct context is being applied based on the caller's own context.
   * If one is not supplied, a new Context will be created and used, assigning it to the function being called.
   */
  caller?: Caller;
  /**
   * Invoked when the current contents of the query editor are copied to the
   * clipboard.
   * @param query The content that has been copied.
   */
  onCopyQuery?: (query: string) => void;
};

export type UseMergeQueryArgs = {
  /**
   * This is only meant to be used internally in `@graphiql/react`.
   */
  caller?: Caller;
};

export type UsePrettifyEditorsArgs = {
  /**
   * This is only meant to be used internally in `@graphiql/react`.
   */
  caller?: Caller;
};

export type UseCopyResultArgs = Omit<UseCopyQueryArgs, 'onCopyQuery'>;

export type UseAutoCompleteLeafsArgs = {
  /**
   * A function to determine which field leafs are automatically added when
   * trying to execute a query with missing selection sets. It will be called
   * with the `GraphQLType` for which fields need to be added.
   */
  getDefaultFieldNames?: GetDefaultFieldNamesFn;
  /**
   * This is only meant to be used internally in `@graphiql/react`.
   */
  caller?: Caller;
};

export type InitialState = string | (() => string);

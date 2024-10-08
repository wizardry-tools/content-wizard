import { createContext, useContext } from 'react';
import type { Context } from 'react';
import type { Caller } from '@/types';

export const createNullableContext = <T>(name: string): Context<T | null> => {
  const context = createContext<T | null>(null);
  context.displayName = name;
  return context;
};

export const createNonNullableContext = <T>(name: string): Context<T> => {
  const context = createContext<T>(null!);
  context.displayName = name;
  return context;
};

export const createContextHook = <T>(context: Context<T | null>) => {
  function useGivenContext(options: { nonNull: true; caller?: Caller }): T;
  function useGivenContext(options: { nonNull?: boolean; caller?: Caller }): T | null;
  function useGivenContext(): T | null;
  function useGivenContext(options?: { nonNull?: boolean; caller?: Caller }): T | null {
    const value = useContext(context);
    if (value === null && options?.nonNull) {
      throw new Error(
        `Tried to use \`${
          options.caller?.name ?? useGivenContext.caller.name
        }\` without the necessary context. Make sure to render the \`${
          context.displayName
        }Provider\` component higher up the tree.`,
      );
    }
    return value;
  }
  Object.defineProperty(useGivenContext, 'name', {
    value: `use${context.displayName}`,
  });
  return useGivenContext;
};

export const createNonNullableContextHook = <T>(context: Context<T>) => {
  function useGivenContext(options: { nonNull: true; caller?: Caller }): T;
  function useGivenContext(options: { nonNull?: boolean; caller?: Caller }): T;
  function useGivenContext(): T;
  function useGivenContext(options?: { nonNull?: boolean; caller?: Caller }): T {
    const value = useContext(context);
    if (value === null && options?.nonNull) {
      throw new Error(
        `Tried to use \`${
          options.caller?.name ?? useGivenContext.caller.name
        }\` without the necessary context. Make sure to render the \`${
          context.displayName
        }Provider\` component higher up the tree.`,
      );
    }
    return value;
  }
  Object.defineProperty(useGivenContext, 'name', {
    value: `use${context.displayName}`,
  });
  return useGivenContext;
};

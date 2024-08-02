import { isInputObjectType, isInterfaceType, isObjectType } from 'graphql';
import type { GraphQLArgument } from 'graphql';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FocusEventHandler } from 'react';
import { Combobox } from '@headlessui/react';
import type { Caller, FieldMatch, FieldProps, SearchMatch, SearchMatchCallback, TypeMatch, TypeProps } from '@/types';
import { MagnifyingGlassIcon } from '@/icons';
import { useSchemaContext } from '../../schema';
import debounce from '../../utility/debounce';
import { useExplorerContext } from '../context';
import { renderType } from './utils';
import './search.scss';

export function Search() {
  const { explorerNavStack, push } = useExplorerContext({
    nonNull: true,
    caller: Search,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const getSearchResults = useSearchResults();
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState(getSearchResults(searchValue));
  const debouncedGetSearchResults = useMemo(
    () =>
      debounce(200, (search: string) => {
        setResults(getSearchResults(search));
      }),
    [getSearchResults],
  );
  useEffect(() => {
    debouncedGetSearchResults(searchValue);
  }, [debouncedGetSearchResults, searchValue]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey && event.key === 'k') {
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navItem = explorerNavStack.at(-1)!;

  const onSelect = useCallback(
    (def: TypeMatch | FieldMatch) => {
      push('field' in def ? { name: def.field.name, def: def.field } : { name: def.type.name, def: def.type });
    },
    [push],
  );
  const isFocused = useRef(false);
  const handleFocus: FocusEventHandler = useCallback((e) => {
    isFocused.current = e.type === 'focus';
  }, []);

  const shouldSearchBoxAppear =
    explorerNavStack.length === 1 ||
    isObjectType(navItem.def) ||
    isInterfaceType(navItem.def) ||
    isInputObjectType(navItem.def);
  if (!shouldSearchBoxAppear) {
    return null;
  }

  return (
    <Combobox
      as="div"
      className="wizard-doc-explorer-search"
      onChange={onSelect}
      data-state={isFocused ? undefined : 'idle'}
      aria-label={`Search ${navItem.name}...`}
    >
      <div
        className="wizard-doc-explorer-search-input"
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        <MagnifyingGlassIcon />
        <Combobox.Input
          autoComplete="off"
          onFocus={handleFocus}
          onBlur={handleFocus}
          onChange={(event) => {
            setSearchValue(event.target.value);
          }}
          placeholder="&#x2318; K"
          ref={inputRef}
          value={searchValue}
          data-cy="doc-explorer-input"
        />
      </div>

      {/* display on focus */}
      {isFocused.current && (
        <Combobox.Options data-cy="doc-explorer-list">
          {results.within.length + results.types.length + results.fields.length === 0 ? (
            <li className="wizard-doc-explorer-search-empty">No results found</li>
          ) : (
            results.within.map((result, i) => (
              <Combobox.Option key={`within-${i}`} value={result} data-cy="doc-explorer-option">
                <Field field={result.field} argument={result.argument} />
              </Combobox.Option>
            ))
          )}
          {results.within.length > 0 && results.types.length + results.fields.length > 0 ? (
            <div className="wizard-doc-explorer-search-divider">Other results</div>
          ) : null}
          {results.types.map((result, i) => (
            <Combobox.Option key={`type-${i}`} value={result} data-cy="doc-explorer-option">
              <Type type={result.type} />
            </Combobox.Option>
          ))}
          {results.fields.map((result, i) => (
            <Combobox.Option key={`field-${i}`} value={result} data-cy="doc-explorer-option">
              <Type type={result.type} />.
              <Field field={result.field} argument={result.argument} />
            </Combobox.Option>
          ))}
        </Combobox.Options>
      )}
    </Combobox>
  );
}

export function useSearchResults(caller?: Caller): SearchMatchCallback {
  const { explorerNavStack } = useExplorerContext({
    nonNull: true,
    caller: caller ?? useSearchResults,
  });
  const { schema } = useSchemaContext({
    nonNull: true,
    caller: caller ?? useSearchResults,
  });

  const navItem = explorerNavStack.at(-1)!;

  return useCallback(
    (searchValue: string) => {
      const matches: SearchMatch = {
        within: [],
        types: [],
        fields: [],
      };

      if (!schema) {
        return matches;
      }

      const withinType = navItem.def;

      const typeMap = schema.getTypeMap();
      let typeNames = Object.keys(typeMap);

      // Move the within type name to be the first searched.
      if (withinType) {
        typeNames = typeNames.filter((n) => n !== withinType.name);
        typeNames.unshift(withinType.name);
      }
      for (const typeName of typeNames) {
        if (matches.within.length + matches.types.length + matches.fields.length >= 100) {
          break;
        }

        const type = typeMap[typeName];
        if (withinType !== type && isMatch(typeName, searchValue)) {
          matches.types.push({ type });
        }

        if (!isObjectType(type) && !isInterfaceType(type) && !isInputObjectType(type)) {
          continue;
        }

        const fields = type.getFields();
        for (const fieldName in fields) {
          const field = fields[fieldName];
          let matchingArgs: GraphQLArgument[] | undefined;

          if (!isMatch(fieldName, searchValue)) {
            if ('args' in field) {
              matchingArgs = field.args.filter((arg) => isMatch(arg.name, searchValue));
              if (matchingArgs.length === 0) {
                continue;
              }
            } else {
              continue;
            }
          }

          matches[withinType === type ? 'within' : 'fields'].push(
            ...(matchingArgs ? matchingArgs.map((argument) => ({ type, field, argument })) : [{ type, field }]),
          );
        }
      }

      return matches;
    },
    [navItem.def, schema],
  );
}

function isMatch(sourceText: string, searchValue: string): boolean {
  try {
    const escaped = searchValue.replaceAll(/[^_0-9A-Za-z]/g, (ch: string) => '\\' + ch);
    return sourceText.search(new RegExp(escaped, 'i')) !== -1;
  } catch {
    return sourceText.toLowerCase().includes(searchValue.toLowerCase());
  }
}

function Type(props: TypeProps) {
  return <span className="wizard-doc-explorer-search-type">{props.type.name}</span>;
}

function Field({ field, argument }: FieldProps) {
  return (
    <>
      <span className="wizard-doc-explorer-search-field">{field.name}</span>
      {argument ? (
        <>
          (<span className="wizard-doc-explorer-search-argument">{argument.name}</span>:{' '}
          {renderType(argument.type, (namedType) => (
            <Type type={namedType} />
          ))}
          )
        </>
      ) : null}
    </>
  );
}

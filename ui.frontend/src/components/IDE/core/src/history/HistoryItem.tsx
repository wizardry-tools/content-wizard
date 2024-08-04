import { clsx } from 'clsx';
import { type MouseEventHandler, useCallback, useEffect, useRef, useState } from 'react';
import type { QueryHistoryItemProps } from '@/types';
import { defaultAdvancedQueries, QUERY_LANGUAGES } from '@/constants';
import { CloseIcon, PenIcon, StarFilledIcon, StarIcon, TrashIcon } from '@/icons';
import { useQueryDispatcher } from '@/providers';
import { Tooltip, UnStyledButton } from '../ui';
import { useEditorContext } from '../editor';
import { formatQuery, useHistoryContext } from './HistoryContext';

export function HistoryItem(props: QueryHistoryItemProps) {
  const queryDispatcher = useQueryDispatcher();
  const { editLabel, toggleFavorite, deleteFromHistory, setActive } = useHistoryContext({
    nonNull: true,
    caller: HistoryItem,
  });
  const { headerEditor, variableEditor } = useEditorContext({
    nonNull: true,
    caller: HistoryItem,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    if (isEditable) {
      inputRef.current?.focus();
    }
  }, [isEditable]);

  const displayName =
    props.item.label ??
    props.item.operationName ??
    `${QUERY_LANGUAGES[props.item.language!]} ${formatQuery(props.item.query! ?? '')}`;

  const handleSave = useCallback(() => {
    setIsEditable(false);
    const { index, ...item } = props.item;
    editLabel({ ...item, label: inputRef.current?.value }, index);
  }, [editLabel, props.item]);

  const handleClose = useCallback(() => {
    setIsEditable(false);
  }, []);

  const handleEditLabel: MouseEventHandler<HTMLButtonElement> = useCallback((e) => {
    e.stopPropagation();
    setIsEditable(true);
  }, []);

  const handleHistoryItemClick: MouseEventHandler<HTMLButtonElement> = useCallback(() => {
    const { query, language, variables, headers, label } = props.item;
    // dispatch the query object instead setting value directly to the editor
    // TODO: Make sure that Query.API isn't needed as well...
    queryDispatcher({
      ...defaultAdvancedQueries[language!],
      statement: query,
      label,
      type: 'replaceQuery',
    });
    // queryEditor?.setValue(query?.statement ?? '');
    variableEditor?.setValue(variables ?? '');
    headerEditor?.setValue(headers ?? '');
    setActive(props.item);
  }, [headerEditor, props.item, queryDispatcher, setActive, variableEditor]);

  const handleDeleteItemFromHistory: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation();
      deleteFromHistory(props.item);
    },
    [props.item, deleteFromHistory],
  );

  const handleToggleFavorite: MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e.stopPropagation();
      toggleFavorite(props.item);
    },
    [props.item, toggleFavorite],
  );

  return (
    <li className={clsx('wizard-history-item', isEditable && 'editable')}>
      {isEditable ? (
        <>
          <input
            type="text"
            defaultValue={props.item.label}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === 'Esc') {
                setIsEditable(false);
              } else if (e.key === 'Enter') {
                setIsEditable(false);
                editLabel({ ...props.item, label: e.currentTarget.value });
              }
            }}
            placeholder="Type a label"
          />
          <UnStyledButton type="button" ref={buttonRef} onClick={handleSave}>
            Save
          </UnStyledButton>
          <UnStyledButton type="button" ref={buttonRef} onClick={handleClose}>
            <CloseIcon />
          </UnStyledButton>
        </>
      ) : (
        <>
          <Tooltip label="Set active">
            <UnStyledButton
              type="button"
              className="wizard-history-item-label"
              onClick={handleHistoryItemClick}
              aria-label="Set active"
            >
              {displayName}
            </UnStyledButton>
          </Tooltip>
          <Tooltip label="Edit label">
            <UnStyledButton
              type="button"
              className="wizard-history-item-action"
              onClick={handleEditLabel}
              aria-label="Edit label"
            >
              <PenIcon aria-hidden="true" />
            </UnStyledButton>
          </Tooltip>
          <Tooltip label={props.item.favorite ? 'Remove favorite' : 'Add favorite'}>
            <UnStyledButton
              type="button"
              className="wizard-history-item-action"
              onClick={handleToggleFavorite}
              aria-label={props.item.favorite ? 'Remove favorite' : 'Add favorite'}
            >
              {props.item.favorite ? <StarFilledIcon aria-hidden="true" /> : <StarIcon aria-hidden="true" />}
            </UnStyledButton>
          </Tooltip>
          <Tooltip label="Delete from history">
            <UnStyledButton
              type="button"
              className="wizard-history-item-action"
              onClick={handleDeleteItemFromHistory}
              aria-label="Delete from history"
            >
              <TrashIcon aria-hidden="true" />
            </UnStyledButton>
          </Tooltip>
        </>
      )}
    </li>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useRenderCount } from '@/utility';
import { useLogger } from '@/providers';
import { Button } from '../ui';
import { useHistoryContext } from './HistoryContext';
import { HistoryItem } from './HistoryItem';
import './style.scss';

export const History = () => {
  const logger = useLogger();
  const renderCount = useRenderCount();
  logger.debug({ message: `History[${renderCount}] render()` });

  const { items: all, deleteFromHistory } = useHistoryContext({
    nonNull: true,
  });

  // Reverse items since we push them in so want the latest one at the top, and pass the
  // original index in case multiple items share the same label so we can edit correct item
  let items = all
    .slice()
    .map((item, i) => ({ ...item, index: i }))
    .reverse();
  const favorites = items.filter((item) => item.favorite);
  if (favorites.length) {
    items = items.filter((item) => !item.favorite);
  }

  const [clearStatus, setClearStatus] = useState<'success' | 'error' | null>(null);
  useEffect(() => {
    if (clearStatus) {
      // reset button after a couple seconds
      setTimeout(() => {
        setClearStatus(null);
      }, 2000);
    }
  }, [clearStatus]);

  const handleClearStatus = useCallback(() => {
    try {
      for (const item of items) {
        deleteFromHistory(item, true);
      }
      setClearStatus('success');
    } catch {
      setClearStatus('error');
    }
  }, [deleteFromHistory, items]);

  return (
    <section aria-label="History" className="wizard-history">
      <div className="wizard-history-header">
        History
        {(clearStatus ?? items.length > 0) && (
          <Button type="button" state={clearStatus ?? undefined} disabled={!items.length} onClick={handleClearStatus}>
            {{
              success: 'Cleared',
              error: 'Failed to Clear',
            }[clearStatus!] ?? 'Clear'}
          </Button>
        )}
      </div>

      {Boolean(favorites.length) && (
        <ul className="wizard-history-items">
          {favorites.map((item) => (
            <HistoryItem item={item} key={item.index} />
          ))}
        </ul>
      )}

      {Boolean(favorites.length) && Boolean(items.length) && <div className="wizard-history-item-spacer" />}

      {Boolean(items.length) && (
        <ul className="wizard-history-items">
          {items.map((item) => (
            <HistoryItem item={item} key={item.index} />
          ))}
        </ul>
      )}
    </section>
  );
};

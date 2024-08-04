import { Link } from '@mui/material';
import type { FieldLinkProps } from '@/types';
import { useExplorerContext } from '../ExplorerContext';
import './field-link.scss';

export function FieldLink(props: FieldLinkProps) {
  const { push } = useExplorerContext({ nonNull: true });

  return (
    <Link
      className="wizard-doc-explorer-field-name"
      onClick={(event) => {
        event.preventDefault();
        push({ name: props.field.name, def: props.field });
      }}
    >
      {props.field.name}
    </Link>
  );
}

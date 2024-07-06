import { ExplorerFieldDef, useExplorerContext } from '../context';
import { Link } from '@mui/material';

import './field-link.scss';

type FieldLinkProps = {
  /**
   * The field or argument that should be linked to.
   */
  field: ExplorerFieldDef;
};

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

import { ExplorerFieldDef, useExplorerContext } from '../context';

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
    <a
      className="wizard-doc-explorer-field-name"
      onClick={event => {
        event.preventDefault();
        push({ name: props.field.name, def: props.field });
      }}
      href="#"
    >
      {props.field.name}
    </a>
  );
}

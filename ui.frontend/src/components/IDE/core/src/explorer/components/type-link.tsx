import { GraphQLType } from 'graphql';

import { useExplorerContext } from '../context';
import { renderType } from './utils';

import './type-link.scss';
import { Link } from '@mui/material';

type TypeLinkProps = {
  /**
   * The type that should be linked to.
   */
  type: GraphQLType;
};

export function TypeLink(props: TypeLinkProps) {
  const { push } = useExplorerContext({ nonNull: true, caller: TypeLink });

  if (!props.type) {
    return null;
  }

  return renderType(props.type, (namedType) => (
    <Link
      className="wizard-doc-explorer-type-name"
      onClick={(event) => {
        event.preventDefault();
        push({ name: namedType.name, def: namedType });
      }}
    >
      {namedType.name}
    </Link>
  ));
}

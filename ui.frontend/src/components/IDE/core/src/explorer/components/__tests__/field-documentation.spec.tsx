import { fireEvent, render } from '@testing-library/react';
import { GraphQLString, GraphQLObjectType, Kind } from 'graphql';

import type { ExplorerFieldDef } from '@/types';
import { ExplorerContext } from '../../ExplorerContext';
import { FieldDocumentation } from '../field-documentation';
import { mockExplorerContextValue } from './test-utils';

const exampleObject = new GraphQLObjectType({
  name: 'Query',
  fields: {
    string: {
      type: GraphQLString,
    },
    stringWithArgs: {
      type: GraphQLString,
      description: 'Example String field with arguments',
      args: {
        stringArg: {
          type: GraphQLString,
        },
        deprecatedStringArg: {
          type: GraphQLString,
          deprecationReason: 'no longer used',
        },
      },
    },
    stringWithDirective: {
      type: GraphQLString,
      astNode: {
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: 'stringWithDirective',
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: 'GraphQLString',
          },
        },
        directives: [
          {
            kind: Kind.DIRECTIVE,
            name: {
              kind: Kind.NAME,
              value: 'development',
            },
          },
        ],
      },
    },
  },
});

const FieldDocumentationWithContext = (props: { field: ExplorerFieldDef }) => {
  return (
    <ExplorerContext.Provider
      value={mockExplorerContextValue({
        name: props.field.name,
        def: props.field,
      })}
    >
      <FieldDocumentation field={props.field} />
    </ExplorerContext.Provider>
  );
};

describe('FieldDocumentation', () => {
  it('should render a simple string field', () => {
    const { container } = render(<FieldDocumentationWithContext field={exampleObject.getFields().string} />);
    expect(container.querySelector('.wizard-markdown-description')).not.toBeInTheDocument();
    expect(container.querySelector('.wizard-doc-explorer-type-name')).toHaveTextContent('String');
    expect(container.querySelector('.wizard-doc-explorer-argument')).not.toBeInTheDocument();
  });

  it('should re-render on field change', () => {
    const { container, rerender } = render(<FieldDocumentationWithContext field={exampleObject.getFields().string} />);
    expect(container.querySelector('.wizard-markdown-description')).not.toBeInTheDocument();
    expect(container.querySelector('.wizard-doc-explorer-type-name')).toHaveTextContent('String');
    expect(container.querySelector('.wizard-doc-explorer-argument')).not.toBeInTheDocument();

    rerender(<FieldDocumentationWithContext field={exampleObject.getFields().stringWithArgs} />);
    expect(container.querySelector('.wizard-doc-explorer-type-name')).toHaveTextContent('String');
    expect(container.querySelector('.wizard-markdown-description')).toHaveTextContent(
      'Example String field with arguments',
    );
  });

  it('should render a string field with arguments', () => {
    const { container, getByText } = render(
      <FieldDocumentationWithContext field={exampleObject.getFields().stringWithArgs} />,
    );
    expect(container.querySelector('.wizard-doc-explorer-type-name')).toHaveTextContent('String');
    expect(container.querySelector('.wizard-markdown-description')).toHaveTextContent(
      'Example String field with arguments',
    );
    expect(container.querySelectorAll('.wizard-doc-explorer-argument')).toHaveLength(1);
    expect(container.querySelector('.wizard-doc-explorer-argument')).toHaveTextContent('stringArg: String');
    // by default, the deprecation docs should be hidden
    expect(container.querySelectorAll('.wizard-markdown-deprecation')).toHaveLength(0);
    // make sure deprecation is present
    fireEvent.click(getByText('Show Deprecated Arguments'));
    const deprecationDocs = container.querySelectorAll('.wizard-markdown-deprecation');
    expect(deprecationDocs).toHaveLength(1);
    expect(deprecationDocs[0]).toHaveTextContent('no longer used');
  });

  it('should render a string field with directives', () => {
    const { container } = render(
      <FieldDocumentationWithContext field={exampleObject.getFields().stringWithDirective} />,
    );
    expect(container.querySelector('.wizard-doc-explorer-type-name')).toHaveTextContent('String');
    expect(container.querySelector('.wizard-doc-explorer-directive')).toHaveTextContent('@development');
  });
});

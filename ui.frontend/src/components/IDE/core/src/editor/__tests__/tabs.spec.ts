import { WizardStorageAPI } from '../../storage-api';
import {
  createTab,
  fuzzyExtractOperationName,
  getDefaultTabState,
  clearHeadersFromTabs,
  STORAGE_KEY,
} from '../tabs';
import {defaultAdvancedQueries, QueryLanguage} from "src/components/Query";

describe('createTab', () => {
  it('creates with language title', () => {
    expect(createTab({ query: {...defaultAdvancedQueries.JCR_SQL2, statement: 'select * from nt:unstructured'}})).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        hash: expect.any(String),
        title: QueryLanguage.JCR_SQL2,
      }),
    );
  });


  it('creates with title from query', () => {
    expect(createTab({ query: {...defaultAdvancedQueries.GraphQL, statement: 'query Foo {}'} })).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        hash: expect.any(String),
        title: 'Foo',
      }),
    );
  });
});

describe('fuzzyExtractionOperationTitle', () => {
  describe('without prefix', () => {
    it('should extract query names', () => {
      expect(fuzzyExtractOperationName('query MyExampleQuery() {}')).toEqual(
        'MyExampleQuery',
      );
    });
    it('should extract query names with special characters', () => {
      expect(fuzzyExtractOperationName('query My_ExampleQuery() {}')).toEqual(
        'My_ExampleQuery',
      );
    });
    it('should extract query names with numbers', () => {
      expect(fuzzyExtractOperationName('query My_3ExampleQuery() {}')).toEqual(
        'My_3ExampleQuery',
      );
    });
    it('should extract mutation names with numbers', () => {
      expect(
        fuzzyExtractOperationName('mutation My_3ExampleQuery() {}'),
      ).toEqual('My_3ExampleQuery');
    });
  });
  describe('with space prefix', () => {
    it('should extract query names', () => {
      expect(fuzzyExtractOperationName(' query MyExampleQuery() {}')).toEqual(
        'MyExampleQuery',
      );
    });
    it('should extract query names with special characters', () => {
      expect(fuzzyExtractOperationName(' query My_ExampleQuery() {}')).toEqual(
        'My_ExampleQuery',
      );
    });
    it('should extract query names with numbers', () => {
      expect(fuzzyExtractOperationName(' query My_3ExampleQuery() {}')).toEqual(
        'My_3ExampleQuery',
      );
    });
    it('should extract mutation names with numbers', () => {
      expect(
        fuzzyExtractOperationName(' mutation My_3ExampleQuery() {}'),
      ).toEqual('My_3ExampleQuery');
    });
  });

  it('should return null for anonymous queries', () => {
    expect(fuzzyExtractOperationName('{}')).toBeNull();
  });

  describe('comment line handling', () => {
    it('should not extract query names within commented out lines', () => {
      expect(
        fuzzyExtractOperationName('# query My_3ExampleQuery() {}'),
      ).toBeNull();
    });
    it('should extract query names when there is a single leading comment line', () => {
      expect(
        fuzzyExtractOperationName(
          '# comment line 1 \n query MyExampleQueryWithSingleCommentLine() {}',
        ),
      ).toEqual('MyExampleQueryWithSingleCommentLine');
    });
    it('should extract query names when there are more than one leading comment lines', () => {
      expect(
        fuzzyExtractOperationName(
          '# comment line 1 \n # comment line 2 \n query MyExampleQueryWithMultipleCommentLines() {}',
        ),
      ).toEqual('MyExampleQueryWithMultipleCommentLines');
    });
  });
});

describe('getDefaultTabState', () => {
  it('returns default tab', () => {
    expect(
      getDefaultTabState({
        headers: null,
        query: defaultAdvancedQueries.GraphQL,
        variables: null,
        storage: null,
      }),
    ).toEqual({
      activeTabIndex: 0,
      tabs: [
        expect.objectContaining({
          query: defaultAdvancedQueries.GraphQL,
          title: 'GraphQL',
        }),
      ],
    });
  });

  it('returns initial tabs', () => {
    expect(
      getDefaultTabState({
        headers: null,
        defaultTabs: [
          {
            headers: null,
            query: {...defaultAdvancedQueries.GraphQL, statement: 'query Person { person { name } }'},
            variables: '{"id":"foo"}',
          },
          {
            headers: '{"x-header":"foo"}',
            query: {...defaultAdvancedQueries.GraphQL, statement: 'query Image { image }'},
            variables: null,
          },
        ],
        query: defaultAdvancedQueries.GraphQL,
        variables: null,
        storage: null,
      }),
    ).toEqual({
      activeTabIndex: 0,
      tabs: [
        expect.objectContaining({
          query: {...defaultAdvancedQueries.GraphQL, statement: 'query Person { person { name } }'},
          title: 'Person',
          variables: '{"id":"foo"}',
        }),
        expect.objectContaining({
          headers: '{"x-header":"foo"}',
          query: {...defaultAdvancedQueries.GraphQL, statement: 'query Image { image }'},
          title: 'Image',
        }),
      ],
    });
  });
});

describe('clearHeadersFromTabs', () => {
  const createMockStorage = () => {
    const mockStorage = new Map();
    return mockStorage as unknown as WizardStorageAPI;
  };

  it('preserves tab state except for headers', () => {
    const storage = createMockStorage();
    const stateWithoutHeaders = {
      operationName: 'test',
      query: {...defaultAdvancedQueries.GraphQL, statement: 'query test {\n  test {\n    id\n  }\n}'},
      test: {
        a: 'test',
      },
    };
    const stateWithHeaders = {
      ...stateWithoutHeaders,
      headers: '{ "authorization": "secret" }',
    };
    storage.set(STORAGE_KEY, JSON.stringify(stateWithHeaders));

    clearHeadersFromTabs(storage);

    expect(JSON.parse(storage.get(STORAGE_KEY)!)).toEqual({
      ...stateWithoutHeaders,
      headers: null,
    });
  });
});

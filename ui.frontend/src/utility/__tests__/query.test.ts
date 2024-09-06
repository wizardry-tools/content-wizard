import type { Query } from '@/types';
import { buildQueryString, isQueryValid } from '../query';

describe('isQueryValid', () => {
  test('should return true for valid Query', () => {
    const query = {
      language: 'GraphQL',
      statement: 'Some Statement',
      url: 'http://test.url',
      isAdvanced: true,
    };
    expect(isQueryValid(query)).toBe(true);
  });
  test('should return false for Query missing language', () => {
    const query = {
      statement: 'Some Statement',
      url: 'http://test.url',
      isAdvanced: true,
    };
    expect(isQueryValid(query)).toBe(false);
  });
  test('should return false for Query missing statement', () => {
    const query = {
      language: 'GraphQL',
      url: 'http://test.url',
      isAdvanced: true,
    };
    expect(isQueryValid(query)).toBe(false);
  });
  test('should return false for Query missing url', () => {
    const query = {
      language: 'GraphQL',
      statement: 'Some Statement',
      isAdvanced: true,
    };
    expect(isQueryValid(query)).toBe(false);
  });
});

describe('buildQueryString', () => {
  test('should return url for GraphQL language', () => {
    const query: Query = {
      language: 'GraphQL',
      statement: 'Your Statement',
      url: 'http://test.url',
      isAdvanced: true,
    };
    const actual = buildQueryString(query);
    expect(actual).toBe('http://test.url');
  });

  test('should return graphQLEndpoint for GraphQL language when url is not provided', () => {
    const query: Query = {
      language: 'GraphQL',
      statement: 'Your Statement',
      api: { endpoint: 'we-retail', persistedQueries: [] },
      isAdvanced: true,
    };
    const actual = buildQueryString(query);
    // You need to replace graphQLEndpoint with the actual value you expect to be returned
    expect(actual).toBe('/content/cq:graphql/we-retail/endpoint.json');
  });

  test('should return query parameter for non GraphQL languages', () => {
    const query: Query = {
      language: 'JCR_SQL2',
      statement: 'SELECT *',
      isAdvanced: true,
    };
    const actual = buildQueryString(query);
    // You need to replace 'yourExpectedQueryParams' with the actual value you expect to be returned
    expect(actual).toBe('?_charset_=utf-8&type=JCR-SQL2&showResults=true&stmt=SELECT+*');
  });
});

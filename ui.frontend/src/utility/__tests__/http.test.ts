import type { GetParamsProps } from '@/types';
import { escapeColon, escapeUrl, getParams, queryToParams } from '../http';

// existing tests for escapeUrl function
describe('escapeUrl function', () => {
  it('should replace special characters in a URL with their encoded versions', () => {
    expect(escapeUrl('http://example.com/foo bar')).toEqual('http%3A%2F%2Fexample.com%2Ffoo%20bar');
  });
});

// new tests for escapeColon function
describe('escapeColon function', () => {
  it('should replace colon character in a given string with their encoded version', () => {
    expect(escapeColon('http://')).toEqual('http%3A//');
  });

  it('should return the same string if no colon is present', () => {
    expect(escapeColon('http//')).toEqual('http//');
  });
});

// Tests for queryToParams function
describe('queryToParams function', () => {
  it('should convert a query string into a parameter object for HTTP fetch', () => {
    const input = 'param1=value1\nparam2=value2';
    const expectedOutput = { param1: 'value1', param2: 'value2' };
    expect(queryToParams(input)).toEqual(expectedOutput);
  });

  it('should handle an empty query string', () => {
    expect(queryToParams('')).toEqual({});
  });

  it('should handle query string with multiple lines', () => {
    const input = 'param1=value1\nparam2=value2\nparam3=value3';
    const expectedOutput = { param1: 'value1', param2: 'value2', param3: 'value3' };
    expect(queryToParams(input)).toEqual(expectedOutput);
  });
});

// Tests for getParams function
describe('getParams function', () => {
  it('should construct a parameter object for HTTP fetch when the language is SQL', () => {
    const input: GetParamsProps = { language: 'SQL', statement: 'SELECT * from TABLE' };
    const expectedOutput = {
      _charset_: 'utf-8',
      type: 'sql',
      showResults: 'true',
      stmt: 'SELECT * from TABLE',
    };
    expect(getParams(input)).toEqual(expectedOutput);
  });

  it('should construct a parameter object for HTTP fetch when the language is JCR_SQL2', () => {
    const input: GetParamsProps = { language: 'JCR_SQL2', statement: 'SELECT * from nodes' };
    const expectedOutput = {
      _charset_: 'utf-8',
      type: 'JCR-SQL2',
      showResults: 'true',
      stmt: 'SELECT * from nodes',
    };
    expect(getParams(input)).toEqual(expectedOutput);
  });

  it('should construct a parameter object for HTTP fetch when the language is XPATH', () => {
    const input: GetParamsProps = { language: 'XPATH', statement: '/jcr:root//*' };
    const expectedOutput = {
      _charset_: 'utf-8',
      type: 'xpath',
      showResults: 'true',
      stmt: '/jcr:root//*',
    };
    expect(getParams(input)).toEqual(expectedOutput);
  });

  it('should call queryToParams if language is QueryBuilder', () => {
    const input: GetParamsProps = { language: 'QueryBuilder', statement: 'param1=value1\nparam2=value2' };
    const expectedOutput = { param1: 'value1', param2: 'value2' };
    expect(getParams(input)).toEqual(expectedOutput);
  });

  it('should return an empty object when the language does not match the supported ones', () => {
    const input: GetParamsProps = { language: 'Unknown', statement: 'random statement' };
    expect(getParams(input)).toEqual({});
  });
});

import type { API, APIContextType, GraphQLEndpointConfig } from '@/types';
import { buildGraphQLURL } from '@/utility';
import { createContextHook, createNullableContext } from '../../utility/context';

export const mapAPIs = (response: GraphQLEndpointConfig[]): API[] => {
  return response.map((endpointConfig) => {
    return {
      endpoint: endpointConfig.configurationName,
      persistedQueries: endpointConfig.queries,
      url: buildGraphQLURL(endpointConfig.configurationName),
    };
  });
};

export const APIContext = createNullableContext<APIContextType>('APIContext');

export const useAPIContext = createContextHook(APIContext);

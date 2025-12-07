import { useMemo } from 'react';
import { getClient as getXcalidrawClient } from '@xcalidraw/client';
import * as config from './api-config';
import { configureClient } from './api-utils';

export const getClient = (token?: string) => {
  const client = getXcalidrawClient();
  
  return configureClient(client, {
    baseURL: config.BASE_API_ENDPOINTS.API,
    token
  });
};

export const useClient = (token?: string) =>
  useMemo(() => getClient(token), [token]);

export type { Client } from '@xcalidraw/client';



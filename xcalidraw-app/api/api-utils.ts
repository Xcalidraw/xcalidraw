import { fetchAuthSession } from 'aws-amplify/auth';
import { AxiosInstance } from 'axios';

interface AxiosClientOpts {
  baseURL?: string;
  token?: string;
  orgId?: string;  // Add orgId option
}

export const configureClient = <ClientType extends AxiosInstance>(
  client: ClientType,
  opts: AxiosClientOpts = {}
) => {
  // set API url
  if (opts.baseURL) {
    client.defaults.baseURL = opts.baseURL;
  }

  // add authorization header and org header
  client.interceptors.request.use(async (request) => {
    const token =
      opts.token ||
      (await fetchAuthSession().then((session) =>
        session.tokens?.idToken?.toString()
      ));

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    // Add X-Organization-Id header (required for multi-org support)
    // TODO: Implement org selection UI and store selected org in state
    const orgId = opts.orgId || localStorage.getItem('currentOrgId');
    
    if (!orgId) {
      // If no orgId, the request will fail with 403
      // This is intentional - user must select an organization first
      console.warn('No organization ID set. User needs to select an organization.');
    } else {
      request.headers['X-Organization-Id'] = orgId;
    }

    return request;
  });

  return client;
};

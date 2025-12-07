import { fetchAuthSession } from 'aws-amplify/auth';
import { AxiosInstance } from 'axios';

interface AxiosClientOpts {
  baseURL?: string;
  token?: string;
}

export const configureClient = <ClientType extends AxiosInstance>(
  client: ClientType,
  opts: AxiosClientOpts = {}
) => {
  // set API url
  if (opts.baseURL) {
    client.defaults.baseURL = opts.baseURL;
  }

  // add authorization header
  client.interceptors.request.use(async (request) => {
    const token =
      opts.token ||
      (await fetchAuthSession().then((session) =>
        session.tokens?.idToken?.toString()
      ));

    if (token) {
      request.headers.authorization = `Bearer ${token}`;
    }

    return request;
  });

  return client;
};

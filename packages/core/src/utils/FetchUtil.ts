import type { RequestCache } from './TypeUtil';

// -- Types ----------------------------------------------------------------------
interface Options {
  baseUrl: string;
  clientId?: string | null;
}

interface RequestArguments {
  path: string;
  headers?: HeadersInit;
  params?: Record<string, string | undefined>;
  cache?: RequestCache;
  signal?: AbortSignal;
}

interface PostArguments extends RequestArguments {
  body?: Record<string, unknown>;
}

// -- Utility --------------------------------------------------------------------
export class FetchUtil {
  public baseUrl: Options['baseUrl'];
  public clientId: Options['clientId'];

  public constructor({ baseUrl, clientId }: Options) {
    this.baseUrl = baseUrl;
    this.clientId = clientId;
  }

  public async get<T>({ headers, signal, ...args }: RequestArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, { method: 'GET', headers, signal });

    return this.processResponse<T>(response);
  }

  public async post<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    });

    return this.processResponse<T>(response);
  }

  public async put<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    });

    return this.processResponse<T>(response);
  }

  public async delete<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    });

    return this.processResponse<T>(response);
  }

  public async fetchImage(path: string, headers?: Record<string, string>) {
    try {
      const url = this.createUrl({ path }).toString();
      const response = await fetch(url, { headers });
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      return new Promise<string>(resolve => {
        reader.onloadend = () => resolve(reader.result as string);
      });
    } catch {
      return undefined;
    }
  }

  private createUrl({ path, params }: RequestArguments) {
    let fullUrl: string;

    const isAbsoluteUrl = path.startsWith('http://') || path.startsWith('https://');

    if (isAbsoluteUrl) {
      fullUrl = path;
    } else {
      const baseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
      const pathUrl = path.startsWith('/') ? path.substring(1) : path;
      fullUrl = `${baseUrl}${pathUrl}`;
    }

    const allParams: Record<string, string | undefined> = { ...params };
    if (this.clientId) {
      allParams['clientId'] = this.clientId;
    }

    const queryParams: string[] = [];
    for (const key in allParams) {
      const value = allParams[key];
      if (value !== undefined && value !== null && value !== '') {
        queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }

    if (queryParams.length > 0) {
      const queryString = queryParams.join('&');
      if (fullUrl.includes('?')) {
        fullUrl = `${fullUrl}&${queryString}`;
      } else {
        fullUrl = `${fullUrl}?${queryString}`;
      }
    }

    return fullUrl;
  }

  private async processResponse<T>(response: Response) {
    if (!response.ok) {
      if (response.headers.get('content-type')?.includes('application/json')) {
        try {
          const errorData = await response.json();

          return Promise.reject(errorData);
        } catch (jsonError) {
          return Promise.reject(`Code: ${response.status} - ${response.statusText}`);
        }
      }

      const errorText = await response.text();

      return Promise.reject(`Code: ${response.status} - ${response.statusText} - ${errorText}`);
    }

    if (response.headers.get('content-length') === '0') {
      return;
    }

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json() as T;
    }

    return;
  }
}

import type { RequestCache } from './TypeUtil';

// -- Types ----------------------------------------------------------------------
interface Options {
  baseUrl: string;
  clientId?: string | null;
}

interface RequestArguments {
  path: string;
  headers?: HeadersInit_;
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

  public async get<T>({ headers, ...args }: RequestArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, { method: 'GET', headers });

    return this.processResponse<T>(response);
  }

  public async post<T>({ body, headers, ...args }: PostArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    return this.processResponse<T>(response);
  }

  public async put<T>({ body, headers, ...args }: PostArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    return this.processResponse<T>(response);
  }

  public async delete<T>({ body, headers, ...args }: PostArguments) {
    const url = this.createUrl(args);
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined
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
    const url = new URL(path, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value);
        }
      });
    }

    if (this.clientId) {
      url.searchParams.append('clientId', this.clientId);
    }

    return url.toString();
  }

  private async processResponse<T>(response: Response) {
    if (!response.ok) {
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

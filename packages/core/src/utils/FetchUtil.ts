import type { RequestCache } from '@reown/appkit-common-react-native';
import { LogController } from '../controllers/LogController';

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

  public async fetchImage(
    path: string,
    headers?: Record<string, string>,
    params?: Record<string, string>
  ) {
    try {
      const url = this.createUrl({ path, params }).toString();
      const response = await fetch(url, { headers });

      // React Native's `fetch(...).blob()` throws "Creating blobs from
      // 'ArrayBuffer' and 'ArrayBufferView' are not supported" for binary
      // responses, so Blob + FileReader can't be used to build the data URL
      // (wallet/network images would silently fail to load). Read the bytes as
      // an ArrayBuffer and base64-encode them into a data URL instead.
      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') ?? 'image/png';

      return `data:${contentType};base64,${FetchUtil._arrayBufferToBase64(arrayBuffer)}`;
    } catch {
      return undefined;
    }
  }

  // Dependency-free base64 encoder (RN has no global `Buffer`/`btoa` guarantee).
  /* eslint-disable no-bitwise */
  private static _arrayBufferToBase64(buffer: ArrayBuffer): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes = new Uint8Array(buffer);
    let base64 = '';

    for (let i = 0; i < bytes.length; i += 3) {
      const byte0 = bytes[i] as number;
      const byte1 = i + 1 < bytes.length ? (bytes[i + 1] as number) : 0;
      const byte2 = i + 2 < bytes.length ? (bytes[i + 2] as number) : 0;

      base64 += chars[byte0 >> 2];
      base64 += chars[((byte0 & 0x03) << 4) | (byte1 >> 4)];
      base64 += i + 1 < bytes.length ? chars[((byte1 & 0x0f) << 2) | (byte2 >> 6)] : '=';
      base64 += i + 2 < bytes.length ? chars[byte2 & 0x3f] : '=';
    }

    return base64;
  }
  /* eslint-enable no-bitwise */

  public createUrl({ path, params }: RequestArguments) {
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
          LogController.sendError(JSON.stringify(errorData), 'FetchUtil.ts', 'processResponse');

          return Promise.reject(errorData);
        } catch (jsonError) {
          LogController.sendError(jsonError, 'FetchUtil.ts', 'processResponse');

          return Promise.reject(`Code: ${response.status} - ${response.statusText}`);
        }
      }

      const errorText = await response.text();
      LogController.sendError(errorText, 'FetchUtil.ts', 'processResponse');

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

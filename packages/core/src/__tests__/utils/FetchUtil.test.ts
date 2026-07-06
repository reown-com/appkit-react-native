import { FetchUtil } from '../../utils/FetchUtil';

describe('FetchUtil', () => {
  const baseUrl = 'https://api.example.com';
  const clientId = 'test-client-id';

  describe('createUrl', () => {
    it('should construct a simple URL with a relative path', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test' });
      expect(url).toBe('https://api.example.com/test');
    });

    it('should handle base URL without a trailing slash', () => {
      const fetchUtil = new FetchUtil({ baseUrl: 'https://api.example.com' });
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test' });
      expect(url).toBe('https://api.example.com/test');
    });

    it('should handle base URL with a trailing slash', () => {
      const fetchUtil = new FetchUtil({ baseUrl: 'https://api.example.com/' });
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test' });
      expect(url).toBe('https://api.example.com/test');
    });

    it('should handle relative path with a leading slash', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: '/test' });
      expect(url).toBe('https://api.example.com/test');
    });

    it('should use the path as is if it is an absolute URL', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'https://another.com/test' });
      expect(url).toBe('https://another.com/test');
    });

    it('should add query parameters to the URL', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      const params = { foo: 'bar', baz: 'qux' };
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test', params });
      expect(url).toBe('https://api.example.com/test?foo=bar&baz=qux');
    });

    it('should add clientId as a query parameter if provided', () => {
      const fetchUtil = new FetchUtil({ baseUrl, clientId });
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test' });
      expect(url).toBe('https://api.example.com/test?clientId=test-client-id');
    });

    it('should combine clientId and other query parameters', () => {
      const fetchUtil = new FetchUtil({ baseUrl, clientId });
      const params = { foo: 'bar' };
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test', params });
      expect(url).toBe('https://api.example.com/test?foo=bar&clientId=test-client-id');
    });

    it('should append to existing query parameters in the path', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      const params = { baz: 'qux' };
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test?foo=bar', params });
      expect(url).toBe('https://api.example.com/test?foo=bar&baz=qux');
    });

    it('should correctly encode special characters in parameters', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      const params = { 'key with space': 'value with &' };
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test', params });
      const expectedUrl = 'https://api.example.com/test?key%20with%20space=value%20with%20%26';
      expect(url).toBe(expectedUrl);
    });

    it('should ignore undefined parameter values', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      const params = { foo: 'bar', baz: undefined };
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'test', params });
      expect(url).toBe('https://api.example.com/test?foo=bar');
    });

    it('should handle absolute URL with params', () => {
      const fetchUtil = new FetchUtil({ baseUrl });
      const params = { foo: 'bar' };
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'https://another.com/test', params });
      expect(url).toBe('https://another.com/test?foo=bar');
    });

    it('should handle absolute URL with existing params and new params', () => {
      const fetchUtil = new FetchUtil({ baseUrl, clientId });
      const params = { bar: 'baz' };
      // @ts-expect-error Testing private method
      const url = fetchUtil.createUrl({ path: 'https://another.com/test?foo=bar', params });
      expect(url).toBe('https://another.com/test?foo=bar&bar=baz&clientId=test-client-id');
    });
  });

  describe('fetchImage', () => {
    const originalFetch = global.fetch;

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should build a base64 data URL from the response ArrayBuffer', async () => {
      // "foobar" -> base64 "Zm9vYmFy"
      const bytes = new Uint8Array([0x66, 0x6f, 0x6f, 0x62, 0x61, 0x72]);
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: async () => bytes.buffer,
        headers: { get: () => 'image/png' }
      }) as unknown as typeof fetch;

      const fetchUtil = new FetchUtil({ baseUrl });
      const result = await fetchUtil.fetchImage('/getWalletImage/1');

      expect(result).toBe('data:image/png;base64,Zm9vYmFy');
    });

    it('should default the content type to image/png when the header is missing', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: async () => new Uint8Array([0x66, 0x6f, 0x6f, 0x62, 0x61, 0x72]).buffer,
        headers: { get: () => null }
      }) as unknown as typeof fetch;

      const fetchUtil = new FetchUtil({ baseUrl });
      const result = await fetchUtil.fetchImage('/getWalletImage/1');

      expect(result).toBe('data:image/png;base64,Zm9vYmFy');
    });

    it('should not call response.blob() (RN cannot build a Blob from an ArrayBuffer)', async () => {
      const blob = jest.fn();
      global.fetch = jest.fn().mockResolvedValue({
        arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
        headers: { get: () => 'image/webp' },
        blob
      }) as unknown as typeof fetch;

      const fetchUtil = new FetchUtil({ baseUrl });
      await fetchUtil.fetchImage('/getWalletImage/1');

      expect(blob).not.toHaveBeenCalled();
    });

    it('should return undefined when the request throws', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('network error')) as unknown as typeof fetch;

      const fetchUtil = new FetchUtil({ baseUrl });
      const result = await fetchUtil.fetchImage('/getWalletImage/1');

      expect(result).toBeUndefined();
    });
  });
});

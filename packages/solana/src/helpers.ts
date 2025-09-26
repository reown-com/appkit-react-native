import type { TokenInfo } from './types';

/**
 * Validates if the given string is a Solana address.
 * @param address The string to validate.
 * @returns True if the address is valid, false otherwise.
 */
export function isSolanaAddress(address: string): boolean {
  const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  return solanaAddressRegex.test(address);
}

/**
 * Helper to fetch SOL balance using JSON-RPC
 * @param rpcUrl Solana RPC endpoint
 * @param address Solana public address (base58)
 */
export async function getSolanaNativeBalance(rpcUrl: string, address: string): Promise<number> {
  if (!isSolanaAddress(address)) {
    throw new Error('Invalid Solana address format');
  }

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [address]
    })
  });

  const json = (await response.json()) as {
    result: { value: number };
    error?: { message: string };
  };
  if (json.error) throw new Error(json.error.message);

  return json.result.value / 1000000000; // Convert lamports to SOL
}

let tokenCache: Record<string, TokenInfo> = {};

/**
 * Fetch metadata for a Solana SPL token using the Jupiter token list.
 * @param mint - The token's mint address
 * @returns TokenInfo if found, or undefined
 */
export async function getSolanaTokenMetadata(mint: string): Promise<TokenInfo | undefined> {
  // Return from cache if available
  if (tokenCache[mint]) return tokenCache[mint];

  try {
    const res = await fetch('https://token.jup.ag/all');
    const list: TokenInfo[] = await res.json();

    for (const token of list) {
      tokenCache[token.address] = token;
    }

    return tokenCache[mint];
  } catch (error) {
    return undefined;
  }
}

/**
 * Get the balance of a token for a given address
 * @param rpcUrl - The RPC URL to use
 * @param address - The address to get the balance for
 * @param tokenAddress - The address of the token to get the balance for
 * @returns The balance of the token for the given address
 */
export async function getSolanaTokenBalance(
  rpcUrl: string,
  address: string,
  tokenAddress: string
): Promise<{ amount: string; symbol: string }> {
  if (!isSolanaAddress(address)) {
    throw new Error('Invalid Solana address format');
  }

  const token = await getSolanaTokenMetadata(tokenAddress);

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getTokenAccountsByOwner',
      params: [address, { mint: tokenAddress }, { encoding: 'jsonParsed' }]
    })
  });

  const result = await response.json();
  const balance = result.result.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;

  return { amount: balance?.toString() ?? '0', symbol: token?.symbol ?? 'SOL' };
}

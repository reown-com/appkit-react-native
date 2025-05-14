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
export async function getSolanaBalance(rpcUrl: string, address: string): Promise<number> {
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

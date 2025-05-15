// Helper to convert Wei (as string or bigint) to ETH
export const formatEther = (wei: bigint): string => {
  return (Number(wei) / 1e18).toString();
};

// Raw JSON-RPC for balance lookup
export async function getEthBalance(rpcUrl: string, address: string): Promise<bigint> {
  const body = {
    jsonrpc: '2.0',
    method: 'eth_getBalance',
    params: [address, 'latest'],
    id: 1
  };

  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const json = await response.json();
  if (json.error) throw new Error(json.error.message);

  return BigInt(json.result); // result is hex string
}

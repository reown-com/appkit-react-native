import { useSnapshot } from 'valtio';
import { ConnectionController } from '../controllers/ConnectionController';

export function useProvider<T>(namespace: string): T | null {
  const { connections } = useSnapshot(ConnectionController.state);
  const connection = connections[namespace];

  if (!connection) return null;

  return (connection.adapter as any).currentConnector?.getProvider() as T;
} 
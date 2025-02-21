import { TIMEOUTS } from '../constants';

export function getMaximumWaitConnections(): number {
  if (process.env.CI) {
    return TIMEOUTS.SESSION_PROPOSAL;
  }

  return TIMEOUTS.SESSION_PROPOSAL * 2;
}

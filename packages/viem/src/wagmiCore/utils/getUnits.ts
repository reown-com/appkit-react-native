import { weiUnits } from 'viem';

export type Unit = 'ether' | 'gwei' | 'wei' | number;

export function getUnit(unit: Unit) {
  if (typeof unit === 'number') return unit;
  if (unit === 'wei') return 0;
  return Math.abs(weiUnits[unit]);
}

import { Hex } from 'viem';

export const CONTRACT_ADDRESS = '0x3Ce7dFE1f9954b5b50A0A802cbf42D0712e2b9eb' as Hex;

export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_name', type: 'string' },
      { internalType: 'string', name: '_symbol', type: 'string' },
      { internalType: 'uint8', name: '_decimals', type: 'uint8' },
      { internalType: 'uint256', name: '_initialSupply', type: 'uint256' },
      { internalType: 'string', name: '_logo', type: 'string' }
    ],
    name: 'createToken',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_initialFee', type: 'uint256' },
      { internalType: 'address payable', name: '_initialReceiver', type: 'address' }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [{ internalType: 'address', name: 'owner', type: 'address' }],
    name: 'OwnableInvalidOwner',
    type: 'error'
  },
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'uint256', name: 'newFee', type: 'uint256' }],
    name: 'CreationFeeChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [{ indexed: false, internalType: 'address', name: 'newReceiver', type: 'address' }],
    name: 'FeeReceiverChanged',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
      { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '_newFee', type: 'uint256' }],
    name: 'setCreationFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address payable', name: '_newReceiver', type: 'address' }],
    name: 'setFeeReceiver',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'tokenAddress', type: 'address' },
      { indexed: false, internalType: 'string', name: 'name', type: 'string' },
      { indexed: false, internalType: 'string', name: 'symbol', type: 'string' },
      { indexed: false, internalType: 'uint8', name: 'decimals', type: 'uint8' },
      { indexed: false, internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'logo', type: 'string' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' }
    ],
    name: 'TokenCreated',
    type: 'event'
  },
  {
    inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'allTokenInfo',
    outputs: [
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
      { internalType: 'string', name: 'name', type: 'string' },
      { internalType: 'string', name: 'symbol', type: 'string' },
      { internalType: 'uint8', name: 'decimals', type: 'uint8' },
      { internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
      { internalType: 'string', name: 'logo', type: 'string' },
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'uint256', name: 'creationTime', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'createdTokens',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'creationFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'feeReceiver',
    outputs: [{ internalType: 'address payable', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getAllTokenDetails',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenAddress', type: 'address' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          { internalType: 'uint8', name: 'decimals', type: 'uint8' },
          { internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
          { internalType: 'string', name: 'logo', type: 'string' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'creationTime', type: 'uint256' }
        ],
        internalType: 'struct TokenFactory.TokenInfo[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTokenCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'tokenAddress', type: 'address' }],
    name: 'getTokenDetails',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenAddress', type: 'address' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          { internalType: 'uint8', name: 'decimals', type: 'uint8' },
          { internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
          { internalType: 'string', name: 'logo', type: 'string' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'creationTime', type: 'uint256' }
        ],
        internalType: 'struct TokenFactory.TokenInfo',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserTokenDetails',
    outputs: [
      {
        components: [
          { internalType: 'address', name: 'tokenAddress', type: 'address' },
          { internalType: 'string', name: 'name', type: 'string' },
          { internalType: 'string', name: 'symbol', type: 'string' },
          { internalType: 'uint8', name: 'decimals', type: 'uint8' },
          { internalType: 'uint256', name: 'totalSupply', type: 'uint256' },
          { internalType: 'string', name: 'logo', type: 'string' },
          { internalType: 'address', name: 'creator', type: 'address' },
          { internalType: 'uint256', name: 'creationTime', type: 'uint256' }
        ],
        internalType: 'struct TokenFactory.TokenInfo[]',
        name: '',
        type: 'tuple[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserTokens',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'uint256', name: '', type: 'uint256' }
    ],
    name: 'userCreatedTokens',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * ABI for the PortfolioActionAgent Solidity contract.
 * Matches the contract at contracts/PortfolioActionAgent.sol
 *
 * The contract uses:
 * - ActionType enum (uint8): 0=REBALANCE, 1=REDUCE_EXPOSURE, 2=INCREASE_EXPOSURE, 3=HOLD
 * - ActionStatus enum (uint8): 0=PENDING, 1=EXECUTED, 2=CANCELLED
 * - targetExposureBps: basis points (0-10000)
 * - recommendationHash: bytes32 keccak of off-chain recommendation ID
 */
export const PORTFOLIO_ACTION_AGENT_ABI = [
  // ── Write Functions ──
  {
    type: 'function',
    name: 'recordAction',
    inputs: [
      { name: '_actionType', type: 'uint8' },
      { name: '_asset', type: 'string' },
      { name: '_targetExposureBps', type: 'uint256' },
      { name: '_recommendationHash', type: 'bytes32' },
    ],
    outputs: [{ name: 'actionId', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'cancelAction',
    inputs: [{ name: '_actionId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },

  // ── Read Functions ──
  {
    type: 'function',
    name: 'getAction',
    inputs: [{ name: '_actionId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'user', type: 'address' },
          { name: 'actionType', type: 'uint8' },
          { name: 'asset', type: 'string' },
          { name: 'targetExposureBps', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'recommendationHash', type: 'bytes32' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserActionIds',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getUserActionCount',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isAssetSupported',
    inputs: [{ name: '_asset', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getSupportedAssets',
    inputs: [],
    outputs: [{ name: '', type: 'string[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'nextActionId',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },

  // ── Events ──
  {
    type: 'event',
    name: 'ActionRecorded',
    inputs: [
      { indexed: true, name: 'actionId', type: 'uint256' },
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'actionType', type: 'uint8' },
      { indexed: false, name: 'asset', type: 'string' },
      { indexed: false, name: 'targetExposureBps', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
      { indexed: false, name: 'recommendationHash', type: 'bytes32' },
    ],
  },
  {
    type: 'event',
    name: 'ActionStatusUpdated',
    inputs: [
      { indexed: true, name: 'actionId', type: 'uint256' },
      { indexed: false, name: 'newStatus', type: 'uint8' },
    ],
  },

  // ── Errors ──
  {
    type: 'error',
    name: 'UnsupportedAsset',
    inputs: [{ name: 'asset', type: 'string' }],
  },
  {
    type: 'error',
    name: 'InvalidExposure',
    inputs: [{ name: 'exposureBps', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'ActionNotFound',
    inputs: [{ name: 'actionId', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'NotActionOwner',
    inputs: [
      { name: 'actionId', type: 'uint256' },
      { name: 'caller', type: 'address' },
    ],
  },
  {
    type: 'error',
    name: 'TooManyActions',
    inputs: [{ name: 'user', type: 'address' }],
  },
  {
    type: 'error',
    name: 'ActionAlreadyFinalized',
    inputs: [{ name: 'actionId', type: 'uint256' }],
  },
] as const;

/**
 * Map ActionType string to contract enum value (uint8)
 */
export const ACTION_TYPE_MAP: Record<string, number> = {
  REBALANCE: 0,
  REDUCE_EXPOSURE: 1,
  INCREASE_EXPOSURE: 2,
  HOLD: 3,
};

/**
 * Map contract enum value back to ActionType string
 */
export const ACTION_TYPE_REVERSE_MAP: Record<number, string> = {
  0: 'REBALANCE',
  1: 'REDUCE_EXPOSURE',
  2: 'INCREASE_EXPOSURE',
  3: 'HOLD',
};

/**
 * Map ActionStatus enum
 */
export const ACTION_STATUS_MAP: Record<number, string> = {
  0: 'PENDING',
  1: 'EXECUTED',
  2: 'CANCELLED',
};

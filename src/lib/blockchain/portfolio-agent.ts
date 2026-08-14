import { PublicClient, WalletClient, Address, keccak256, toHex } from 'viem';
import { PORTFOLIO_ACTION_AGENT_ABI, ACTION_TYPE_MAP, ACTION_TYPE_REVERSE_MAP, ACTION_STATUS_MAP } from './contracts';
import { ActionType } from '@/types';

export interface ActionRecord {
  actionType: ActionType;
  asset: string;
  targetExposure: number; // 0-1
  recommendationId: string;
}

export interface OnChainAction {
  user: string;
  actionType: string;
  asset: string;
  targetExposure: number;
  timestamp: string;
  status: string;
  recommendationHash: string;
}

/**
 * Record a portfolio action on-chain via the PortfolioActionAgent contract.
 * The user's wallet signs and sends the transaction.
 */
export async function recordAction(
  walletClient: WalletClient,
  publicClient: PublicClient,
  contractAddress: Address,
  action: ActionRecord
) {
  if (!walletClient.account) {
    throw new Error('Wallet client has no account');
  }

  const actionTypeValue = ACTION_TYPE_MAP[action.actionType];
  if (actionTypeValue === undefined) {
    throw new Error(`Unknown action type: ${action.actionType}`);
  }

  const targetExposureBps = BigInt(Math.round(action.targetExposure * 10000));
  const recommendationHash = keccak256(toHex(action.recommendationId));

  const { request } = await publicClient.simulateContract({
    account: walletClient.account,
    address: contractAddress,
    abi: PORTFOLIO_ACTION_AGENT_ABI,
    functionName: 'recordAction',
    args: [actionTypeValue, action.asset, targetExposureBps, recommendationHash],
  });

  const hash = await walletClient.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  return receipt;
}

/**
 * Read a single action from the contract by ID.
 */
export async function getAction(
  publicClient: PublicClient,
  contractAddress: Address,
  actionId: bigint
): Promise<OnChainAction> {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: PORTFOLIO_ACTION_AGENT_ABI,
    functionName: 'getAction',
    args: [actionId],
  }) as {
    user: string;
    actionType: number;
    asset: string;
    targetExposureBps: bigint;
    timestamp: bigint;
    status: number;
    recommendationHash: string;
  };

  return {
    user: result.user,
    actionType: ACTION_TYPE_REVERSE_MAP[result.actionType] || 'UNKNOWN',
    asset: result.asset,
    targetExposure: Number(result.targetExposureBps) / 10000,
    timestamp: new Date(Number(result.timestamp) * 1000).toISOString(),
    status: ACTION_STATUS_MAP[result.status] || 'UNKNOWN',
    recommendationHash: result.recommendationHash,
  };
}

/**
 * Get all action IDs for a user.
 */
export async function getUserActionIds(
  publicClient: PublicClient,
  contractAddress: Address,
  userAddress: Address
): Promise<readonly bigint[]> {
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: PORTFOLIO_ACTION_AGENT_ABI,
    functionName: 'getUserActionIds',
    args: [userAddress],
  });

  return result as readonly bigint[];
}

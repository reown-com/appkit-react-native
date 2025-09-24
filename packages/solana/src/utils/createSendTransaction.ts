import {
  ComputeBudgetProgram,
  type Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';

// import type { Provider } from '@reown/appkit-utils/solana'

type SendTransactionArgs = {
  connection: Connection;
  fromAddress: string;
  toAddress: string;
  amount: number;
};

/**
 * These constants defines the cost of running the program, allowing to calculate the maximum
 * amount of SOL that can be sent in case of cleaning the account and remove the rent exemption error.
 */
const COMPUTE_BUDGET_CONSTANTS = {
  UNIT_PRICE_MICRO_LAMPORTS: 1000000,
  UNIT_LIMIT: 500
};

export async function createSendTransaction({
  fromAddress,
  toAddress,
  amount,
  connection
}: SendTransactionArgs): Promise<Transaction> {
  const fromPubkey = new PublicKey(fromAddress);
  const toPubkey = new PublicKey(toAddress);
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

  const { blockhash } = await connection.getLatestBlockhash();

  const instructions = [
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: COMPUTE_BUDGET_CONSTANTS.UNIT_PRICE_MICRO_LAMPORTS
    }),
    ComputeBudgetProgram.setComputeUnitLimit({ units: COMPUTE_BUDGET_CONSTANTS.UNIT_LIMIT }),
    SystemProgram.transfer({
      fromPubkey,
      toPubkey,
      lamports
    })
  ];

  const transaction = new Transaction().add(...instructions);
  transaction.feePayer = fromPubkey;
  transaction.recentBlockhash = blockhash;

  return transaction;
}

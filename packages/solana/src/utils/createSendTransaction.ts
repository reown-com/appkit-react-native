import {
  type Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from '@solana/web3.js';

type SendTransactionArgs = {
  connection: Connection;
  fromAddress: string;
  toAddress: string;
  amount: number;
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

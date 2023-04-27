import { utf8ToHex } from '@walletconnect/encoding';
import { ethers } from 'ethers';
import { recoverAddress } from '@ethersproject/transactions';
import { hashMessage } from '@ethersproject/hash';
import type { Bytes, SignatureLike } from '@ethersproject/bytes';

export function verifyMessage(
  message: Bytes | string,
  signature: SignatureLike
): string {
  return recoverAddress(hashMessage(message), signature);
}

const verifyEip155MessageSignature = (
  message: string,
  signature: string,
  address: string
) => verifyMessage(message, signature).toLowerCase() === address.toLowerCase();

export const testSignMessage = async (
  web3Provider?: ethers.providers.Web3Provider
) => {
  if (!web3Provider) {
    throw new Error('web3Provider not connected');
  }
  const msg = 'Hello World';
  const hexMsg = utf8ToHex(msg, true);
  const [address] = await web3Provider.listAccounts();
  const signature = await web3Provider.send('personal_sign', [hexMsg, address]);
  const valid = verifyEip155MessageSignature(msg, signature, address!);
  return {
    method: 'personal_sign',
    address,
    valid,
    result: signature,
  };
};

export const testSendTransaction = async (
  web3Provider?: ethers.providers.Web3Provider
) => {
  if (!web3Provider) {
    throw new Error('web3Provider not connected');
  }

  // Get the signer from the UniversalProvider
  const signer = web3Provider.getSigner();

  const amount = ethers.utils.parseEther('0.0001');
  const address = '0x0000000000000000000000000000000000000000';
  const transaction = {
    to: address,
    value: amount,
    chainId: 5,
  };

  // Send the transaction using the signer
  const txResponse = await signer.sendTransaction(transaction);
  const transactionHash = txResponse.hash;
  console.log('transactionHash is ' + transactionHash);

  // Wait for the transaction to be mined (optional)
  const receipt = await txResponse.wait();
  console.log('Transaction was mined in block:', receipt.blockNumber);

  return {
    method: 'eth_sendTransaction',
    address,
    transactionHash,
  };
};

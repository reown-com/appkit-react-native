const contractAddress = 'dai.tokens.ethers.eth';
const balanceAddress = 'ricmoo.firefly.eth';

const readContractAbi = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function balanceOf(address) view returns (uint)',
];

const writeContractAbi = [
  'function transfer(address to, uint amount)',
  'function isValidSignature(bytes32 hash, bytes memory signature)',
];

const getFilterChangesAbi = [
  'event Transfer(address indexed from, address indexed to, uint amount)',
];

export default {
  contractAddress,
  balanceAddress,
  readContractAbi,
  writeContractAbi,
  getFilterChangesAbi,
};

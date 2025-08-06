import { ethers } from 'ethers';
import contractABI from '../contracts/MyDAOToken.json';
import daoFactoryABI from '../contracts/DAOFactory.json';
import daoGovernanceABI from '../contracts/DAOGovernance.json';

// コントラクト設定
export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
export const DAO_FACTORY_ADDRESS = '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6';

// モックウォレット設定
export const MOCK_WALLET = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  privateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};

// ネットワーク設定
export const NETWORK_CONFIG = {
  chainId: 1337,
  name: 'Hardhat Local',
  rpcUrl: 'http://127.0.0.1:8545',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

// プロバイダー設定
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
};

// モックウォレットのプロバイダー取得
export const getMockProvider = () => {
  const provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
  const wallet = new ethers.Wallet(MOCK_WALLET.privateKey, provider);
  return { provider, wallet };
};

// コントラクトインスタンス取得
export const getContract = (signer?: ethers.Signer) => {
  const provider = getProvider();
  const contractSigner = signer || provider;
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, contractSigner);
};

// モックウォレット用コントラクトインスタンス取得
export const getMockContract = () => {
  const { wallet } = getMockProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, wallet);
};

// DAOファクトリーインスタンス取得
export const getDAOFactory = (signer?: ethers.Signer) => {
  const provider = getProvider();
  const contractSigner = signer || provider;
  return new ethers.Contract(DAO_FACTORY_ADDRESS, daoFactoryABI.abi, contractSigner);
};

// モックウォレット用DAOファクトリーインスタンス取得
export const getMockDAOFactory = () => {
  const { wallet } = getMockProvider();
  return new ethers.Contract(DAO_FACTORY_ADDRESS, daoFactoryABI.abi, wallet);
};

// DAOガバナンスインスタンス取得
export const getDAOGovernance = (address: string, signer?: ethers.Signer) => {
  const provider = getProvider();
  const contractSigner = signer || provider;
  return new ethers.Contract(address, daoGovernanceABI.abi, contractSigner);
};

// モックウォレット用DAOガバナンスインスタンス取得
export const getMockDAOGovernance = (address: string) => {
  const { wallet } = getMockProvider();
  return new ethers.Contract(address, daoGovernanceABI.abi, wallet);
}; 